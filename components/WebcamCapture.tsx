"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface WebcamCaptureProps {
  isRecording: boolean;
}

export default function WebcamCapture({ isRecording }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setIsActive(false);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative mb-6"
    >
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover bg-gray-900"
        />
        {isRecording && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>REC</span>
          </motion.div>
        )}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <p className="text-sm">Camera unavailable</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
