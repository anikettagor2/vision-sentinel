import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wgfhloiwczqlexogvrgc.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZmhsb2l3Y3pxbGV4b2d2cmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjE2MjQsImV4cCI6MjA2OTY5NzYyNH0.g5zXHZ6qXZwlEK21HqkH1sFc3JMjF5M1Io5Se5iR4H0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
    return data.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Students functions
export const checkStudentExists = async (rollNumber) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('roll_number')
      .eq('roll_number', rollNumber)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }
    
    return data !== null
  } catch (error) {
    console.error('Error checking if student exists:', error)
    throw error
  }
}

export const addStudent = async (studentData) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error adding student:', error)
    throw error
  }
}

export const getStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting students:', error)
    throw error
  }
}

// Attendance functions
export const addAttendanceRecord = async (attendanceData) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error adding attendance record:', error)
    throw error
  }
}

export const getAttendanceRecords = async (date) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting attendance records:', error)
    throw error
  }
}

// File storage functions
export const uploadImage = async (file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from('student-images')
      .upload(path, file)
    
    if (error) throw error
    
    const { data: urlData } = supabase.storage
      .from('student-images')
      .getPublicUrl(path)
    
    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export default supabase 