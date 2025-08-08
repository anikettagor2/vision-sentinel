import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Chrome, Loader2 } from 'lucide-react';

function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Face Recognition Attendance System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your attendance records
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5" />
            )}
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login; 