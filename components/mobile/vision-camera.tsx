"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Image as ImageIcon, RotateCcw, ScanLine } from "lucide-react";
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
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(true);
    const [dataStream, setDataStream] = useState<string[]>([]);

    // Simulate random data stream
    useEffect(() => {
        if (!isScanning) return;
        const interval = setInterval(() => {
            const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
            setDataStream(prev => [`0x${hex}`, ...prev.slice(0, 5)]);
        }, 150);
        return () => clearInterval(interval);
    }, [isScanning]);

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
        setDataStream([]);
    };

    const label = scanResult?.[0]?.label;
    const score = scanResult?.[0]?.score;

    return (
        <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] group">

            {/* A. Live Webcam Feed */}
            {cameraActive && (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
            )}

            {/* B. Captured/Uploaded Image */}
            {!cameraActive && imgSrc && (
                <img src={imgSrc} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* C. Grid Overlay (Always visible but subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* D. HUD Interface */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">

                {/* HUD Top: Status & Worker */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/30">
                            <div className={`w-2 h-2 rounded-full ${workerStatus === 'READY' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-500'} animate-pulse`} />
                            <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest">
                                {workerStatus || 'Sys.Check...'}
                            </span>
                        </div>
                        {debugLogs && debugLogs.length > 0 && (
                            <span className="text-[8px] font-mono text-emerald-500/60 pl-2">
                                {">"} {debugLogs[debugLogs.length - 1]}
                            </span>
                        )}
                    </div>

                    {/* Scanning Indicator (Top Right) */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col items-end gap-1"
                            >
                                <span className="text-[10px] font-mono text-emerald-400 tracking-widest animate-pulse">PROCESSING</span>
                                {dataStream.map((hex, i) => (
                                    <span key={i} className="text-[8px] font-mono text-emerald-500/50 block leading-none">
                                        {hex}
                                    </span>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* HUD Center: Target Lock & Scanning */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                    {/* Scanning Animation */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="relative w-64 h-64"
                            >
                                {/* Outer Rotating Ring */}
                                <div className="absolute inset-0 border border-emerald-500/30 rounded-full border-t-emerald-400 border-r-transparent animate-[spin_3s_linear_infinite]" />
                                {/* Inner Rotating Ring (Counter) */}
                                <div className="absolute inset-8 border border-emerald-500/20 rounded-full border-b-emerald-400 border-l-transparent animate-[spin_2s_linear_infinite_reverse]" />
                                {/* Scanning Grid Pulse */}
                                <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-pulse" />
                                {/* Scanning Laser Line */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full">
                                    <div className="w-full h-1 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,1)] animate-[scan_2s_ease-in-out_infinite]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Result Display (Post-Scan) */}
                    <AnimatePresence>
                        {!isScanning && label && !cameraActive && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="relative z-20"
                            >
                                <div className="relative bg-black/80 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

                                    <p className="text-[10px] text-emerald-400 font-mono tracking-[0.2em] uppercase mb-2 border-b border-emerald-500/20 pb-2">
                                        Match Logic: {Math.round(score * 100)}%
                                    </p>
                                    <h2 className="text-3xl font-display text-white capitalize bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                                        {label}
                                    </h2>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* HUD Bottom: Controls */}
                <div className="flex items-center justify-between mt-auto z-20">

                    {/* Upload */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 bg-black/40 backdrop-blur border border-white/10 rounded-full hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <ImageIcon className="w-5 h-5 text-white/80" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </button>

                    {/* Shutter / Scan Button */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="relative w-20 h-20 group"
                        >
                            {/* Outer Glow */}
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all" />
                            {/* Ring */}
                            <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-full animate-[spin_10s_linear_infinite]" />
                            {/* Core */}
                            <div className="absolute inset-2 bg-white rounded-full shadow-[0_0_20px_white] flex items-center justify-center group-active:scale-90 transition-transform">
                                <ScanLine className="w-8 h-8 text-black opacity-50" />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="px-6 py-3 bg-white text-black font-mono text-xs font-bold tracking-widest rounded-full hover:shadow-[0_0_20px_white] transition-all flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            RESET
                        </button>
                    )}

                    {/* Placeholder for Balance */}
                    <div className="w-14 h-14" />
                </div>
            </div>

            {/* Corner Reticles (Static HUD) */}
            <div className="absolute inset-4 pointer-events-none opacity-40">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />

                {/* Center Crosshair small */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[1px] bg-emerald-500/50" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-emerald-500/50" />
                </div>
            </div>
        </div>
    );
}
