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
    const [dataStream, setDataStream] = useState<string[]>([]);

    // Simulated Intelligence Data Stream
    useEffect(() => {
        if (!isScanning) {
            setDataStream([]);
            return;
        }
        const interval = setInterval(() => {
            setDataStream(prev => [Math.random().toString(16).substring(2, 8).toUpperCase(), ...prev.slice(0, 5)]);
        }, 150);
        return () => clearInterval(interval);
    }, [isScanning]);

    // Haptic feedback
    const vibrate = (pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            vibrate([10, 20, 10]); // Crisp haptic click
            setImgSrc(imageSrc);
            setCameraActive(false);

            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "luminous-capture.jpg", { type: "image/jpeg" });
                    onCapture(file);
                });

            onScan(imageSrc);
        }
    }, [webcamRef, onCapture, onScan]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            vibrate(10);
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
        <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden shadow-2xl group isolate font-display">

            {/* A. Live Webcam Feed - Zero Distractions */}
            <div className="absolute inset-0 z-0 bg-black">
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

            {/* B. The Luminous Interface (Layered) */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">

                {/* 1. Intelligence Layer: Top Status */}
                <div className="pt-6 flex justify-center w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isScanning ? "scanning" : "ready"}
                            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                            className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 shadow-lg"
                        >
                            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isScanning ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-white/50'}`} />
                            <span className="text-[11px] font-mono tracking-[0.2em] text-white/90">
                                {isScanning ? "ANALYZING TARGET" : "SYSTEM READY"}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. The Smart Aperture (Center) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Reticle - Always visible but subtle */}
                    <div className={`transition-opacity duration-300 ${isScanning ? 'opacity-0' : 'opacity-30'}`}>
                        <div className="w-8 h-[1px] bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        <div className="w-[1px] h-8 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* Kinetic Corners */}
                    <motion.div
                        initial={false}
                        animate={isScanning ? "scanning" : "idle"}
                        variants={{
                            idle: { width: "16rem", height: "16rem" }, // w-64
                            scanning: { width: "14rem", height: "14rem" } // tight lock
                        }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                        className="relative"
                    >
                        {/* TL */}
                        <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-2xl border-t-[3px] border-l-[3px] border-white drop-shadow-lg" />
                        {/* TR */}
                        <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-2xl border-t-[3px] border-r-[3px] border-white drop-shadow-lg" />
                        {/* BL */}
                        <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white drop-shadow-lg" />
                        {/* BR */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-2xl border-b-[3px] border-r-[3px] border-white drop-shadow-lg" />

                        {/* Scan Beam */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ top: 0, opacity: 0 }}
                                    animate={{ top: "100%", opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee]"
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* 3. Data Stream (Right Edge) */}
                <div className="absolute right-4 top-1/3 flex flex-col items-end gap-1 font-mono text-[9px] text-cyan-400/70 select-none">
                    <AnimatePresence>
                        {dataStream.map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1 - i * 0.15, x: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                0x{val}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* 4. Result Card (Materialized) */}
                <div className="absolute bottom-32 w-full flex justify-center pointer-events-auto px-6">
                    <AnimatePresence>
                        {label && !isScanning && !cameraActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="glass-panel w-full max-w-sm p-5 rounded-2xl flex items-center justify-between shadow-2xl border-white/20"
                            >
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-mono uppercase text-cyan-300 tracking-widest mb-1">Confidence {(score * 100).toFixed(0)}%</span>
                                    <h1 className="text-2xl text-white font-medium capitalize tracking-tight">{label}</h1>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                    <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 5. Control Deck (Glass) */}
                <div className="w-full h-24 glass-panel border-t border-white/10 backdrop-blur-2xl flex items-center justify-between px-10 pointer-events-auto rounded-t-3xl">
                    {/* Gallery */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <ImageIcon className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </button>

                    {/* Shutter Ring */}
                    {cameraActive ? (
                        <button
                            onClick={capture}
                            className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center group active:scale-95 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                            <div className="w-12 h-12 rounded-full bg-white scale-0 group-active:scale-100 transition-transform duration-100" />
                        </button>
                    ) : (
                        <button
                            onClick={retake}
                            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>
                    )}

                    {/* Settings / Close (Placeholder or Close) */}
                    <div className="p-3 opacity-0 pointer-events-none">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                </div>

            </div>
        </div>
    );
}
