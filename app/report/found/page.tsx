"use client";

import { useState } from "react";
import { CameraCapture } from "@/components/hero/camera-capture";
import { KarmaBurst } from "@/components/ui/karma-burst";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Tag, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReportFoundPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CAPTURE" | "DETAILS" | "SUCCESS">("CAPTURE");
  const [image, setImage] = useState<File | null>(null);

  const handleCapture = (file: File) => {
    setImage(file);
    setTimeout(() => setStep("DETAILS"), 800);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("SUCCESS");
    setTimeout(() => {
      router.push("/feed");
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505]">
      <nav className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel Op
        </Link>
      </nav>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {step === "CAPTURE" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-display font-medium text-white">Identify Asset</h1>
                <p className="text-white/40">Secure a visual confirmation of the item.</p>
              </div>

              <CameraCapture onCapture={handleCapture} />
            </motion.div>
          )}

          {step === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-display font-medium text-white">Add Metadata</h1>
                <p className="text-white/40">Tag the location and category.</p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="glass-panel p-4 rounded-xl space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <select className="w-full bg-transparent text-white outline-none border-none">
                    <option>Electronics</option>
                    <option>Keys</option>
                    <option>ID / Wallet</option>
                    <option>Clothing</option>
                  </select>
                </div>

                <div className="glass-panel p-4 rounded-xl space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <input
                    placeholder="e.g. Student Center"
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/20"
                    required
                  />
                </div>

                <button className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-white/90 transition-colors mt-8">
                  Confirm Drop
                </button>
              </form>
            </motion.div>
          )}

          {step === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <KarmaBurst />
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-black" />
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                  +50 Karma
                </h2>
                <p className="text-emerald-400 font-mono text-sm tracking-widest mt-2 uppercase">Protocol Complete</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
