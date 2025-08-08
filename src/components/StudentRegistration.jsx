import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select } from './ui/select';
import { Toast, ToastDescription, ToastTitle } from './ui/toast';
import WebcamCapture from './WebcamCapture';
import { UserPlus, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentRegistration = () => {
  const { user, signOut } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    year: '',
    session: ''
  });
  const [capturedImages, setCapturedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({ name: '', rollNumber: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageCapture = (imageSrc) => {
    if (capturedImages.length < 10) {
      setCapturedImages(prev => [...prev, imageSrc]);
    }
  };

  const removeImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setToastMessage({ title: 'Validation Error', description: 'Name is required', type: 'error' });
      setShowToast(true);
      return false;
    }
    if (!formData.rollNumber.trim()) {
      setToastMessage({ title: 'Validation Error', description: 'Roll number is required', type: 'error' });
      setShowToast(true);
      return false;
    }
    if (!formData.year) {
      setToastMessage({ title: 'Validation Error', description: 'Year is required', type: 'error' });
      setShowToast(true);
      return false;
    }
    if (!formData.session) {
      setToastMessage({ title: 'Validation Error', description: 'Session is required', type: 'error' });
      setShowToast(true);
      return false;
    }
    if (capturedImages.length < 5) {
      setToastMessage({ title: 'Validation Error', description: 'At least 5 face images are required', type: 'error' });
      setShowToast(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data for backend
      console.log('Preparing form data for backend...');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('roll_number', formData.rollNumber);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('session', formData.session);
      
      // Convert captured images to blobs and add to FormData
      capturedImages.forEach((imageSrc, index) => {
        const base64Data = imageSrc.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        formDataToSend.append('images', blob, `image_${index}.jpg`);
        console.log(`Image ${index + 1} processed and added to FormData`);
      });
      
      // Send everything to backend - let it handle all storage
      console.log('Sending registration request to backend...');
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Backend error: ${response.status}`);
      }
      
      const backendResult = await response.json();
      console.log('Backend registration result:', backendResult);
      
      if (!backendResult.success) {
        throw new Error(backendResult.message || 'Backend processing failed');
      }
      
      // Show success popup with name and roll number
      setSuccessData({ name: formData.name, rollNumber: formData.rollNumber });
      setShowSuccessPopup(true);
      
      // Auto-hide popup after 3 seconds and redirect to login
      setTimeout(() => {
        setShowSuccessPopup(false);
        signOut();
      }, 3000);
      
    } catch (error) {
      console.error('Registration error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setToastMessage({ title: 'Error', description: error.message || 'Failed to register student. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setShowToast(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6" />
            <span>Student Registration</span>
          </CardTitle>
          <CardDescription>
            Register a new student with face recognition data. Capture 5-10 clear face images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Enter student's full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input id="rollNumber" value={formData.rollNumber} onChange={e => handleInputChange('rollNumber', e.target.value)} placeholder="Enter roll number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={formData.year} onChange={e => handleInputChange('year', e.target.value)}>
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select value={formData.session} onChange={e => handleInputChange('session', e.target.value)}>
                <option value="">Select session</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </Select>
            </div>
          </div>
          {/* Face Image Capture */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Face Images ({capturedImages.length}/10)</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {capturedImages.length >= 5 ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Minimum requirement met
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      Need {5 - capturedImages.length} more images
                    </span>
                  )}
                </span>
              </div>
            </div>
            {capturedImages.length < 10 && (
              <WebcamCapture
                onCapture={handleImageCapture}
                title="Capture Face Image"
                isCapturing={isSubmitting}
                allowMultiple={false}
              />
            )}
            {/* Captured Images Grid */}
            {capturedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {capturedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={image} alt={`Face ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || capturedImages.length < 5}
            className="w-full"
          >
            {isSubmitting ? 'Registering...' : 'Register Student'}
          </Button>
        </CardFooter>
      </Card>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast 
            variant={toastMessage.type === 'error' ? 'destructive' : 'default'}
            onClose={() => setShowToast(false)}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Registration Successful!
              </h3>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {successData.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Roll Number:</span> {successData.rollNumber}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                You will be redirected to the login page in a few seconds...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration; 