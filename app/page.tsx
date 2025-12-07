"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="z-10 max-w-5xl w-full flex flex-col items-center text-center px-4"
      >
        <motion.div variants={item} className="mb-6">
          <span className="px-3 py-1 rounded-full glass text-xs font-medium text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-800">
            Project Loop v1.0
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6"
        >
          <span className="text-gradient">Gotchu</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10"
        >
          The community-driven lost & found platform. Find what you've lost,
          return what you've found, and earn good karma.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/feed">
            <Button size="lg" className="rounded-full px-8 h-12 text-lg bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25">
              <Search className="mr-2 h-5 w-5" />
              Browse Feed
            </Button>
          </Link>
          <Link href="/report/lost">
            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-lg glass hover:bg-white/20 dark:hover:bg-white/10 border-violet-200 dark:border-violet-800">
              Report Lost Item
            </Button>
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        >
          <Link href="/report/lost" className="group">
            <div className="glass p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10 border-violet-100 dark:border-white/5 text-left h-full">
              <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                Lost Something?
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h2>
              <p className="text-muted-foreground">
                Post details about your lost item. The community will help you track it down.
              </p>
            </div>
          </Link>

          <Link href="/report/found" className="group">
            <div className="glass p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 border-indigo-100 dark:border-white/5 text-left h-full">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                Found Something?
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h2>
              <p className="text-muted-foreground">
                Report an item you've found. Return it to its owner and earn Karma points.
              </p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
