import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user, userRole } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ api: 'Connected', face: 'Active', db: 'Supabase' });

  // Redirect based on user role
  if (userRole === 'professor') {
    return <Navigate to="/professor" replace />;
  }
  if (userRole === 'student') {
    return <Navigate to="/student" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching data from backend...');
        
        // Fetch students from backend
        const studentsResponse = await fetch('http://localhost:8000/students');
        const studentsResult = await studentsResponse.json();
        const students = studentsResult.success ? studentsResult.students : [];
        setTotalStudents(students.length);
        console.log('Students fetched:', students.length);
        
        // Fetch today's attendance from backend
        const attendanceResponse = await fetch('http://localhost:8000/attendance');
        const attendanceResult = await attendanceResponse.json();
        const attendanceRecords = attendanceResult.success ? attendanceResult.attendance_records : [];
        setPresentToday(attendanceRecords.length);
        console.log('Attendance records fetched:', attendanceRecords.length);
        
        // Calculate attendance rate
        const rate = students.length > 0 ? (attendanceRecords.length / students.length) * 100 : 0;
        setAttendanceRate(rate);
        
      } catch (error) {
        console.error('Error fetching data from backend:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Face Recognition Attendance</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Welcome back, {user?.email}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
            <CardDescription>Registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Present Today</CardTitle>
            <CardDescription>Students marked present today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{presentToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Today's attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(attendanceRate)}%</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link to="/register">
                <Button className="w-full" variant="default">Register New Student</Button>
              </Link>
              <Link to="/attendance">
                <Button className="w-full" variant="outline">Mark Attendance</Button>
              </Link>
              <Link to="/students">
                <Button className="w-full" variant="outline">View Students List</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Backend API</span>
                <span className="text-green-600">{status.api}</span>
              </div>
              <div className="flex justify-between">
                <span>Face Recognition</span>
                <span className="text-green-600">{status.face}</span>
              </div>
              <div className="flex justify-between">
                <span>Database</span>
                <span className="text-green-600">{status.db}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
