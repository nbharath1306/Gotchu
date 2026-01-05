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
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
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
                    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
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
        <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group isolate">

            {/* A. Live Webcam Feed with Chromatic Aberration Effect */}
            <div className="absolute inset-0 z-0">
                {cameraActive && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                )}
                {!cameraActive && imgSrc && (
                    <img src={imgSrc} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" />
                {/* Fake Chromatic/Grain Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            </div>

            {/* B. Abstract HUD Interface */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">

                {/* HUD Top: Status Indicators (Minimalist) */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_10px_white] animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                </div>

                {/* HUD Center: Abstract Target Lock */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <AnimatePresence>
                        {isScanning ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                                className="relative w-72 h-72 flex items-center justify-center"
                            >
                                {/* Complex Rotation Geometry */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[0.5px] border-cyan-400/30 rounded-full border-dashed" />
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-8 border-[0.5px] border-purple-400/20 rounded-full border-dashed" />
                                <motion.div animate={{ rotate: 180 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-16 border border-emerald-400/10 rounded-full border-t-emerald-400/60" />

                                {/* Central Core */}
                                <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white] animate-ping" />

                                {/* Radar Sweep */}
                                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,255,0.1)_360deg)] animate-[spin_2s_linear_infinite] rounded-full opacity-30" />
                            </motion.div>
                        ) : (
                            /* Static Passive Reticle */
                            cameraActive && (
                                <div className="w-12 h-12 opacity-20 relative">
                                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white" />
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white" />
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white" />
                                </div>
                            )
                        )}
                    </AnimatePresence>

                    {/* Result Card: Glassmorphism */}
                    <AnimatePresence>
                        {!isScanning && label && !cameraActive && (
                            <motion.div
                                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                className="absolute z-20"
                            >
                                <div className="relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />

                                    <div className="relative z-10 space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                            <span className="text-[10px] font-mono text-emerald-300 tracking-wider font-bold">MATCH {(score * 100).toFixed(0)}%</span>
                                        </div>
                                        <h2 className="text-4xl font-display text-white capitalize drop-shadow-lg tracking-tight">
                                            {label}
                                        </h2>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* HUD Bottom: Ethereal Controls */}
                <div className="flex items-center justify-between mt-auto z-20 pb-4">

                    {/* Gallery Fab */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 transition-all active:scale-95 group"
                    >
                        <ImageIcon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </button>

                    {/* Shutter / Orb */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="relative group cursor-pointer"
                        >
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                {/* Ambient Glow */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                {/* Rotating Ring */}
                                <div className="absolute inset-2 rounded-full border border-white/20 border-t-white/60 animate-[spin_8s_linear_infinite]" />
                                {/* The Core Orb */}
                                <div className="w-16 h-16 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.6)] group-active:scale-90 transition-transform duration-300" />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    )}

                    {/* Placeholder */}
                    <div className="w-12" />
                </div>
            </div>
        </div>
    );
}
