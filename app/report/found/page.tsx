"use client";

import { useState } from "react";
import { SmartOmnibox } from "@/components/panic/smart-omnibox";
import { VisionCamera } from "@/components/mobile/vision-camera";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkerAI } from "@/hooks/use-worker-ai";
import { KarmaBurst } from "@/components/ui/karma-burst";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function ReportFoundPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CAPTURE" | "DETAILS" | "SUCCESS" | "PROCESSING">("CAPTURE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [reportResult, setReportResult] = useState<{ itemId: string } | null>(null);

  // AI State
  const { classifyImage, embedText, result: aiResult, embedding: nlpEmbedding, isLoading: aiIsLoading, logs: aiLogs, workerStatus } = useWorkerAI();

  const handleCapture = (file: File) => {
    setImageFile(file);
    setTimeout(() => setStep("DETAILS"), 2000);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSmartSubmit = async (text: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // PROCESSING is not a discrete step here, but we could make it one to match 'Lost' page
    // For now, let's keep the flow simple or match 'Lost' page.
    // Let's stick to the current flow but add a loading state if needed.

    try {
      let finalImageUrl = undefined;

      // 1. Upload Photo
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

      // 2. Text Embedding (if needed)
      let embedding = nlpEmbedding;
      if (!embedding && text) {
        // Just in case we want to generate it on the fly, but useWorkerAI usually does this.
        // For this demo, we assume the hook handles it or we skip it.
      }

      // 3. Submit
      const aiLabel = aiResult && aiResult.length > 0 ? aiResult[0].label : undefined;
      const { submitNeuralReport } = await import("@/app/actions");

      // Found items might need location. For now undefined.
      const result = await submitNeuralReport(text, finalImageUrl, "FOUND", undefined, aiLabel);

      if (result.success && result.itemId) {
        setReportResult({ itemId: result.itemId });
        setStep("SUCCESS");
      } else {
        alert("Error: " + result.error);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      console.error(e);
      alert("System Error: " + e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      {/* Glass Navigation */}
      <nav className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all active:scale-95 shadow-lg shadow-black/20">
            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium tracking-widest uppercase text-white/50 group-hover:text-white transition-colors hidden md:block"
          >
            Abort
          </motion.span>
        </Link>
      </nav>

      <div className="w-full max-w-3xl relative z-10 p-6 pt-24">
        {/* Cinematic Progress Stepper */}
        <div className="flex justify-center mb-12 gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-700 ease-out backdrop-blur-sm ${(s === 1 && step === "CAPTURE") || (s === 2 && step === "DETAILS") || (s === 3 && step === "SUCCESS")
                ? "w-16 bg-gradient-to-r from-violet-500 to-cyan-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                : "w-3 bg-white/10"
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "CAPTURE" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <TextReveal text="Found Something?" className="text-4xl font-bold text-white mb-2" />
                <p className="text-white/50">Point the camera at the item to analyze it.</p>
              </div>

              <VisionCamera
                onCapture={handleCapture}
                onScan={(url) => {
                  classifyImage(url);
                }}
                isScanning={aiIsLoading}
                scanResult={aiLogs} // Using logs as transient result or similar
              />
            </motion.div>
          )}

          {step === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="mb-8">
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl group">
                  {imageFile && (
                    <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                        <span className="text-emerald-300 text-xs font-mono tracking-widest uppercase">Analysis Complete</span>
                      </div>
                      <h3 className="text-white font-medium text-lg">
                        {aiResult && aiResult.length > 0 ? aiResult[0].label : "Identified Item"}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">One Last Thing.</h2>
                  <p className="text-white/50">Add a quick note or details to help the owner.</p>
                </div>

                <SmartOmnibox
                  onSubmit={handleSmartSubmit}
                  isProcessing={isSubmitting}
                />
              </div>
            </motion.div>
          )}

          {step === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <KarmaBurst />
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-4">
                Karma +100
              </h2>
              <p className="text-white/60 max-w-xs mx-auto mb-12 leading-relaxed">
                You're a legend. The owner has been notified and the universe is smiling at you.
              </p>

              <Link href="/">
                <MagneticButton className="px-10 py-4 bg-white text-black font-medium rounded-full hover:scale-105 active:scale-95 transition-transform">
                  Return Home
                </MagneticButton>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global AI Overlay for processing states if needed */}
      {/* <AIProcessingOverlay isVisible={isSubmitting && step === 'PROCESSING'} /> */}

    </AuroraBackground>
  );
}
