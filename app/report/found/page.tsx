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
        {/* Cinematic Progress Stepper (Emerald) */}
        <div className="flex justify-center mb-16 gap-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-700 ease-out ${(s === 1 && step === "CAPTURE") || (s === 2 && step === "DETAILS") || (s === 3 && step === "SUCCESS")
                ? "w-12 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "w-2 bg-white/10"
                }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
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
                    text="You found something!"
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
                  Thanks for helping. A photo makes it much easier to find the owner.
                </motion.p>
              </div>

              <div className="max-w-md mx-auto relative group perspective-[1000px]">
                {/* Holographic Frame (Emerald) */}
                <div className="absolute -inset-4 border border-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-105" />
                <div className="absolute -inset-1 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />

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
                    <div className="w-full h-[2px] bg-emerald-500/50 shadow-[0_0_20px_#10b981] animate-[scan_3s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <MagneticButton
                  onClick={() => setStep("DETAILS")}
                  className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
                >
                  Skip photo for now
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {step === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="space-y-12 text-center"
            >
              <div className="space-y-3 mb-12">
                <TextReveal
                  text="What does it look like?"
                  className="text-4xl md:text-5xl font-display font-medium text-white tracking-tighter justify-center"
                />
                <p className="text-slate-400 text-lg">Give us a few keywords so we can match it.</p>
              </div>

              {/* If we have an image from step 1, show a small preview pill here? */}
              {imageFile && (
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 py-1.5 px-4 rounded-full mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-200">Photo Added</span>
                </div>
              )}

              <div className="w-full">
                {/* Clean SmartOmnibox - Passed the AI Label from Step 1 */}
                <SmartOmnibox
                  onSubmit={handleSmartSubmit}
                  placeholder="I found a blue wallet..."
                  isProcessing={isSubmitting}
                  aiLabel={aiResult && aiResult.length > 0 ? aiResult[0].label : undefined}
                />
              </div>

            </motion.div>
          )}

          {step === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center space-y-8 max-w-lg mx-auto"
            >
              <KarmaBurst />
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-float">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-4xl font-display font-medium text-white">Item Logged!</h2>
                <p className="text-emerald-400 font-medium tracking-wide mt-2">YOU'RE A HERO</p>
              </div>

              {/* What Happens Next Card */}
              <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-colors duration-500">
                <h3 className="text-xs font-mono text-slate-400 mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Next Steps</h3>
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/40 transition-colors">
                      <span className="text-emerald-400 text-xs font-bold">1</span>
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">We've added this to the public database [ID: {reportResult?.itemId?.slice(0, 8) || "GENERATED"}].</span>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/40 transition-colors">
                      <span className="text-emerald-400 text-xs font-bold">2</span>
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">We'll let the owner know as soon as there's a match.</span>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/40 transition-colors">
                      <span className="text-emerald-400 text-xs font-bold">3</span>
                    </div>
                    <span className="text-slate-200 text-sm leading-relaxed font-medium">You earned <span className="text-emerald-400 text-shadow-emerald">+50 Karma</span> for helping out.</span>
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
