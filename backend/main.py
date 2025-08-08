from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import numpy as np
import cv2
from PIL import Image
import io
import base64
from datetime import datetime, date
import json
from typing import List, Optional
import os
from supabase import create_client, Client

# Load environment variables (optional)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed, using default environment variables")
except Exception as e:
    print(f"Error loading .env file: {e}, using default environment variables")

app = FastAPI(title="Face Recognition Attendance System", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5175", "http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL", "https://wgfhloiwczqlexogvrgc.supabase.co")
supabase_key = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZmhsb2l3Y3pxbGV4b2d2cmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjE2MjQsImV4cCI6MjA2OTY5NzYyNH0.g5zXHZ6qXZwlEK21HqkH1sFc3JMjF5M1Io5Se5iR4H0")
supabase: Client = create_client(supabase_url, supabase_key)

def get_face_embedding(image_data: bytes) -> np.ndarray:
    """
    Simplified face embedding using basic image features.
    In production, this should use a proper face recognition model.
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image data")
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Use Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            # If no face detected, use the entire image as fallback
            print("Warning: No face detected, using entire image")
            face_roi = cv2.resize(gray, (64, 64))
        else:
            # For simplicity, use the first detected face
            x, y, w, h = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            # Resize to standard size
            face_roi = cv2.resize(face_roi, (64, 64))
        
        # Create a simple "embedding" (flattened pixel values)
        embedding = face_roi.flatten().astype(np.float32) / 255.0
        
        return embedding
    except Exception as e:
        print(f"Error in face embedding: {str(e)}")
        # Return a default embedding if face detection fails
        default_embedding = np.zeros(64 * 64, dtype=np.float32)
        return default_embedding

def cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings."""
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    return dot_product / (norm1 * norm2)

def detect_faces_with_confidence(image_data: bytes) -> List[dict]:
    """Detect faces in image and return bounding boxes with confidence scores."""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Invalid image data")
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Use Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        detected_faces = []
        for (x, y, w, h) in faces:
            # Calculate confidence based on face size and position
            face_area = w * h
            image_area = img.shape[0] * img.shape[1]
            area_ratio = face_area / image_area
            
            # Confidence based on face size (larger faces = higher confidence)
            confidence = min(0.95, max(0.6, area_ratio * 10))
            
            detected_faces.append({
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h),
                "confidence": round(confidence * 100, 1)
            })
        
        return detected_faces
    except Exception as e:
        print(f"Error in face detection: {str(e)}")
        return []

@app.get("/")
async def root():
    return {"message": "Face Recognition Attendance System API", "status": "running"}

@app.get("/test")
async def test_endpoint():
    return {"message": "Backend is working", "timestamp": datetime.now().isoformat()}

@app.get("/debug/students")
async def debug_students():
    """Debug endpoint to check students in database."""
    try:
        result = supabase.table("students").select("*").execute()
        students = result.data or []
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "total_students": len(students),
                "students": [{"name": s["name"], "roll_number": s["roll_number"]} for s in students]
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )

@app.get("/debug/attendance")
async def debug_attendance():
    """Debug endpoint to check attendance table structure."""
    try:
        # Try to get one record to see the structure
        result = supabase.table("attendance").select("*").limit(1).execute()
        sample_record = result.data[0] if result.data else {}
        
        # Get all attendance records for today
        today = date.today().isoformat()
        today_result = supabase.table("attendance").select("*").eq("date", today).execute()
        today_records = today_result.data or []
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "sample_record_structure": sample_record,
                "today_records": today_records,
                "total_today": len(today_records)
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )

@app.post("/debug/add-test-attendance")
async def add_test_attendance():
    """Debug endpoint to add a test attendance record."""
    try:
        today = date.today().isoformat()
        
        # Get first student from database
        students_result = supabase.table("students").select("*").limit(1).execute()
        if not students_result.data:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "No students found in database"}
            )
        
        student = students_result.data[0]
        
        # Add test attendance
        attendance_data = {
            "student_id": student["id"],
            "date": today,
            "time": datetime.now().isoformat(),
            "similarity_score": 0.85
        }
        
        result = supabase.table("attendance").insert(attendance_data).execute()
        print(f"DEBUG: Test attendance added: {attendance_data}")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"Test attendance added for {student['name']}",
                "attendance_data": attendance_data
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )

