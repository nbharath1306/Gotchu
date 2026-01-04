"use client";

import { useState } from "react";
import { SmartOmnibox } from "@/components/panic/smart-omnibox";
import { VisionCamera } from "@/components/mobile/vision-camera";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkerAI } from "@/hooks/use-worker-ai";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function ReportLostPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CAPTURE" | "DETAILS" | "SUCCESS" | "PROCESSING">("CAPTURE");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // AI State
  const { classifyImage, result: aiResult, isLoading: aiIsLoading, logs: aiLogs, workerStatus } = useWorkerAI();

  const handleCapture = (file: File) => {
    setImageFile(file);
    setTimeout(() => setStep("DETAILS"), 2000);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (text: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStep("PROCESSING");

    try {
      let finalImageUrl = undefined;

      if (imageFile) {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { nanoid } = await import("nanoid");

        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const fileName = `${nanoid()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from("items").upload(filePath, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("items").getPublicUrl(filePath);
          finalImageUrl = publicUrl;
        }
      }

      const aiLabel = aiResult && aiResult.length > 0 ? aiResult[0].label : undefined;
      const { submitNeuralReport } = await import("@/app/actions");
      const result = await submitNeuralReport(text, finalImageUrl, "LOST", undefined, aiLabel);

      if (result.success && result.itemId) {
        setStep("SUCCESS");
      } else {
        alert("Signal jammed: " + result.error);
        setIsSubmitting(false);
        setStep("DETAILS");
      }

    } catch (e: any) {
      console.error(e);
      alert("System Error: " + e.message);
      setIsSubmitting(false);
      setStep("DETAILS");
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <nav className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
        >
          <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium tracking-widest uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Go Back Home
          </span>
        </Link>
      </nav>

      <div className="w-full max-w-3xl relative z-10 p-6">
        {/* Cinematic Progress Stepper */}
        <div className="flex justify-center mb-16 gap-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-700 ease-out ${(s === 1 && step === "CAPTURE") || (s === 2 && step === "DETAILS") || (s === 3 && step === "SUCCESS")
                ? "w-12 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                : "w-2 bg-white/10"
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: REFERENCE IMAGE */}
          {step === "CAPTURE" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <TextReveal
                    text="Tell us what you lost."
                    className="text-4xl md:text-5xl font-display font-medium text-white tracking-tighter justify-center"
                    delay={0.2}
                  />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-white/40 text-lg font-light"
                >
                  Take a deep breath. A photo helps us search, but it's okay if you don't have one.
                </motion.p>
              </div>

              <div className="max-w-md mx-auto relative group perspective-[1000px]">
                {/* Holographic Frame */}
                <div className="absolute -inset-4 border border-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-105" />
                <div className="absolute -inset-1 bg-gradient-to-t from-indigo-500/20 to-transparent rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />

                <div className="relative transform transition-transform duration-500 group-hover:rotate-x-2 group-hover:rotate-y-2">
                  <VisionCamera
                    onCapture={handleCapture}
                    onScan={classifyImage}
                    isScanning={aiIsLoading}
                    scanResult={aiResult}
                    debugLogs={aiLogs}
                    workerStatus={workerStatus}
                  />
                  {/* Scanning Line Effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="w-full h-[2px] bg-indigo-500/50 shadow-[0_0_20px_#6366f1] animate-[scan_3s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <MagneticButton onClick={() => setStep("DETAILS")} className="text-sm text-white/40 hover:text-white underline decoration-dashed underline-offset-4 cursor-pointer">
                  I don't have a photo
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <TextReveal
                  text="Help us find it."
                  className="text-4xl md:text-5xl font-display font-medium text-white tracking-tighter justify-center"
                />
                <p className="text-white/40 text-lg">
                  Share a few details. The community is ready to look out for you.
                </p>
              </div>

              {imageFile && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-3 bg-indigo-500/10 py-2 px-5 rounded-full border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-200 tracking-wide">Photo Attached</span>
                  </div>
                </div>
              )}

              <SmartOmnibox
                onSubmit={handleSubmit}
                isProcessing={isSubmitting}
                aiLabel={aiResult && aiResult.length > 0 ? aiResult[0].label : undefined}
              />
            </motion.div>
          )}

          {/* PROCESSING ANIMATION */}
          {step === "PROCESSING" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-12"
            >
              {/* Sci-Fi Loader */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin duration-1000" />
                <div className="absolute inset-4 border-r-2 border-purple-500 rounded-full animate-spin duration-2000 reverse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_20px_white]" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="text-center space-y-2">
                  <TextReveal text="Broadcasting your signal..." className="text-lg font-mono text-indigo-300 justify-center" delay={0.5} />
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center space-y-8 max-w-lg mx-auto"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-float">
                <Sparkles className="w-12 h-12 text-emerald-400" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-4xl font-display font-medium text-white">We've started the search.</h2>
                <p className="text-emerald-400/80 tracking-wide font-mono text-sm">NOTIFICATIONS ACTIVE</p>
              </div>

              {/* Glass Card */}
              <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors duration-500">
                <h3 className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-widest border-b border-white/10 pb-4">What happens now?</h3>
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/40 transition-colors">
                      <span className="text-indigo-400 text-xs font-bold">1</span>
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">Your report is being shown to people nearby.</span>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/40 transition-colors">
                      <span className="text-indigo-400 text-xs font-bold">2</span>
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">If someone finds something similar, we'll alert you immediately.</span>
                  </li>
                </ul>
              </div>

              <MagneticButton
                onClick={() => router.push('/')}
                className="w-full py-5 bg-white text-black font-medium rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Go Home
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}
