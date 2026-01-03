"use client";

import { useState } from "react";
import { SmartOmnibox } from "@/components/panic/smart-omnibox";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReportLostPage() {
  const router = useRouter();
  const [step, setStep] = useState<"INPUT" | "PROCESSING" | "SUCCESS">("INPUT");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (text: string, imageUrl?: string, embedding?: number[], aiLabel?: string) => {
    if (isSubmitting) return; // Prevent duplicates
    setIsSubmitting(true);
    // DO NOT set PROCESSING step immediately if we want to keep the input visible until we know it's working
    // But for the "Scanner" effect, we want to show it.
    // Let's set PROCESSING but handle error reversion carefully.
    setStep("PROCESSING");

    try {
      const { submitNeuralReport } = await import("@/app/actions");
      const result = await submitNeuralReport(text, imageUrl, "LOST", embedding, aiLabel);

      if (result.error) {
        // Revert to input on error so user isn't stuck
        alert("Signal jammed: " + result.error);
        setStep("INPUT");
        setIsSubmitting(false);
        return;
      }

      if (result.success && result.itemId) {
        // Success! Keep the scanner or move to checkmark
        setStep("SUCCESS");
        setTimeout(() => {
          router.push(`/item/${result.itemId}/matches`);
        }, 2000);
      } else {
        throw new Error("No ID returned");
      }

    } catch (e: any) {
      console.error(e);
      alert("System Error: " + e.message);
      setStep("INPUT");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
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

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {step === "INPUT" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight">
                  What is missing?
                </h1>
                <p className="text-white/40 text-lg">
                  Describe the item. We'll handle the categorization.
                </p>
              </div>

              <SmartOmnibox onSubmit={handleSubmit} isProcessing={isSubmitting} />
            </motion.div>
          )}

          {step === "PROCESSING" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative w-24 h-24">
                {/* Radar Ping Animation */}
                <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-ping opacity-20" style={{ animationDelay: "0.5s" }} />
                <div className="absolute inset-8 bg-purple-500 rounded-full animate-pulse blur-lg opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-mono text-white tracking-widest uppercase animate-pulse">
                  Scanning Network...
                </h2>
                <p className="text-white/40 text-sm mt-2 font-mono">
                  ANALYZING SIGNAL • MATCHING PATTERNS
                </p>
              </div>
            </motion.div>
          )}

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
