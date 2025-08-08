# Face Recognition Attendance System

A complete full-stack web application for real-time face recognition-based attendance marking for classrooms of up to 80 students.

## 🚀 Features

### Core Functionality
- **Student Registration**: Register students with 5-10 face images for recognition
- **Real-time Face Recognition**: Capture live images and automatically recognize students
- **Attendance Marking**: Automatically mark attendance with similarity scoring
- **Duplicate Prevention**: Prevent multiple attendance entries for the same student on the same day
- **Attendance History**: View today's attendance records with timestamps
- **Student Management**: View and search through all registered students

### Technical Features
- **Modern UI**: Responsive design with Tailwind CSS and custom components
- **Real-time Webcam**: Live image capture using `react-webcam`
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Face Detection**: OpenCV-based face detection and recognition
- **In-memory Storage**: Simple storage for development (easily replaceable with Firebase/Supabase)

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **React Webcam** for camera integration
- **Lucide React** for icons
- **Custom UI Components** (simplified from shadcn/ui)

### Backend
- **FastAPI** for RESTful API
- **OpenCV** for face detection and image processing
- **NumPy** for numerical computations
- **Uvicorn** as ASGI server
- **Python 3.13+** compatible

### Development Tools
- **Vite** for frontend bundling
- **ESLint** for code quality
- **PostCSS** for CSS processing

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js 18+** installed
- **Python 3.13+** installed
- **Webcam** for face capture functionality
- **Modern browser** with camera permissions

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows
```bash
# Run the setup script
setup.bat

# Start the application
start.bat

# Stop the application
stop.bat
```

#### Linux/macOS
```bash
# Make setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh

# Start the application
./start.sh

# Stop the application
./stop.sh
```

### Option 2: Manual Setup

#### 1. Clone and Navigate
```bash
cd developer
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

#### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🌐 Access Points

Once running, access the application at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage Guide

### 1. Student Registration

1. Navigate to the "Student Registration" tab
2. Fill in student details:
   - Full Name
   - Roll Number
   - Year (1st-4th Year)
   - Session (2023-2024, 2024-2025, 2025-2026)
3. Capture 5-10 clear face images using the webcam
4. Click "Register Student" to save

### 2. Marking Attendance

1. Navigate to the "Mark Attendance" tab
2. Click "Capture Attendance" to take a photo
3. The system will automatically:
   - Detect faces in the image
   - Compare with registered students
   - Mark attendance for recognized students
   - Show similarity scores
4. View results and today's attendance history

### 3. View Students

1. Navigate to the "Students List" tab
2. View all registered students
3. Use search and filters to find specific students
4. See registration dates and details

## 🔧 API Endpoints

### Health Check
- `GET /` - System status

### Student Management
- `POST /register` - Register new student with face images
- `GET /students` - Get all registered students

### Attendance
- `POST /recognize` - Recognize students and mark attendance
- `GET /attendance` - Get today's attendance records

## 🧠 Face Recognition Logic

### Registration Process
1. **Image Capture**: 5-10 face images per student
2. **Face Detection**: OpenCV Haar Cascade for face detection
3. **Feature Extraction**: Convert face regions to 64x64 grayscale embeddings
4. **Storage**: Store embeddings with student data

### Recognition Process
1. **Image Capture**: Single image from webcam
2. **Face Detection**: Detect faces in the image
3. **Feature Extraction**: Create embeddings for detected faces
4. **Similarity Comparison**: Cosine similarity with stored embeddings
5. **Threshold Check**: Match if similarity > 0.7
6. **Attendance Marking**: Mark present if not already marked today

## 🔒 Security Considerations

### Development Mode
- In-memory storage (data lost on restart)
- No authentication required
- CORS enabled for localhost

### Production Recommendations
- Implement Firebase/Supabase for persistent storage
- Add user authentication and authorization
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend Deployment (Render/Railway)
1. Create `requirements.txt` (already included)
2. Set environment variables
3. Deploy to your preferred platform

## 🐛 Troubleshooting

### Common Issues

#### Frontend Issues
- **Camera not working**: Ensure browser has camera permissions
- **Build errors**: Clear `node_modules` and reinstall
- **Port conflicts**: Change port in `vite.config.js`

#### Backend Issues
- **Import errors**: Ensure all dependencies are installed
- **Port conflicts**: Change port in `main.py`
- **Face detection fails**: Ensure good lighting and clear face images

#### General Issues
- **CORS errors**: Check backend CORS configuration
- **Network errors**: Ensure both servers are running
- **Memory issues**: Restart servers if needed

### Debug Mode
```bash
# Frontend debug
npm run dev -- --debug

# Backend debug
python main.py --log-level debug
```

## 📁 Project Structure

```
developer/
├── src/
│   ├── components/
│   │   ├── ui/                 # Custom UI components
│   │   ├── WebcamCapture.jsx   # Camera integration
│   │   ├── StudentRegistration.jsx
│   │   ├── AttendanceCapture.jsx
│   │   └── StudentsList.jsx
│   ├── lib/
│   │   └── utils.js           # Utility functions
│   ├── App.jsx                # Main application
│   └── main.jsx              # Entry point
├── backend/
│   ├── main.py               # FastAPI application
│   └── requirements.txt      # Python dependencies
├── public/                   # Static assets
├── package.json             # Frontend dependencies
├── tailwind.config.js       # Tailwind configuration
├── setup.bat               # Windows setup script
├── setup.sh                # Linux/macOS setup script
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check browser console for frontend errors
4. Check backend logs for server errors

## 🔄 Future Enhancements

- [ ] Firebase/Supabase integration for persistent storage
- [ ] User authentication and role-based access
- [ ] Advanced face recognition models (DeepFace, FaceNet)
- [ ] Real-time attendance analytics
- [ ] Export attendance reports
- [ ] Mobile-responsive design improvements
- [ ] Multi-language support
- [ ] Advanced filtering and search
- [ ] Bulk student import/export
- [ ] Email notifications for attendance

---

**Note**: This is a demonstration version using simplified face recognition. For production use, consider implementing more robust face recognition models and security measures.
