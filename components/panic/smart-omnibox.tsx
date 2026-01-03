"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, Send } from "lucide-react";

interface SmartOmniboxProps {
    onSubmit: (value: string) => void;
    isProcessing?: boolean;
}

export function SmartOmnibox({ onSubmit, isProcessing = false }: SmartOmniboxProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) onSubmit(value);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity duration-500" />

            <motion.div
                layout
                className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/50 transition-colors duration-300"
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="I lost my..."
                    disabled={isProcessing}
                    rows={1}
                    className="w-full bg-transparent text-white text-2xl md:text-3xl font-display font-medium p-6 md:p-8 outline-none resize-none placeholder:text-white/20 disabled:opacity-50"
                    style={{ minHeight: "100px" }}
                />

                <div className="flex items-center justify-between px-4 pb-4 md:px-6 md:pb-6">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Mic className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                        {value.trim() && (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={() => onSubmit(value)}
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Signal</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Helper Text */}
            <div className="mt-4 text-center">
                <p className="text-white/20 text-xs font-mono uppercase tracking-widest">
                    AI Analysis Active • Secure Channel
                </p>
            </div>
        </div>
    );
}
