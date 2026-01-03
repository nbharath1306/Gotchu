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
        setTimeout(() => {
          router.push(`/item/${result.itemId}/matches`);
        }, 2500);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

      <nav className="absolute top-8 left-4 md:left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Abort
        </Link>
      </nav>

      <div className="w-full max-w-2xl relative z-10 p-4">
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
                  SKIP OPTICAL SENSOR
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
              className="space-y-6 text-center"
            >
              <div className="space-y-2 mb-12">
                <h1 className="text-3xl font-display font-medium text-white">Neural Analysis</h1>
                <p className="text-white/40">Describe the item details to sync with the network.</p>
              </div>

              {/* If we have an image from step 1, show a small preview pill here? */}
              {imageFile && (
                <div className="inline-flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full mb-6 border border-white/10">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-mono text-emerald-400">IMAGE SECURED</span>
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
              className="flex flex-col items-center justify-center space-y-6"
            >
              <KarmaBurst />
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-black" />
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                  Signal Locked
                </h2>
                <p className="text-emerald-400 font-mono text-sm tracking-widest mt-2 uppercase">Syncing Matches...</p>
              </div>
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