@app.post("/detect-faces")
async def detect_faces(image: UploadFile = File(...)):
    """Detect all faces in the uploaded image and return bounding boxes with confidence scores."""
    try:
        image_data = await image.read()
        detected_faces = detect_faces_with_confidence(image_data)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "detected_faces": detected_faces,
                "total_faces": len(detected_faces)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")

@app.post("/register")
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    year: str = Form(...),
    session: str = Form(...),
    images: List[UploadFile] = File(...)
):
    """Register a new student with face images."""
    try:
        print(f"Registration request received for student: {name} ({roll_number})")
        print(f"Year: {year}, Session: {session}")
        print(f"Number of images received: {len(images)}")
        
        if len(images) < 5:
            print("Error: Insufficient images provided")
            raise HTTPException(status_code=400, detail="At least 5 face images are required")
        
        if len(images) > 10:
            print("Error: Too many images provided")
            raise HTTPException(status_code=400, detail="Maximum 10 face images allowed")
        
        # Check if student already exists in Supabase
        try:
            existing_student = supabase.table("students").select("roll_number").eq("roll_number", roll_number).execute()
            if existing_student.data and len(existing_student.data) > 0:
                print(f"Error: Student with roll number {roll_number} already exists in Supabase")
                raise HTTPException(status_code=400, detail=f"Student with roll number {roll_number} already exists")
        except Exception as e:
            print(f"Error checking existing student: {str(e)}")
            # Continue with registration if check fails
        
        print("Processing images and creating embeddings...")
        # Process images and create embeddings
        embeddings = []
        for i, image in enumerate(images):
            try:
                print(f"Processing image {i+1}...")
                image_data = await image.read()
                print(f"Image {i+1} data size: {len(image_data)} bytes")
                embedding = get_face_embedding(image_data)
                embeddings.append(embedding.tolist())
                print(f"Processed image {i+1}/{len(images)}")
            except Exception as e:
                print(f"Error processing image {i+1}: {str(e)}")
                # Continue with other images even if one fails
                continue
        
        if len(embeddings) == 0:
            print("Error: No valid images could be processed")
            raise HTTPException(status_code=400, detail="No valid images could be processed")
        
        print(f"Created {len(embeddings)} embeddings successfully")
        
        # Store student data in Supabase
        student_id = None
        try:
            print("Uploading images to Supabase Storage...")
            image_urls = []
            for i, image in enumerate(images):
                try:
                    image_data = await image.read()
                    image_path = f"{roll_number}/image_{i}.jpg"
                    
                    # Upload to Supabase Storage
                    storage_result = supabase.storage.from_("student-images").upload(
                        image_path, 
                        image_data,
                        {"content-type": "image/jpeg"}
                    )
                    
                    if storage_result.error:
                        print(f"Error uploading image {i+1}: {storage_result.error}")
                        continue
                    
                    # Get public URL
                    url_result = supabase.storage.from_("student-images").get_public_url(image_path)
                    image_urls.append(url_result)
                    print(f"Uploaded image {i+1} to Supabase Storage: {url_result}")
                    
                except Exception as e:
                    print(f"Error uploading image {i+1}: {str(e)}")
                    continue
            
            print("Storing student data in Supabase Database...")
            student_data = {
                "name": name,
                "roll_number": roll_number,
                "year": year,
                "session": session,
                "face_embeddings": embeddings,
                "image_urls": image_urls,
                "registration_date": datetime.now().isoformat()
            }
            
            print(f"Student data prepared: {student_data}")
            
            # Insert into Supabase
            result = supabase.table("students").insert(student_data).execute()
            print(f"Supabase insert result: {result}")
            print(f"Student stored in Supabase: {name} ({roll_number})")
            student_id = result.data[0]['id'] if result.data else None
            
        except Exception as e:
            print(f"Error storing in Supabase: {str(e)}")
            print(f"Supabase error type: {type(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to store student data: {str(e)}")
        
        print(f"Successfully registered student: {name} ({roll_number})")
        print(f"Student ID: {student_id}")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Student registered successfully",
                "student_id": student_id,
                "embeddings": embeddings  # Return embeddings for Supabase storage
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/recognize")
async def recognize_student(image: UploadFile = File(...)):
    """Recognize all students in the uploaded image and mark attendance for each recognized face. Each student can only be matched once per image, and only the best match per face is returned."""
    try:
        print("=== RECOGNITION START ===")
        image_data = await image.read()
        print(f"Image data size: {len(image_data)} bytes")
        
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        print(f"Image shape: {img.shape}")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        print(f"Detected {len(faces)} faces")
        
        recognized_students = []
        already_present_students = []
        today = date.today().isoformat()
        threshold = 0.70  # Lower threshold for better recognition
        matched_roll_numbers = set()
        
        # Get detected faces with bounding boxes
        detected_faces = detect_faces_with_confidence(image_data)
        
        # Get students from Supabase
        try:
            print("Fetching students from Supabase...")
            students_result = supabase.table("students").select("*").execute()
            students_db = {}
            for student in students_result.data:
                students_db[student["roll_number"]] = student
            print(f"Loaded {len(students_db)} students from Supabase for recognition")
            print(f"Available students: {list(students_db.keys())}")
        except Exception as e:
            print(f"Error loading students from Supabase: {str(e)}")
            students_db = {}
        
        if len(students_db) == 0:
            print("WARNING: No students found in Supabase database!")
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "recognized_students": [],
                    "already_present_students": [],
                    "detected_faces": detected_faces,
                    "total_found": 0,
                    "total_already_present": 0,
                    "message": "No students registered in the system"
                }
            )
        
        if len(faces) == 0:
            # fallback: try to recognize the whole image as one face
            print("No faces detected, using entire image as fallback")
            faces = [(0, 0, gray.shape[1], gray.shape[0])]
        
        for (x, y, w, h) in faces:
            print(f"Processing face at ({x},{y},{w},{h})")
            face_roi = gray[y:y+h, x:x+w]
            face_roi = cv2.resize(face_roi, (64, 64))
            embedding = face_roi.flatten().astype(np.float32) / 255.0
            best_similarity = 0
            best_student = None
            best_roll_number = None
            
            for roll_number, student in students_db.items():
                if roll_number in matched_roll_numbers:
                    continue  # Don't match the same student twice
                for stored_embedding in student["face_embeddings"]:
                    similarity = cosine_similarity(embedding, np.array(stored_embedding))
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_student = student
                        best_roll_number = roll_number
            
            print(f"Face at ({x},{y},{w},{h}): Best match: {best_roll_number}, Similarity: {best_similarity}")
            
            if best_student and best_similarity > threshold and best_roll_number not in matched_roll_numbers:
                print(f"✅ MATCH FOUND: {best_student['name']} ({best_roll_number}) with similarity {best_similarity:.3f} > threshold {threshold}")
                matched_roll_numbers.add(best_roll_number)
                status = "present"
                
                # Check if student is already present today in Supabase
                try:
                    print(f"Checking existing attendance for student {best_student['id']} on {today}")
                    existing_attendance = supabase.table("attendance").select("*").eq("student_id", best_student["id"]).eq("date", today).execute()
                    
                    if existing_attendance.data and len(existing_attendance.data) > 0:
                        status = "already_present"
                        already_present_students.append({
                            "name": best_student["name"],
                            "roll_number": best_student["roll_number"],
                            "year": best_student["year"],
                            "session": best_student["session"],
                            "similarity_score": float(best_similarity),
                            "face_box": {
                                "x": int(x),
                                "y": int(y),
                                "width": int(w),
                                "height": int(h)
                            }
                        })
                        print(f"⚠️ Student {best_student['name']} already marked present today")
                    else:
                        # Store attendance record in Supabase
                        attendance_data = {
                            "student_id": best_student["id"],
                            "date": today,
                            "time": datetime.now().isoformat(),
                            "similarity_score": best_similarity
                        }
                        
                        print(f"Storing attendance data: {attendance_data}")
                        supabase.table("attendance").insert(attendance_data).execute()
                        print(f"✅ Attendance recorded in Supabase for {best_student['name']} ({best_roll_number})")
                        print(f"DEBUG: Attendance data stored: {attendance_data}")
                        
                        recognized_students.append({
                            "name": best_student["name"],
                            "roll_number": best_student["roll_number"],
                            "year": best_student["year"],
                            "session": best_student["session"],
                            "similarity_score": float(best_similarity),
                            "status": status,
                            "face_box": {
                                "x": int(x),
                                "y": int(y),
                                "width": int(w),
                                "height": int(h)
                            }
                        })
                        
                except Exception as e:
                    print(f"❌ Error checking/storing attendance in Supabase: {str(e)}")
                    print(f"Error type: {type(e)}")
                    import traceback
                    print(f"Traceback: {traceback.format_exc()}")
                    # Continue without storing if Supabase fails
                    pass
            else:
                if best_student:
                    print(f"❌ NO MATCH: Best similarity {best_similarity:.3f} < threshold {threshold} for {best_student['name']}")
                else:
                    print(f"❌ NO MATCH: No student found for face at ({x},{y},{w},{h})")
        
        print(f"=== RECOGNITION COMPLETE ===")
        print(f"Recognized: {len(recognized_students)}, Already Present: {len(already_present_students)}")
        
        # Convert any remaining NumPy types to Python native types for JSON serialization
        def convert_numpy_types(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {key: convert_numpy_types(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            else:
                return obj
        
        # Convert all data to JSON-serializable types
        serializable_recognized = convert_numpy_types(recognized_students)
        serializable_already_present = convert_numpy_types(already_present_students)
        serializable_detected_faces = convert_numpy_types(detected_faces)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "recognized_students": serializable_recognized,
                "already_present_students": serializable_already_present,
                "detected_faces": serializable_detected_faces,
                "total_found": len(recognized_students),
                "total_already_present": len(already_present_students)
            }
        )
    except Exception as e:
        print(f"❌ RECOGNITION ERROR: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")

@app.get("/attendance")
async def get_attendance():
    """Get today's attendance records."""
    try:
        today = date.today().isoformat()
        
        # Get attendance records from Supabase
        result = supabase.table("attendance").select("*").eq("date", today).execute()
        today_records = result.data or []
        
        print(f"DEBUG: Found {len(today_records)} attendance records for today ({today})")
        for record in today_records:
            print(f"DEBUG: Record - {record}")
        
        # Get all students for lookup
        students_result = supabase.table("students").select("*").execute()
        students_lookup = {}
        for student in students_result.data:
            students_lookup[str(student["id"])] = student  # Convert to string for UUID comparison
        
        # Format the records for frontend display
        formatted_records = []
        for record in today_records:
            student_id = str(record.get("student_id", ""))  # Convert to string
            student = students_lookup.get(student_id, {})
            
            # Convert any NumPy types to Python native types
            similarity_score = record.get("similarity_score", 0)
            if hasattr(similarity_score, 'item'):  # Check if it's a NumPy type
                similarity_score = float(similarity_score)
            
            formatted_records.append({
                "student_name": student.get("name", "Unknown"),
                "roll_number": student.get("roll_number", "Unknown"),
                "year": student.get("year", "Unknown"),
                "session": student.get("session", "Unknown"),
                "time": record.get("time", ""),
                "similarity_score": similarity_score
            })
        
        # Sort by time
        formatted_records.sort(key=lambda x: x.get("time", ""))
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "attendance_records": formatted_records,
                "total_present": len(formatted_records)
            }
        )
        
    except Exception as e:
        print(f"Error fetching attendance: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "attendance_records": [],
                "total_present": 0,
                "error": str(e)
            }
        )

@app.get("/students")
async def get_students():
    """Get all registered students."""
    try:
        # Get from Supabase
        result = supabase.table("students").select("*").execute()
        students_list = result.data or []
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "students": students_list,
                "total_students": len(students_list)
            }
        )
        
    except Exception as e:
        print(f"Error fetching students: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "students": [],
                "total_students": 0,
                "error": str(e)
            }
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 