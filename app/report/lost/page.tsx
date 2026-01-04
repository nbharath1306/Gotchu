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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden transition-colors duration-1000">
      {/* Soothing Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
      </div>

      <nav className="absolute top-8 left-8 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium tracking-wide group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Go Back</span>
        </Link>
      </nav>

      <div className="w-full max-w-2xl relative z-10 p-4">
        {/* Progress Stepper - visualized as simple dots for now */}
        <div className="flex justify-center mb-12 gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${(s === 1 && step === "CAPTURE") || (s === 2 && step === "DETAILS") || (s === 3 && step === "SUCCESS")
                ? "w-8 bg-indigo-500"
                : "w-2 bg-white/10"
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1: REFERENCE IMAGE (Optional) */}
          {step === "CAPTURE" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl font-display font-medium text-white tracking-tight">
                  Do you have a photo?
                </h1>
                <p className="text-slate-400 text-base">
                  Uploading a photo helps our AI match your item with found reports.
                </p>
              </div>

              <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-50" />
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
                <button
                  onClick={() => setStep("DETAILS")}
                  className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
                >
                  I don't have a photo
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
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">
                  Tell us what happened
                </h1>
                <p className="text-slate-400 text-lg">
                  Describe the item and where you might have lost it.
                </p>
              </div>

              {imageFile && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-indigo-500/10 py-1.5 px-4 rounded-full border border-indigo-500/20">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-200">Photo Attached</span>
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
                <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-ping" />
                <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-ping delay-300" />
                <div className="absolute inset-4 bg-indigo-500/20 rounded-full animate-pulse blur-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-medium text-white">
                  Processing Report...
                </h2>
                <p className="text-slate-500 text-sm">
                  Analyzing details and checking for matches
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
              className="flex flex-col items-center justify-center space-y-8 max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-medium text-white">Report Received</h2>
                <p className="text-slate-400">We've alerted the community nearby.</p>
              </div>

              {/* What Happens Next Card */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">What happens next?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <span className="text-indigo-400 text-xs font-bold">1</span>
                    </div>
                    <span>Our AI is currently scanning all found items for matches.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <span className="text-indigo-400 text-xs font-bold">2</span>
                    </div>
                    <span>You'll get an instant notification if we find a high-confidence match.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <span className="text-indigo-400 text-xs font-bold">3</span>
                    </div>
                    <span>Check your dashboard to track the status.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full py-4 bg-white text-black font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Return Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
