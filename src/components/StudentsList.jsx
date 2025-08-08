import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Users, Calendar, GraduationCap } from 'lucide-react';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students from backend...');
      const response = await fetch('http://localhost:8000/students');
      const result = await response.json();
      
      if (result.success) {
        setStudents(result.students);
        console.log('Students fetched from backend:', result.students);
      } else {
        console.error('Error fetching students from backend:', result.error);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students from backend:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>Registered Students</span>
            <span className="text-sm text-muted-foreground">
              ({students.length})
            </span>
          </CardTitle>
          <CardDescription>
            View all registered students in the system
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Students Table */}
          {students.length > 0 ? (
            <div className="border rounded-lg">
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
                  {students.map((student, index) => (
                    <TableRow key={student.id || index}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.roll_number}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.session}</TableCell>
                      <TableCell>{formatDate(student.registration_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No students registered</p>
              <p>Register students to see them here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsList; 