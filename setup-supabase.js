// Setup script for Supabase database
// Run this script to initialize your Supabase database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgfhloiwczqlexogvrgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZmhsb2l3Y3pxbGV4b2d2cmdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEyMTYyNCwiZXhwIjoyMDY5Njk3NjI0fQ.example'; // Replace with your service key

const supabase = createClient(supabaseUrl, supabaseKey);

const setupDatabase = async () => {
  try {
    console.log('Setting up Supabase database...');

    // Create tables
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR UNIQUE NOT NULL,
          role VARCHAR NOT NULL CHECK (role IN ('student', 'professor')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    const { error: studentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR NOT NULL,
          roll_number VARCHAR UNIQUE NOT NULL,
          year VARCHAR NOT NULL,
          session VARCHAR NOT NULL,
          face_embeddings JSONB,
          image_urls JSONB,
          registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (studentsError) {
      console.error('Error creating students table:', studentsError);
    } else {
      console.log('Students table created successfully');
    }

    const { error: attendanceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS attendance (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          student_id VARCHAR NOT NULL,
          date DATE NOT NULL,
          time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          similarity_score DECIMAL(5,4),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (attendanceError) {
      console.error('Error creating attendance table:', attendanceError);
    } else {
      console.log('Attendance table created successfully');
    }

    // Create unique constraint for attendance
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_per_day 
        ON attendance(student_id, date);
      `
    });

    if (constraintError) {
      console.error('Error creating unique constraint:', constraintError);
    } else {
      console.log('Unique constraint created successfully');
    }

    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

// Run the setup
setupDatabase(); 