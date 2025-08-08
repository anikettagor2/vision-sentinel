import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Toast, ToastDescription, ToastTitle } from './ui/toast';
import { Users, Clock, CheckCircle, AlertCircle, Camera, Power, PowerOff, User, RefreshCw } from 'lucide-react';
import ProfessorWebcam from './ProfessorWebcam';

const ProfessorDashboard = () => {
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [lastRecognized, setLastRecognized] = useState(null);
  const [webcamRef, setWebcamRef] = useState(null);
  const [alreadyPresentStudents, setAlreadyPresentStudents] = useState([]);

  useEffect(() => {
    fetchAttendanceHistory();
    fetchStudentsList();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      console.log('Fetching attendance history from backend...');
      const response = await fetch('http://localhost:8000/attendance');
      const result = await response.json();
      
      if (result.success) {
        setAttendanceHistory(result.attendance_records);
        console.log('Attendance records fetched from backend:', result.attendance_records);
      } else {
        console.error('Error fetching attendance from backend:', result.error);
        setAttendanceHistory([]);
      }
    } catch (error) {
      console.error('Error fetching attendance history from backend:', error);
      setAttendanceHistory([]);
    }
  };

  const fetchStudentsList = async () => {
    try {
      console.log('Fetching students list from backend...');
      const response = await fetch('http://localhost:8000/students');
      const result = await response.json();
      
      if (result.success) {
        setStudentsList(result.students);
        console.log('Students list fetched from backend:', result.students);
      } else {
        console.error('Error fetching students from backend:', result.error);
        setStudentsList([]);
      }
    } catch (error) {
      console.error('Error fetching students list from backend:', error);
      setStudentsList([]);
    }
  };

  const captureAndRecognize = async () => {
    if (!webcamRef || isProcessing) return;

    setIsProcessing(true);
    try {
      const imageSrc = webcamRef.getScreenshot();
      if (!imageSrc) {
        setIsProcessing(false);
        return;
      }

      // Convert base64 to blob
      const base64Data = imageSrc.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', blob, 'attendance.jpg');

      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        setLastRecognized(imageSrc);
        
        // Handle recognized students
        if (result.recognized_students && result.recognized_students.length > 0) {
          const newStudents = result.recognized_students.filter(student => 
            student.status === 'present'
          );
          const alreadyPresent = result.recognized_students.filter(student => 
            student.status === 'already_present'
          );
          
          if (newStudents.length > 0) {
            setRecognizedStudents(prev => [...prev, ...newStudents]);
            const studentNames = newStudents.map(s => s.name).join(', ');
            setToastMessage({
              title: '✅ Attendance Marked',
              description: `${studentNames} marked present at ${new Date().toLocaleTimeString()}`,
              type: 'success'
            });
            setShowToast(true);
          }
          
          if (alreadyPresent.length > 0) {
            setAlreadyPresentStudents(prev => [...prev, ...alreadyPresent]);
            const studentNames = alreadyPresent.map(s => s.name).join(', ');
            setToastMessage({
              title: '⚠️ Already Present',
              description: `${studentNames} already marked present today`,
              type: 'warning'
            });
            setShowToast(true);
          }
        }
        
        // Handle already present students from backend
        if (result.already_present_students && result.already_present_students.length > 0) {
          const studentNames = result.already_present_students.map(s => s.name).join(', ');
          setToastMessage({
            title: '⚠️ Duplicate Scan',
            description: `${studentNames} already marked present today`,
            type: 'warning'
          });
          setShowToast(true);
        }
        
        fetchAttendanceHistory();
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setToastMessage({
        title: '❌ Recognition Failed',
        description: 'Failed to recognize student. Please try again.',
        type: 'error'
      });
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'already_present':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Marked Present';
      case 'already_present':
        return 'Already Present';
      default:
        return status;
    }
  };

  const clearRecognitions = () => {
    setRecognizedStudents([]);
    setAlreadyPresentStudents([]);
    setLastRecognized(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span>Manual Face Recognition</span>
          </CardTitle>
          <CardDescription>
            Click the button below to capture and recognize students for attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={captureAndRecognize}
                disabled={isProcessing}
                className="flex items-center space-x-2"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Capture & Recognize</span>
                  </>
                )}
              </Button>
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">
                    Processing image...
                  </span>
                </div>
              )}
            </div>
            {recognizedStudents.length > 0 && (
              <Button onClick={clearRecognitions} variant="outline">
                Clear History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Camera Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span>Live Camera Feed</span>
          </CardTitle>
          <CardDescription>
            Position student's face in the camera view and click "Capture & Recognize"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="relative">
              <ProfessorWebcam onRef={setWebcamRef} />
              <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Recognitions */}
      {recognizedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Recent Recognitions</span>
            </CardTitle>
            <CardDescription>
              Students recognized in the current session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Similarity Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recognizedStudents.slice(-10).map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>{student.session}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {(student.similarity_score * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(student.status)}
                        <span className="text-sm">{getStatusText(student.status)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>Registered Students</span>
          </CardTitle>
          <CardDescription>
            All students registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsList.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>{student.session}</TableCell>
                    <TableCell>
                      {new Date(student.registration_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students registered yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6" />
              <span>Today's Attendance</span>
            </div>
            <Button
              onClick={fetchAttendanceHistory}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
          <CardDescription>
            All students marked present today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Attendance Summary */}
          {attendanceHistory.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Attendance Summary
                  </h3>
                  <p className="text-sm text-green-600">
                    {attendanceHistory.length} student(s) marked present today
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {attendanceHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Similarity Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.student_name}</TableCell>
                    <TableCell>{record.roll_number}</TableCell>
                    <TableCell>{record.year}</TableCell>
                    <TableCell>{record.session}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(record.time || record.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.time || record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {(record.similarity_score * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast 
            variant={toastMessage.type === 'error' ? 'destructive' : toastMessage.type === 'warning' ? 'default' : 'default'}
            onClose={() => setShowToast(false)}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard; 