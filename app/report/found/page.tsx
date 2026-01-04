"use client";

import { useState } from "react";
import { VisionCamera } from "@/components/mobile/vision-camera";
import { SmartOmnibox } from "@/components/panic/smart-omnibox";
import { KarmaBurst } from "@/components/ui/karma-burst";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkerAI } from "@/hooks/use-worker-ai"; // Import Hook Here

export default function ReportFoundPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CAPTURE" | "DETAILS" | "SUCCESS" | "PROCESSING">("CAPTURE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [reportResult, setReportResult] = useState<{ itemId: string } | null>(null);

  // LIFTED AI STATE
  const { classifyImage, embedText, result: aiResult, embedding: nlpEmbedding, isLoading: aiIsLoading, logs: aiLogs, workerStatus } = useWorkerAI();

  const handleCapture = (file: File) => {
    setImageFile(file);
    // Do NOT auto-advance. Let the user see the AI result on the camera first.
    // We can add a "Continue" button or auto-advance after a few seconds.
    // For now, let's auto-advance after 2.5s to give time to read "Laptop Identified".
    setTimeout(() => setStep("DETAILS"), 2500);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simplified Submit - Takes Text from Box, merges with Image from Step 1
  const handleSmartSubmit = async (text: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStep("PROCESSING");

    try {
      let finalImageUrl = undefined;

      // 1. Upload Image (if exists)
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
        } else {
          console.error("Image upload failed:", uploadError);
        }
      }

      // 2. Prepare Data
      // Use the AI label from Step 1 if available
      const aiLabel = aiResult && aiResult.length > 0 ? aiResult[0].label : undefined;

      const { submitNeuralReport } = await import("@/app/actions");
      // Use NLP embedding if we had one? Wait, embedText wasn't called on the image label. 
      // Theoretically we could embed the label, but let's skip for now to keep it simple.
      // We rely on the server to embed the final text.

      const result = await submitNeuralReport(text, finalImageUrl, "FOUND", undefined, aiLabel);

      if (result.success && result.itemId) {
        setReportResult(result as any);
        setStep("SUCCESS");
        // Removed auto-redirect
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden transition-colors duration-1000">
      {/* Professional Background Gradients (Green/Teal) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-green-900/10 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
      </div>

      <nav className="absolute top-8 left-8 z-20">
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
        {/* Progress Stepper */}
        <div className="flex justify-center mb-12 gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${(s === 1 && step === "CAPTURE") || (s === 2 && step === "DETAILS") || (s === 3 && step === "SUCCESS")
                ? "w-8 bg-emerald-500"
                : "w-2 bg-white/10"
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
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl font-display font-medium text-white">What did you find?</h1>
                <p className="text-slate-400">Taking a photo helps the owner identify their item.</p>
              </div>

              <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-50" />
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
                  I can't take a photo
                </button>
              </div>
            </motion.div>
          )}

          {step === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-3 mb-12">
                <h1 className="text-3xl font-display font-medium text-white">Add Details</h1>
                <p className="text-slate-400">Help us categorize this item accurately.</p>
              </div>

              {/* If we have an image from step 1, show a small preview pill here? */}
              {imageFile && (
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 py-1.5 px-4 rounded-full mb-6 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-200">Photo Attached</span>
                </div>
              )}

              <div className="w-full">
                {/* Clean SmartOmnibox - Passed the AI Label from Step 1 */}
                <SmartOmnibox
                  onSubmit={handleSmartSubmit}
                  placeholder="I found a..."
                  isProcessing={isSubmitting}
                  aiLabel={aiResult && aiResult.length > 0 ? aiResult[0].label : undefined}
                />
              </div>

            </motion.div>
          )}

          {step === "SUCCESS" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center space-y-8 max-w-md mx-auto"
            >
              <KarmaBurst />
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-float">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-4xl font-display font-bold text-white">
                  Item Reported
                </h2>
                <p className="text-emerald-400 font-medium tracking-wide mt-2">Thanks for being a good citizen!</p>
              </div>

              {/* What Happens Next Card */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">What happens next?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 text-xs font-bold">1</span>
                    </div>
                    <span>We have logged this item in our public database.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 text-xs font-bold">2</span>
                    </div>
                    <span>If an owner claims it, we will notify you to arrange a handover.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 text-xs font-bold">3</span>
                    </div>
                    <span>You earned <span className="text-white font-bold">+50 Karma</span> for this report!</span>
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
      <div className="absolute bottom-4 right-4 text-white/10 text-[10px] font-mono pointer-events-none">
        GOTCHU OS v3.0 • VISION RESET
      </div>
    </div>
  );
}
