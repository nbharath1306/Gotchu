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

                <div className="flex justify-between items-start">
                    <div className="bg-black/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-white/80'}`} />
                        <span className="text-[10px] font-semibold text-white tracking-widest uppercase">
                            {isScanning ? 'SEARCHING' : 'STANDBY'}
                        </span>
                    </div>
                </div>

                {/* 2. Center: Precision Reticle */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* The Smart Kinetic Frame */}
                    <div className="relative w-72 h-72">

                        {/* Corners Container - Animated */}
                        <motion.div
                            animate={isScanning ? { scale: 0.95 } : { scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            {/* TL */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-white rounded-tl-2xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            {/* TR */}
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-white rounded-tr-2xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            {/* BL */}
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-white rounded-bl-2xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            {/* BR */}
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-white rounded-br-2xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        </motion.div>

                        {/* Pro Guides (Rule of Thirds Ticks) */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            {/* Horizontal Ticks */}
                            <div className="absolute top-1/3 left-0 w-2 h-[1px] bg-white" />
                            <div className="absolute top-1/3 right-0 w-2 h-[1px] bg-white" />
                            <div className="absolute top-2/3 left-0 w-2 h-[1px] bg-white" />
                            <div className="absolute top-2/3 right-0 w-2 h-[1px] bg-white" />

                            {/* Vertical Ticks */}
                            <div className="absolute top-0 left-1/3 w-[1px] h-2 bg-white" />
                            <div className="absolute bottom-0 left-1/3 w-[1px] h-2 bg-white" />
                            <div className="absolute top-0 right-1/3 w-[1px] h-2 bg-white" />
                            <div className="absolute bottom-0 right-1/3 w-[1px] h-2 bg-white" />
                        </div>

                        {/* Active Scanning Pulse */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                    className="absolute inset-0 border border-cyan-400/30 rounded-3xl"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/5 rounded-3xl blur-md" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Intelligent Scan Line */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ top: "10%", opacity: 0 }}
                                    animate={{ top: "90%", opacity: 1 }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                                    className="absolute left-4 right-4 h-[1px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
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
                                className="absolute bottom-24 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl text-center shadow-2xl pointer-events-auto"
                            >
                                <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest mb-1 shadow-black/50 drop-shadow-sm">
                                    MATCH {(score * 100).toFixed(0)}%
                                </p>
                                <h2 className="text-2xl font-bold text-white capitalize drop-shadow-md">
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
