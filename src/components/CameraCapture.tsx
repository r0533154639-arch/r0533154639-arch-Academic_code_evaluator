import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not connect to webcam. Please verify your camera is connected or use file upload.'
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    onCapture(dataUrl);
  };

  const retakeSnapshot = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4">
      {error ? (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-amber-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-200 mb-1">Camera Not Available</h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
          >
            Retry Camera Access
          </button>
        </div>
      ) : capturedImage ? (
        <div className="flex flex-col items-center">
          <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-[500px]">
            <img src={capturedImage} alt="Captured handwritten paper" className="max-h-[500px] w-auto object-contain" />
            <div className="absolute top-3 left-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Snapshot Captured</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={retakeSnapshot}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retake Photo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden border border-slate-700 aspect-[4/3] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Exam paper alignment guide box */}
            <div className="absolute inset-8 border-2 border-dashed border-sky-400/60 rounded-lg pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[11px] font-medium bg-slate-900/80 text-sky-300 px-2 py-0.5 rounded self-start border border-sky-400/30">
                📄 Align handwritten exam paper inside box
              </span>
              <span className="text-[11px] font-medium bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded self-end">
                Hold still for clear OCR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={toggleFacingMode}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition"
              title="Switch camera"
            >
              <SwitchCamera className="h-4 w-4" />
            </button>
            <button
              onClick={takeSnapshot}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium text-sm transition shadow-lg shadow-indigo-600/30"
            >
              <Camera className="h-4 w-4" />
              <span>Capture Exam Sheet</span>
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
