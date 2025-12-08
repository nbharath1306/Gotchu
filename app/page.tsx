"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, HeartHandshake, Sparkles, Zap, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm mb-10 hover:border-teal-200/50 transition-colors cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
              <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">Circle13 Product</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-bold text-slate-900 tracking-tighter leading-[0.9] mb-8">
              Lost it? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 animate-aurora bg-[length:200%_auto] text-glow">
                We've gotchu.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 text-balance font-medium">
              The calm, organized way to recover lost items on campus. 
              Connect with honest students and get back what matters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/feed">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-1 transition-all duration-300">
                  Browse Found Items
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/report/lost">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-slate-200 bg-white/50 backdrop-blur-sm text-slate-600 hover:text-teal-700 hover:border-teal-200 hover:bg-white/80 transition-all duration-300">
                  I Lost Something
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why students trust Gotchu</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">Built for safety, speed, and peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Large */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm text-teal-500">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Verified Community</h3>
                <p className="text-slate-500 text-xl leading-relaxed max-w-lg">
                  Every report and claim is tied to a verified student ID. No anonymous posts, no scams. Just a safe community looking out for each other.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Tall */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden md:row-span-2 flex flex-col justify-between group shadow-2xl shadow-slate-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950" />
              <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-20" />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-teal-900/20 to-transparent" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                  <Zap className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Lightning Fast</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Most items are recovered within 24 hours of being reported. Our matching algorithm alerts you instantly.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Standard */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -ml-16 -mb-16 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm text-indigo-500">
                  <Bell className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Alerts</h3>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Get notified the moment someone finds an item matching your description.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Standard */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm text-rose-500">
                  <HeartHandshake className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Karma Points</h3>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Earn rewards and recognition for being a helpful member of the community.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
