"use client";

import { useState } from "react";
import { SmartOmnibox } from "@/components/panic/smart-omnibox";
import { VisionCamera } from "@/components/mobile/vision-camera"; // [NEW] Unified Vision
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkerAI } from "@/hooks/use-worker-ai"; // [NEW] AI Hook

export default function ReportLostPage() {
  const router = useRouter();
  // Standardized Steps: CAPTURE -> DETAILS -> SUCCESS
  const [step, setStep] = useState<"CAPTURE" | "DETAILS" | "SUCCESS" | "PROCESSING">("CAPTURE");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // AI State
  const { classifyImage, result: aiResult, isLoading: aiIsLoading, logs: aiLogs, workerStatus } = useWorkerAI();

  const handleCapture = (file: File) => {
    setImageFile(file);
    // Auto-advance after scan so user sees the "Keys" tag
    setTimeout(() => setStep("DETAILS"), 2000);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (text: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStep("PROCESSING");

    try {
      let finalImageUrl = undefined;

      // 1. Upload Reference Photo (if exists)
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

      // 2. Submit with AI Label (if scanned)
      const aiLabel = aiResult && aiResult.length > 0 ? aiResult[0].label : undefined;
      const { submitNeuralReport } = await import("@/app/actions");
      const result = await submitNeuralReport(text, finalImageUrl, "LOST", undefined, aiLabel);

      if (result.success && result.itemId) {
        setStep("SUCCESS");
        setTimeout(() => {
          router.push(`/item/${result.itemId}/matches`);
        }, 2000);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

      {/* Purple Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <nav className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Abort Signal
        </Link>
      </nav>

      <div className="w-full max-w-2xl relative z-10 p-4">
        <AnimatePresence mode="wait">

          {/* STEP 1: REFERENCE IMAGE (Optional) */}
          {step === "CAPTURE" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-display font-medium text-white tracking-tight">
                  Reference Photo
                </h1>
                <p className="text-white/40 text-sm md:text-base">
                  Do you have an old photo of what you lost?
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <VisionCamera
                  onCapture={handleCapture}
                  onScan={classifyImage}
                  isScanning={aiIsLoading}
                  scanResult={aiResult}
                  debugLogs={aiLogs}
                  workerStatus={workerStatus}
                />
              </div>

              <div className="text-center mt-8">
                <button onClick={() => setStep("DETAILS")} className="text-xs font-mono text-white/30 hover:text-white underline decoration-dashed underline-offset-4">
                  I DON T HAVE A PHOTO • SKIP
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight">
                  What is missing?
                </h1>
                <p className="text-white/40 text-lg">
                  Describe the item. We'll handle the categorization.
                </p>
              </div>

              {imageFile && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full border border-white/10">
                    <CheckCircle2 className="w-3 h-3 text-purple-500" />
                    <span className="text-xs font-mono text-purple-400">REFERENCE PHOTO ATTACHED</span>
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
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" style={{ animationDelay: "0.5s" }} />
                <div className="absolute inset-8 bg-purple-500 rounded-full animate-pulse blur-lg opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-mono text-white tracking-widest uppercase animate-pulse">
                  Broadcasting Signal...
                </h2>
                <p className="text-white/40 text-sm mt-2 font-mono">
                  SYNCING NEURAL CLOUD
                </p>
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-display font-medium text-white">Signal Broadcasted.</h2>
                <p className="text-white/40 mt-2">The network is now searching for your item.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
