import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Toast, ToastDescription, ToastTitle } from './ui/toast';
import WebcamCapture from './WebcamCapture';
import { Camera, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AttendanceCapture = () => {
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [lastCaptured, setLastCaptured] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    fetchAttendanceHistory();
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

  const handleImageCapture = async (imageSrc) => {
    setIsProcessing(true);
    setLastCaptured(imageSrc);
    try {
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
      
      console.log('Sending image to backend for recognition...');
      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        console.log('Recognition successful!');
        setRecognizedStudents(result.recognized_students);
        
        if (result.recognized_students && result.recognized_students.length > 0) {
          setToastMessage({
            title: 'Recognition Successful',
            description: `Found ${result.recognized_students.length} student(s)`,
            type: 'success'
          });
        } else {
          setToastMessage({
            title: 'No Students Found',
            description: 'No registered students were recognized in the image',
            type: 'warning'
          });
        }
        fetchAttendanceHistory();
      } else {
        setToastMessage({
          title: 'Recognition Failed',
          description: result.message || 'Failed to recognize faces',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setToastMessage({
        title: 'Error',
        description: 'Failed to process image. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
      setShowToast(true);
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

  const retake = () => {
    setLastCaptured(null);
    setRecognizedStudents([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Attendance Capture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-6 w-6" />
            <span>Mark Attendance</span>
          </CardTitle>
          <CardDescription>
            Capture an image to automatically recognize and mark student attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!lastCaptured ? (
            <WebcamCapture
              onCapture={handleImageCapture}
              title="Capture Attendance"
              isCapturing={isProcessing}
              allowMultiple={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img src={lastCaptured} alt="Captured" className="rounded border w-80 h-60 object-cover" />
              <div className="flex gap-2 mt-2">
                <Button onClick={retake} variant="outline">Retake</Button>
                <Button onClick={() => setLastCaptured(null)} variant="default">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Recognition Results */}
      {lastCaptured && recognizedStudents.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span>No Student Found</span>
            </CardTitle>
            <CardDescription>
              No registered student was recognized in the captured image.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {recognizedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Recognition Results</span>
            </CardTitle>
            <CardDescription>
              Students recognized in the captured image
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
                {recognizedStudents.map((student, index) => (
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
      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span>Today's Attendance</span>
          </CardTitle>
          <CardDescription>
            Students marked present today
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
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

export default AttendanceCapture; 