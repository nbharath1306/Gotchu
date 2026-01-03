"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam"; // [NEW] Live Camera
import { Camera, X, Scan, Zap, Image as ImageIcon, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VisionCameraProps {
    onCapture: (file: File) => void;
    onScan: (imageUrl: string) => void;
    isScanning: boolean;
    scanResult: any;
    debugLogs?: string[];
    workerStatus?: string;
}

export function VisionCamera({ onCapture, onScan, isScanning, scanResult, debugLogs, workerStatus }: VisionCameraProps) {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null); // Captured image
    const [cameraActive, setCameraActive] = useState(true);

    // 1. Capture from Webcam
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            setCameraActive(false); // Freeze

            // Convert base64 to File for upstream form
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                });

            // Trigger AI
            onScan(imageSrc);
        }
    }, [webcamRef, onCapture, onScan]);

    // 2. Upload from Gallery
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImgSrc(url);
            setCameraActive(false); // Hide webcam, show image
            onCapture(file);
            onScan(url);
        }
    };

    const retake = () => {
        setImgSrc(null);
        setCameraActive(true);
    };

    const label = scanResult?.[0]?.label;
    const score = scanResult?.[0]?.score;

    return (
        <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

            {/* A. Live Webcam Feed */}
            {cameraActive && (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* B. Captured/Uploaded Image */}
            {!cameraActive && imgSrc && (
                <img src={imgSrc} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* C. UI Overlay (Transparent) */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/40">

                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${workerStatus === 'READY' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
                            {workerStatus || 'OFFLINE'}
                        </span>
                        {/* Inline Debug Log (Last Line) */}
                        {debugLogs && debugLogs.length > 0 && (
                            <span className="text-[8px] font-mono text-white/40 max-w-[150px] truncate">
                                {debugLogs[debugLogs.length - 1]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Scanning Animation */}
                <AnimatePresence>
                    {isScanning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div className="w-48 h-48 border border-emerald-500/50 rounded-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-[scan_1.5s_linear_infinite]" />
                            </div>
                            <div className="absolute mt-56 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-emerald-500/20">
                                <span className="text-xs font-mono text-emerald-400">ANALYZING SPECTRUM...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center: Result Label (Frozen State) */}
                <AnimatePresence>
                    {!isScanning && label && !cameraActive && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center">
                                <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase mb-2">Confidence {Math.round(score * 100)}%</p>
                                <h2 className="text-3xl font-display text-white capitalize">{label}</h2>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Bottom Controls */}
                <div className="flex items-center justify-between mt-auto">

                    {/* 1. Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-white/10 backdrop-blur hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ImageIcon className="w-5 h-5 text-white" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </button>

                    {/* 2. Shutter / Retake Button */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group"
                        >
                            <div className="w-14 h-14 bg-white rounded-full group-active:scale-90 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="p-3 bg-white/10 backdrop-blur hover:bg-white/20 rounded-full transition-colors flex items-center gap-2 px-4"
                        >
                            <RotateCcw className="w-5 h-5 text-white" />
                            <span className="text-xs font-mono text-white">RETAKE</span>
                        </button>
                    )}

                    {/* 3. Placeholder for symmetry (or Flash toggle) */}
                    <div className="w-11" />
                </div>
            </div>

            {/* Viewfinder Corners (Static) */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white" />
            </div>
        </div>
    );
}
