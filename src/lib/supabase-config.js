import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for Supabase setup
export const DATABASE_SCHEMA = `
-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('student', 'professor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  roll_number VARCHAR UNIQUE NOT NULL,
  year VARCHAR NOT NULL,
  session VARCHAR NOT NULL,
  face_embeddings JSONB, -- Store face embeddings as JSON
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  similarity_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint for one attendance per student per day
CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_per_day 
ON attendance(student_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for students table
CREATE POLICY "Professors can view all students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'professor'
    )
  );

CREATE POLICY "Students can view their own data" ON students
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'professor'
    )
  );

CREATE POLICY "Students can insert their own data" ON students
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for attendance table
CREATE POLICY "Professors can view all attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'professor'
    )
  );

CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert attendance" ON attendance
  FOR INSERT WITH CHECK (true);
`;

// Helper functions for database operations
export const dbHelpers = {
  // User management
  async createUser(email, role) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, role }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Student management
  async registerStudent(userId, studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        user_id: userId,
        name: studentData.name,
        roll_number: studentData.roll_number,
        year: studentData.year,
        session: studentData.session,
        face_embeddings: studentData.embeddings
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllStudents() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getStudentByRollNumber(rollNumber) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('roll_number', rollNumber)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Attendance management
  async markAttendance(studentId, similarityScore) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .upsert([{
        student_id: studentId,
        date: today,
        similarity_score: similarityScore
      }], {
        onConflict: 'student_id,date'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students (
          name,
          roll_number,
          year,
          session
        )
      `)
      .eq('date', today)
      .order('time', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAttendanceByDate(date) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students (
          name,
          roll_number,
          year,
          session
        )
      `)
      .eq('date', date)
      .order('time', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}; 