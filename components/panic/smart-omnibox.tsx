"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, Send, MicOff, Image as ImageIcon, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { nanoid } from "nanoid";

interface SmartOmniboxProps {
    onSubmit: (value: string, imageUrl?: string, embedding?: number[], aiLabel?: string) => void;
    isProcessing?: boolean;
    placeholder?: string;
}

import { useWorkerAI } from "@/hooks/use-worker-ai";
import { toast } from "sonner";



export function SmartOmnibox({ onSubmit, isProcessing = false, placeholder = "I lost my..." }: SmartOmniboxProps) {
    const [value, setValue] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // AI Integration
    const { classifyImage, embedText, result: aiResult, embedding: nlpEmbedding, progress: aiProgress, isLoading: aiIsLoading, error: aiError, workerStatus, logs: aiLogs } = useWorkerAI();

    // State to track if we are waiting for embedding to submit
    const [isCalculatingEmbedding, setIsCalculatingEmbedding] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    // AI Result Handler
    // AI Result Handler - Kept minimal as HUD handles display now
    useEffect(() => {
        if (aiResult && aiResult.length > 0) {
            const topPrediction = aiResult[0];
            const label = topPrediction.label;
            const score = Math.round(topPrediction.score * 100);

            // Auto-populate text if empty
            if (score > 70 && !value.trim()) {
                setValue(`Found a ${label}.`);
            }
        }
    }, [aiResult]);

    // NLP Embedding Handler: Submit when ready
    useEffect(() => {
        if (isCalculatingEmbedding && nlpEmbedding) {
            setIsCalculatingEmbedding(false);

            // Did the Vision AI see something?
            let label = undefined;
            if (aiResult && aiResult.length > 0) {
                label = aiResult[0].label;
            }

            onSubmit(value, imageUrl || undefined, nlpEmbedding, label);
        }
    }, [nlpEmbedding, isCalculatingEmbedding, value, imageUrl, onSubmit]);

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

        // 1. Trigger AI Analysis (Local Blob)
        const blobUrl = URL.createObjectURL(file);
        classifyImage(blobUrl);

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

            // Artificial delay to ensure user sees the "Scanning" animation (UX)
            // If the model is cached, it might be too fast (0ms).
            if (!aiIsLoading) {
                // Force a re-classify to show animation if it was instant
                classifyImage(blobUrl);
            }
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
        // Did the AI see something?
        let label = undefined;
        if (aiResult && aiResult.length > 0) {
            label = aiResult[0].label;
        }

        onSubmit(value, imageUrl || undefined, undefined, label); // Passing embedding as undefined locally, or we handle logic outside
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
                    placeholder={
                        aiProgress?.status === 'loading'
                            ? `Downloading AI Models... ${Math.round(aiProgress.progress || 0)}%`
                            : isListening
                                ? "Listening..."
                                : placeholder
                    }
                    disabled={isProcessing}
                    rows={1}
                    className="w-full bg-transparent text-white text-2xl md:text-3xl font-display font-medium p-6 md:p-8 outline-none resize-none placeholder:text-white/20 disabled:opacity-50"
                    style={{ minHeight: "100px" }}
                />

                {/* Image Preview & Neural HUD */}
                <AnimatePresence>
                    {(imageUrl || aiResult) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 pb-2 space-y-3"
                        >
                            <div className="flex items-center gap-4">
                                {imageUrl && (
                                    <div className="relative inline-block group/img">
                                        <div className={`relative rounded-lg overflow-hidden ${aiIsLoading ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black/50' : ''}`}>
                                            <img src={imageUrl} alt="Evidence" className="h-16 w-16 object-cover" />
                                            {aiIsLoading && (
                                                <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setImageUrl(null)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* VISUAL INTELLIGENCE CHIP */}
                                {aiResult && aiResult.length > 0 && !aiIsLoading && (
                                    <motion.div
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm"
                                    >
                                        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-1.5 flex-shrink-0">
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest leading-tight">NEURAL VISION MATCH</p>
                                            <p className="text-white font-medium text-sm leading-tight">
                                                {aiResult[0].label} <span className="text-white/40">({Math.round(aiResult[0].score * 100)}%)</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {aiIsLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex-1"
                                    >
                                        <div className="h-10 bg-white/5 rounded-xl animate-pulse flex items-center px-4">
                                            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce mr-1" />
                                            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce delay-75 mr-1" />
                                            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce delay-150 mr-2" />
                                            <span className="text-purple-300 text-xs font-mono">NEURAL SCANNING...</span>
                                        </div>
                                    </motion.div>
                                )}
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
                                disabled={isProcessing || aiIsLoading} // BLOCK SUBMIT IF AI IS THINKING
                                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {isProcessing || aiIsLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {aiIsLoading ? "Analyzing..." : "Processing..."}
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

                {/* DEBUG CONSOLE (Temporary) */}
                <div className="mt-4 p-4 bg-black/50 rounded-xl text-left font-mono text-[10px] text-green-400 border border-green-900 overflow-hidden">
                    <p className="mb-1 text-white/50 border-b border-white/10 pb-1">SYSTEM DIAGNOSTICS (v2.2)</p>
                    <p>STATUS: {aiIsLoading ? <span className="text-yellow-400 animate-pulse">BUSY</span> : <span className="text-green-500">IDLE</span>}</p>
                    <p>REF STATE: <span className={workerStatus === 'READY' ? "text-green-400" : "text-red-500"}>{workerStatus}</span></p>
                    <p>BROWSER: {typeof Worker !== 'undefined' ? 'OK' : 'NO WORKER SUPPORT'}</p>
                    <p>ERROR: <span className="text-red-400">{aiError || 'NONE'}</span></p>
                    <p>RESULT: {aiResult ? `${aiResult[0]?.label} (${Math.round(aiResult[0]?.score * 100)}%)` : 'NULL'}</p>
                    <p>PROGRESS: {aiProgress?.progress ? `${Math.round(aiProgress.progress)}%` : '0%'}</p>

                    <div className="mt-2 border-t border-green-900 pt-2 opacity-70">
                        <p className="mb-1 text-white/40">EVENT LOG:</p>
                        {aiLogs && aiLogs.map((log, i) => (
                            <p key={i} className="whitespace-nowrap overflow-hidden text-ellipsis">→ {log}</p>
                        ))}
                    </div>

                    <button
                        onClick={() => classifyImage('https://raw.githubusercontent.com/nbharath1306/Gotchu/main/public/placeholder.jpg')} // Dummy test
                        className="mt-2 text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded hover:bg-red-500/40"
                    >
                        [TEST TRIGGER]
                    </button>
                </div>
            </div>
        </div>
    );
}
