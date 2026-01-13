"use client";

import { useState } from "react";
import { Mic, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SmartOmniboxProps {
    onSubmit: (text: string) => void;
    placeholder?: string;
    isProcessing?: boolean;
    aiLabel?: string;
}

export function SmartOmnibox({ onSubmit, placeholder = "Describe the item...", isProcessing = false, aiLabel }: SmartOmniboxProps) {
    const [query, setQuery] = useState("");
    const [isListening, setIsListening] = useState(false);

    // Voice Recognition
    const startListening = () => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(prev => prev + " " + transcript);
            };
            recognition.start();
        } else {
            alert("Voice not supported on this browser.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        onSubmit(query);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* AI Context Badge - Shows what the Neural Engine found */}
            <AnimatePresence>
                {aiLabel && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-emerald-300 font-mono uppercase tracking-wider">
                                Context: {aiLabel}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`relative group transition-all duration-300 ${isListening ? 'scale-105' : ''}`}>

                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isListening ? 'opacity-50 animate-pulse' : ''}`} />

                <form onSubmit={handleSubmit} className="relative bg-black rounded-2xl border border-white/10 p-2 flex items-center gap-2 shadow-2xl">

                    {/* Voice Button */}
                    <button
                        type="button"
                        onClick={startListening}
                        className={`p-3 rounded-xl transition-all ${isListening
                            ? 'bg-red-500/20 text-red-500 animate-pulse'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Mic className="w-5 h-5" />
                    </button>

                    {/* Text Input */}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isListening ? "Listening..." : placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/20 text-lg font-light h-12 px-2"
                        disabled={isProcessing}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!query.trim() || isProcessing}
                        className="p-3 bg-white text-black rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>

                {/* Helper Text */}
                <div className="mt-4 text-center">
                    <p className="text-white/20 text-xs font-mono uppercase tracking-widest">
                        {isListening ? 'VOICE MODULE ACTIVE' : 'SECURE CHANNEL • ENCRYPTED'}
                    </p>
                </div>
            </div>
        </div>
    );
}
