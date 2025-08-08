# Supabase Setup Instructions

## 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Note down your project URL and anon key

## 2. Create Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    year VARCHAR(10) NOT NULL,
    session VARCHAR(20) NOT NULL,
    face_embeddings JSONB,
    image_urls TEXT[],
    registration_date TIMESTAMP DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    student_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    year VARCHAR(10) NOT NULL,
    session VARCHAR(20) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    time TIMESTAMP DEFAULT NOW(),
    similarity_score FLOAT
);

-- Create users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add unique constraint for daily attendance
ALTER TABLE attendance ADD CONSTRAINT unique_daily_attendance 
UNIQUE (roll_number, date);
```

## 3. Create Storage Bucket
- Go to Storage in your Supabase dashboard
- Create a new bucket called `student-images`
- Set it to public (for easy access)

## 4. Storage Bucket Policies
**Option A: Disable RLS (Easier)**
- Go to Storage → Buckets → student-images
- Click Edit bucket
- Turn OFF "Row Level Security (RLS)"
- Save

**Option B: Create Storage Policy (More Secure)**
Run this SQL in your Supabase SQL Editor:

```sql
-- Allow anyone to upload images to student-images bucket
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'student-images');

-- Allow anyone to view images from student-images bucket
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'student-images');
```

## 5. Environment Variables
Create these files with your Supabase credentials:

**Frontend (.env in developer/):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env in developer/backend/):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 6. Install Dependencies
```bash
# Frontend dependencies (already installed)
npm install

# Backend dependencies
cd backend
pip install supabase python-dotenv
```

## 7. Test Setup
- Start your backend: `python main.py`
- Start your frontend: `npm run dev`
- Try registering a student to test the complete flow 