"use client";

import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
// import { motion } from "framer-motion"; // Unused

interface CameraCaptureProps {
    onCapture: (file: File) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onCapture(file);
        }
    };

    const clear = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 group cursor-pointer" onClick={() => !preview && inputRef.current?.click()}>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Captured" className="w-full h-full object-cover" />
                    <button
                        onClick={(e) => { e.stopPropagation(); clear(); }}
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/5 transition-all">
                    <div className="p-6 bg-white/5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest">Tap to Snap</span>
                </div>
            )}

            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/20" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/20" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/20" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/20" />

                {/* Center Reticle */}
                {!preview && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/10 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                )}
            </div>
        </div>
    );
}
