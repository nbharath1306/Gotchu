"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, Send, MicOff, Image as ImageIcon, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { nanoid } from "nanoid";

interface SmartOmniboxProps {
    onSubmit: (value: string, imageUrl?: string) => void;
    isProcessing?: boolean;
}

export function SmartOmnibox({ onSubmit, isProcessing = false }: SmartOmniboxProps) {
    const [value, setValue] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onresult = (event: any) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setValue(prev => {
                    // Avoid appending duplicate segments from interim results
                    // Simplest approach: Replace for now, or append intelligently
                    // For MVP: Just replace/set if empty
                    return transcript;
                });
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            alert("Voice input not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Image too large (max 5MB)");
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${nanoid()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("items")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("items")
                .getPublicUrl(filePath);

            setImageUrl(publicUrl);
        } catch (error: any) {
            console.error("Upload error:", error);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

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
            if ((value.trim() || imageUrl) && !isUploading) onSubmit(value, imageUrl || undefined);
        }
    };

    const handleSubmit = () => {
        onSubmit(value, imageUrl || undefined);
    }

    return (
        <div className="w-full max-w-2xl mx-auto relative group">
            {/* Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 transition-opacity duration-500 blur-xl ${isListening ? 'opacity-40 animate-pulse' : 'group-focus-within:opacity-20'}`} />

            <motion.div
                layout
                className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/50 transition-colors duration-300"
            >
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "I lost my..."}
                    disabled={isProcessing}
                    rows={1}
                    className="w-full bg-transparent text-white text-2xl md:text-3xl font-display font-medium p-6 md:p-8 outline-none resize-none placeholder:text-white/20 disabled:opacity-50"
                    style={{ minHeight: "100px" }}
                />

                {/* Image Preview Pill */}
                <AnimatePresence>
                    {imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 pb-2"
                        >
                            <div className="relative inline-block group/img">
                                <img src={imageUrl} alt="Evidence" className="h-16 w-16 object-cover rounded-lg border border-white/20" />
                                <button
                                    onClick={() => setImageUrl(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between px-4 pb-4 md:px-6 md:pb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleVoice}
                            className={`p-2 rounded-full transition-colors flex items-center gap-2 ${isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`p-2 rounded-full transition-colors flex items-center gap-2 ${isUploading ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <AnimatePresence>
                        {(value.trim() || imageUrl) && !isUploading && (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={handleSubmit}
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
                    {isListening ? 'VOICE MODULE ACTIVE' : 'AI ANALYSIS ACTIVE • SECURE CHANNEL'}
                </p>
            </div>
        </div>
    );
}
