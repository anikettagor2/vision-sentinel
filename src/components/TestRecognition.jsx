import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import WebcamCapture from './WebcamCapture';

const TestRecognition = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setRecognitionResult(null);
  };

  const testRecognition = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Convert base64 to blob
      const base64Data = capturedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('image', blob, 'test.jpg');

      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setRecognitionResult(result);
    } catch (error) {
      console.error('Recognition test error:', error);
      setRecognitionResult({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Recognition</CardTitle>
          <CardDescription>
            Test the face recognition system with a captured image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Capture Image</h3>
              <WebcamCapture onCapture={handleImageCapture} />
              {capturedImage && (
                <Button 
                  onClick={testRecognition} 
                  disabled={isProcessing}
                  className="mt-4 w-full"
                >
                  {isProcessing ? 'Processing...' : 'Test Recognition'}
                </Button>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recognition Result</h3>
              {recognitionResult ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(recognitionResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Capture an image and click "Test Recognition" to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRecognition; 