"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Scan, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VisionCameraProps {
    onCapture: (file: File) => void;
    // AI Integration Props (Lifted State)
    onScan: (imageUrl: string) => void;
    isScanning: boolean;
    scanResult: any;
    debugLogs?: string[];
    workerStatus?: string;
}

export function VisionCamera({ onCapture, onScan, isScanning, scanResult, debugLogs, workerStatus }: VisionCameraProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial trigger ref to avoid double-firing if strict mode
    const hasScannedRef = useRef(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onCapture(file);

            // Trigger AI immediately
            if (!hasScannedRef.current) {
                // hasScannedRef.current = true; // Allow re-scans if they clear it?
                onScan(url);
            }
        }
    };

    const clear = () => {
        setPreview(null);
        hasScannedRef.current = false;
        if (inputRef.current) inputRef.current.value = "";
    };

    // If result comes in, we can show a "Locked" animation
    const label = scanResult?.[0]?.label;
    const score = scanResult?.[0]?.score;

    return (
        <div className="space-y-4">
            <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-2xl" onClick={() => !preview && inputRef.current?.click()}>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFile}
                    className="hidden"
                />

                {preview ? (
                    <div className="relative w-full h-full">
                        <img src={preview} alt="Captured" className="w-full h-full object-cover" />

                        {/* Scanning Effect Overlay */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-emerald-500/10 z-10"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-[scan_2s_linear_infinite]" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-32 h-32 border border-emerald-500/30 rounded-full animate-ping" />
                                    </div>
                                    <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        NEURAL SCANNING
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Result Overlay */}
                        <AnimatePresence>
                            {!isScanning && label && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl z-20"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase mb-1">Target Identified</p>
                                            <h3 className="text-xl font-medium text-white capitalize">{label}</h3>
                                            <p className="text-xs text-white/50">{Math.round(score * 100)}% Confidence</p>
                                        </div>
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/50">
                                            <Scan className="w-5 h-5 text-emerald-400" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={(e) => { e.stopPropagation(); clear(); }}
                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/80 transition-colors z-30"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/5 transition-all">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-6 bg-white/5 rounded-full mb-4 group-hover:scale-110 transition-transform ring-1 ring-white/10 group-hover:ring-emerald-500/50">
                                <Camera className="w-8 h-8" />
                            </div>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            Tap to Engage Sensor
                        </span>
                    </div>
                )}

                {/* Viewfinder Overlay (Static) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20" />
                </div>
            </div>

            {/* DEEP DIAGNOSTICS (v2.3) - Embedded in Camera now */}
            <div className="p-3 bg-black/60 rounded-lg border border-white/5 font-mono text-[10px]">
                <div className="flex justify-between items-center text-white/30 border-b border-white/5 pb-2 mb-2">
                    <span>NEURAL STATUS</span>
                    <span className={workerStatus === 'ALIVE' || workerStatus === 'READY' ? "text-emerald-500" : "text-amber-500"}>{workerStatus}</span>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto mb-2 opacity-60">
                    {debugLogs?.map((log, i) => (
                        <div key={i} className="text-white/50 truncate">→ {log}</div>
                    ))}
                </div>
                {/* Manual Trigger for Debugging */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onScan('https://raw.githubusercontent.com/nbharath1306/Gotchu/main/public/placeholder.jpg');
                    }}
                    className="w-full text-center py-1 bg-white/5 hover:bg-white/10 text-white/30 rounded text-[9px] uppercase tracking-widest border border-white/5"
                >
                    Test Calibration Signal
                </button>
            </div>
        </div>
    );
}
