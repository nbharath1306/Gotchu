"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Image as ImageIcon, RotateCcw, Sparkles } from "lucide-react";
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
            vibrate([10, 50, 10]); // Deep haptic thud
            setImgSrc(imageSrc);
            setCameraActive(false);

            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "nebula-capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                });

            onScan(imageSrc);
        }
    }, [webcamRef, onCapture, onScan]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            vibrate(20);
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
        <div className="relative w-full aspect-[4/5] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl group isolate font-sans">

            {/* A. Live Webcam Feed */}
            <div className="absolute inset-0 z-0 bg-black">
                {cameraActive && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                )}
                {!cameraActive && imgSrc && (
                    <img src={imgSrc} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                )}

                {/* Nebula Ambience */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* B. Deep Glass Interface */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none">

                {/* 1. Header: Status Orb */}
                <div className="flex justify-center w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isScanning ? "scanning" : "ready"}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black/30 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full flex items-center gap-3 shadow-xl"
                        >
                            <div className="relative flex items-center justify-center w-3 h-3">
                                <motion.div
                                    animate={isScanning ? { scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] } : { scale: 1, opacity: 0.5 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className={`absolute inset-0 rounded-full ${isScanning ? 'bg-indigo-500 blur-sm' : 'bg-white blur-[2px]'}`}
                                />
                                <div className={`relative w-2 h-2 rounded-full ${isScanning ? 'bg-indigo-400' : 'bg-white'}`} />
                            </div>
                            <span className={`text-xs font-medium tracking-wider uppercase ${isScanning ? 'text-indigo-200' : 'text-white/80'}`}>
                                {isScanning ? "Processing" : "Ready"}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. The Nebula Aperture (Center) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-8">
                    {/* The Living Frame */}
                    <div className="relative w-full aspect-square max-w-[280px]">

                        {/* Gradient Border Glow */}
                        <motion.div
                            animate={isScanning ? {
                                opacity: [0.3, 0.6, 0.3],
                                rotate: [0, 180, 360],
                            } : { opacity: 0 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-[3px] rounded-[2.5rem] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500 blur-xl opacity-0"
                        />

                        {/* Glass Frame */}
                        <div className="absolute inset-0 rounded-[2.2rem] border border-white/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] overflow-hidden">
                            {/* Scanning Light Sweep */}
                            <AnimatePresence>
                                {isScanning && (
                                    <motion.div
                                        initial={{ top: "-20%", opacity: 0 }}
                                        animate={{ top: "120%", opacity: 1 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent skew-y-12 blur-md"
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Corner Accents (Subtle) */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/30 rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/30 rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/30 rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/30 rounded-br-2xl" />

                    </div>
                </div>

                {/* 3. Result Reveal (Cinematic) */}
                <div className="relative z-20 flex flex-col items-center justify-center min-h-[120px] mb-20 pointer-events-auto">
                    <AnimatePresence>
                        {label && !isScanning && !cameraActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="flex flex-col items-center text-center"
                            >
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-black/40 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/10 mb-4 shadow-xl"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-fuchsia-300" />
                                        <span className="text-xs font-medium text-fuchsia-100 uppercase tracking-widest">
                                            {(score * 100).toFixed(0)}% Confidence
                                        </span>
                                    </div>
                                </motion.div>

                                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tighter capitalize drop-shadow-2xl">
                                    {label}
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Floating Island Controls */}
                <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 pointer-events-auto">
                    {/* Gallery */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    >
                        <ImageIcon className="w-6 h-6" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </button>

                    {/* Gradient Orb Shutter */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="relative w-20 h-20 rounded-full flex items-center justify-center group"
                        >
                            {/* Outer Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
                            {/* Ring */}
                            <div className="absolute inset-0 border-[1px] border-white/20 rounded-full" />
                            {/* Inner Orb */}
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] group-active:scale-90 transition-transform duration-300 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-white opacity-100 group-hover:opacity-90 transition-opacity" />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    )}

                    {/* Placeholder for Balance */}
                    <div className="w-14 h-14 opacity-0" />
                </div>
            </div>
        </div>
    );
}
