import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { User, GraduationCap, Eye, EyeOff } from 'lucide-react';

const UserTypeLogin = () => {
  const { signInAsRole } = useAuth();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('select'); // 'select', 'professor', 'student'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleProfessorLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (username === 'Aniket@2004' && password === '2409') {
      try {
        await signInAsRole('professor');
        navigate('/professor'); // Redirect to professor dashboard
      } catch (error) {
        console.error('Professor login error:', error);
        setError('Login failed. Please try again.');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  const handleStudentRegistration = async () => {
    try {
      await signInAsRole('student');
      navigate('/student'); // Redirect to student dashboard
    } catch (error) {
      console.error('Student registration error:', error);
    }
  };

  const goBack = () => {
    setLoginType('select');
    setUsername('');
    setPassword('');
    setError('');
  };

  if (loginType === 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Professor Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your credentials to access the professor dashboard
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Professor Authentication</CardTitle>
              <CardDescription className="text-center">
                Username: Aniket@2004 | Password: 2409
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfessorLogin} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={goBack}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loginType === 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Student Registration
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Register your face for automatic attendance marking
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Student Access</CardTitle>
              <CardDescription className="text-center">
                No login required. Click below to register your face.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleStudentRegistration}
                className="w-full flex items-center justify-center space-x-2 py-3"
                size="lg"
              >
                <User className="h-5 w-5" />
                <span>Register as Student</span>
              </Button>
              
              <Button
                onClick={goBack}
                variant="outline"
                className="w-full"
              >
                Back to Selection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Face Recognition Attendance System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your role to continue
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Select Your Role</CardTitle>
            <CardDescription className="text-center">
              Choose whether you are a Professor or Student
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setLoginType('professor')}
              className="w-full flex items-center justify-center space-x-2 py-3"
              size="lg"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Professor Login</span>
            </Button>
            
            <Button
              onClick={() => setLoginType('student')}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-3"
              size="lg"
            >
              <User className="h-5 w-5" />
              <span>Student Registration</span>
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Professor: Username/Password required | Student: No login needed
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeLogin; 