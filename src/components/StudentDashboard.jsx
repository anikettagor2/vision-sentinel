import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';
import StudentRegistration from './StudentRegistration';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <span>Student Dashboard</span>
          </CardTitle>
          <CardDescription>
            Register your face for automatic attendance marking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Registration */}
      <StudentRegistration />
    </div>
  );
};

export default StudentDashboard; 