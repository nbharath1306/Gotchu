"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
    const [hexRes, setHexRes] = useState<string[]>([]);

    // Simulated 3D Data particles
    useEffect(() => {
        if (!isScanning) return;
        const interval = setInterval(() => {
            setHexRes(prev => [Math.random().toString(16).substring(2, 6).toUpperCase(), ...prev.slice(0, 8)]);
        }, 100);
        return () => clearInterval(interval);
    }, [isScanning]);

    // Haptic feedback
    const vibrate = (pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            vibrate([50, 30, 50]);
            setImgSrc(imageSrc);
            setCameraActive(false);

            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "quantum-capture.jpg", { type: "image/jpeg" });
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
        setHexRes([]);
    };

    const label = scanResult?.[0]?.label;
    const score = scanResult?.[0]?.score;

    return (
        <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden shadow-2xl group isolate perspective-[1200px]">

            {/* SVG Filter Declarations for Bloom */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="hologram-bloom" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00ffcc" floodOpacity="0.5" />
                    </filter>
                    <filter id="chromatic-aberration">
                        <feOffset in="SourceGraphic" dx="-2" dy="0" result="left" />
                        <feOffset in="SourceGraphic" dx="2" dy="0" result="right" />
                        <feBlend in="left" in2="right" mode="screen" />
                    </filter>
                </defs>
            </svg>

            {/* A. Camera Feed Layer */}
            <div className="absolute inset-0 z-0">
                {cameraActive && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "environment" }}
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                )}
                {!cameraActive && imgSrc && (
                    <img src={imgSrc} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                )}

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,10,20,0.8)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 via-transparent to-purple-900/20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[url('/grid-noise.png')] opacity-[0.05] mix-blend-plus-lighter pointer-events-none" />
            </div>

            {/* B. The Holographic HUD (Z-Space) */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between" style={{ transformStyle: 'preserve-3d' }}>

                {/* 1. Header: Quantum Status */}
                <div className="flex justify-between items-start translate-z-10">
                    <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-3">
                        <div className="flex gap-1" style={{ filter: 'url(#hologram-bloom)' }}>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-cyan-400/20 rounded-full" />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 tracking-widest uppercase">Quantum.Link</span>
                    </div>

                    {/* Data Particles Float */}
                    <div className="flex flex-col items-end pointer-events-none">
                        <AnimatePresence>
                            {isScanning && hexRes.map((hex, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20, rotateX: 90 }}
                                    animate={{ opacity: 1 - i * 0.1, x: 0, rotateX: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[9px] font-mono text-cyan-500/80 tracking-widest font-bold"
                                    style={{ textShadow: '0 0 5px cyan' }}
                                >
                                    0x{hex}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. Core: The Gyroscope */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-[1000px]">
                    <AnimatePresence>
                        {isScanning ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, z: -100 }}
                                animate={{ opacity: 1, scale: 1, z: 0 }}
                                exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                                className="relative w-80 h-80 flex items-center justify-center"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Volumetric Beam */}
                                <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute w-1 h-96 bg-gradient-to-t from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 blur-md transform -rotate-45"
                                />

                                {/* Ring X */}
                                <motion.div
                                    animate={{ rotateX: 360, rotateY: 45 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[2px] border-cyan-500/40 rounded-full border-t-cyan-300"
                                    style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
                                />
                                {/* Ring Y */}
                                <motion.div
                                    animate={{ rotateY: 360, rotateX: -45 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border-[1px] border-purple-500/40 rounded-full border-l-purple-300 border-dashed"
                                />
                                {/* Ring Z */}
                                <motion.div
                                    animate={{ rotateZ: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-12 border-[4px] border-transparent border-t-emerald-400/60 rounded-full"
                                    style={{ filter: 'url(#hologram-bloom)' }}
                                />

                                {/* The Core */}
                                <div className="absolute w-4 h-4 bg-white rounded-full animate-ping shadow-[0_0_30px_white]" />
                            </motion.div>
                        ) : (
                            cameraActive && (
                                <div className="w-16 h-16 opacity-30 relative group-hover:opacity-60 transition-opacity">
                                    <div className="absolute top-0 left-0 w-4 h-[1px] bg-white" />
                                    <div className="absolute top-0 left-0 w-[1px] h-4 bg-white" />
                                    <div className="absolute top-0 right-0 w-4 h-[1px] bg-white" />
                                    <div className="absolute top-0 right-0 w-[1px] h-4 bg-white" />
                                    <div className="absolute bottom-0 left-0 w-4 h-[1px] bg-white" />
                                    <div className="absolute bottom-0 left-0 w-[1px] h-4 bg-white" />
                                    <div className="absolute bottom-0 right-0 w-4 h-[1px] bg-white" />
                                    <div className="absolute bottom-0 right-0 w-[1px] h-4 bg-white" />
                                </div>
                            )
                        )}
                    </AnimatePresence>

                    {/* 3. Result Materialization */}
                    <AnimatePresence>
                        {!isScanning && label && !cameraActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="absolute z-20 w-3/4"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="relative overflow-hidden bg-black/60 backdrop-blur-2xl border border-cyan-500/40 p-6 rounded-2xl text-center shadow-[0_0_50px_rgba(0,255,255,0.2)]">
                                    {/* Holographic Scanline */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-2 animate-[scan_2s_linear_infinite]" />

                                    <div className="relative z-10">
                                        <div className="inline-block px-3 py-1 mb-3 border border-cyan-500/50 rounded-full bg-cyan-900/30">
                                            <span className="text-[10px] font-mono text-cyan-300 font-bold tracking-widest uppercase glow-text">
                                                Identified {(score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-display text-white capitalize drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                            {label}
                                        </h2>
                                    </div>

                                    {/* Tech Decorations */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Controls */}
                <div className="flex items-center justify-between mt-auto z-20 pb-2">
                    {/* Gallery Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ImageIcon className="w-5 h-5 text-cyan-200/80" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </button>

                    {/* Quantum Shutter */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="relative w-24 h-24 group cursor-pointer"
                        >
                            {/* Energy Field */}
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/40 transition-all duration-500" />
                            <div className="absolute inset-2 border-2 border-cyan-400/50 rounded-full animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-4 border border-purple-400/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" />

                            {/* Core */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_white] group-active:scale-90 transition-transform duration-200 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200 to-white" />
                                </div>
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    )}

                    {/* Placeholder */}
                    <div className="w-14" />
                </div>
            </div>
        </div>
    );
}
