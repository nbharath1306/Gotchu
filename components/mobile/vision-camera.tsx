"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Image as ImageIcon, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VisionCameraProps {
    onCapture: (file: File) => void;
    onScan: (imageUrl: string) => void;
    isScanning: boolean;
    scanResult: any;
}

export function VisionCamera({ onCapture, onScan, isScanning, scanResult }: VisionCameraProps) {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(true);

    // Haptic feedback helper
    const vibrate = (pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            vibrate(50);
            setImgSrc(imageSrc);
            setCameraActive(false);

            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                });

            onScan(imageSrc);
        }
    }, [webcamRef, onCapture, onScan]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            vibrate(50);
            const url = URL.createObjectURL(file);
            setImgSrc(url);
            setCameraActive(false);
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
        <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden shadow-2xl group isolate">

            {/* A. Live Webcam Feed - Crystal Clear, No Overlays */}
            <div className="absolute inset-0 z-0">
                {cameraActive && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                {!cameraActive && imgSrc && (
                    <img src={imgSrc} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                )}
            </div>

            {/* B. Minimalist HUD Interface */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">

                {/* 1. Header: Subtle Status */}
                <div className="flex justify-between items-start">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                        <span className="text-[10px] font-medium text-white/90 tracking-wide uppercase">
                            {isScanning ? 'ANALYZING' : 'READY'}
                        </span>
                    </div>
                </div>

                {/* 2. Center: Precision Reticle */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* The Framing Corners */}
                    <div className="relative w-64 h-64 transition-all duration-500">
                        {/* TL */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                        {/* TR */}
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                        {/* BL */}
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                        {/* BR */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />

                        {/* Active Scanning Line */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ top: "0%" }}
                                    animate={{ top: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
                                    className="absolute left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                                >
                                    {/* Scan Trail */}
                                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-emerald-400/20 to-transparent" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Result Card: Compact & Clean */}
                    <AnimatePresence>
                        {!isScanning && label && !cameraActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-24 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl text-center shadow-lg pointer-events-auto"
                            >
                                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">
                                    CONFIDENCE {(score * 100).toFixed(0)}%
                                </p>
                                <h2 className="text-2xl font-bold text-white capitalize">
                                    {label}
                                </h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Controls: Glass Pills */}
                <div className="flex items-center justify-between mt-auto mx-4 pointer-events-auto">

                    {/* Gallery */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
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

                    {/* Shutter */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center relative group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    )}

                    {/* Balance */}
                    <div className="w-12" />
                </div>
            </div>
        </div>
    );
}
