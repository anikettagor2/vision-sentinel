import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const FaceDetectionDisplay = ({ imageSrc, detectedFaces, recognizedStudents, alreadyPresentStudents }) => {
  if (!imageSrc) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Face Detection Results</CardTitle>
          <CardDescription>
            Detected faces with bounding boxes and recognition results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative inline-block">
            <img 
              src={imageSrc} 
              alt="Captured" 
              className="rounded border max-w-full h-auto"
              style={{ maxHeight: '400px' }}
            />
            
            {/* Draw bounding boxes for all detected faces */}
            {detectedFaces && detectedFaces.map((face, index) => (
              <div
                key={index}
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                style={{
                  left: `${(face.x / 640) * 100}%`,
                  top: `${(face.y / 480) * 100}%`,
                  width: `${(face.width / 640) * 100}%`,
                  height: `${(face.height / 480) * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded">
                  Face {index + 1}: {face.confidence}%
                </div>
              </div>
            ))}
            
            {/* Draw bounding boxes for recognized students */}
            {recognizedStudents && recognizedStudents.map((student, index) => (
              <div
                key={`recognized-${index}`}
                className="absolute border-2 border-green-500 bg-green-500 bg-opacity-20"
                style={{
                  left: `${(student.face_box.x / 640) * 100}%`,
                  top: `${(student.face_box.y / 480) * 100}%`,
                  width: `${(student.face_box.width / 640) * 100}%`,
                  height: `${(student.face_box.height / 480) * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-1 rounded">
                  {student.name}: {(student.similarity_score * 100).toFixed(1)}%
                </div>
              </div>
            ))}
            
            {/* Draw bounding boxes for already present students */}
            {alreadyPresentStudents && alreadyPresentStudents.map((student, index) => (
              <div
                key={`already-present-${index}`}
                className="absolute border-2 border-orange-500 bg-orange-500 bg-opacity-20"
                style={{
                  left: `${(student.face_box.x / 640) * 100}%`,
                  top: `${(student.face_box.y / 480) * 100}%`,
                  width: `${(student.face_box.width / 640) * 100}%`,
                  height: `${(student.face_box.height / 480) * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-orange-500 text-white text-xs px-1 rounded">
                  {student.name}: Already Present
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceDetectionDisplay; 