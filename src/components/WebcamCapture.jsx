import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from './ui/button';

const videoConstraints = {
  width: 320,
  height: 240,
  facingMode: 'user',
};

const WebcamCapture = ({ onCapture, title = 'Capture', isCapturing = false, allowMultiple = true }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    if (allowMultiple) {
      setCapturedImages(prev => [...prev, imageSrc]);
      if (onCapture) onCapture(imageSrc);
    } else {
      if (onCapture) onCapture(imageSrc);
    }
  };

  const retake = (index) => {
    if (allowMultiple) {
      setCapturedImages(prev => prev.filter((_, i) => i !== index));
      setImgSrc(null);
    } else {
      setImgSrc(null);
    }
  };

  const captureMore = () => {
    setImgSrc(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Show webcam if no image is captured or capturing more */}
      {!imgSrc ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded border"
        />
      ) : (
        <img src={imgSrc} alt="Captured" className="rounded border w-80 h-60 object-cover" />
      )}
      <div className="flex gap-2 mt-2">
        {!imgSrc ? (
          <Button onClick={capture} disabled={isCapturing}>{title}</Button>
        ) : allowMultiple ? (
          <>
            <Button onClick={captureMore} variant="default">Capture More</Button>
            <Button onClick={() => retake(capturedImages.length - 1)} variant="outline">Retake</Button>
          </>
        ) : (
          <Button onClick={retake} variant="outline">Retake</Button>
        )}
      </div>
      {/* Show thumbnails of all captured images if multiple allowed */}
      {allowMultiple && capturedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {capturedImages.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} alt={`Capture ${idx + 1}`} className="w-20 h-16 object-cover rounded border" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => retake(idx)}
              >
                X
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;