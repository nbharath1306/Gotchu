"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, HeartHandshake, Sparkles, Zap, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        {/* Background Noise & Gradient */}
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-teal-50/50 via-white to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8 hover:border-teal-200 transition-colors cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Circle13 Product</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tight leading-[0.95] mb-8">
              Lost it? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 animate-aurora bg-[length:200%_auto]">
                We've gotchu.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 text-balance">
              The calm, organized way to recover lost items on campus. 
              Connect with honest students and get back what matters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/feed">
                <Button size="lg" className="h-14 px-8 text-lg rounded-2xl shadow-xl shadow-teal-900/20 hover:shadow-teal-900/30 hover:-translate-y-1 transition-all">
                  Browse Found Items
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/report/lost">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50/50">
                  I Lost Something
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why students trust Gotchu</h2>
            <p className="text-slate-500 text-lg">Built for safety, speed, and peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Large */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 text-teal-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Verified Community</h3>
                <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                  Every report and claim is tied to a verified student ID. No anonymous posts, no scams. Just a safe community looking out for each other.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Tall */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden md:row-span-2 flex flex-col justify-between group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900" />
              <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-slate-400 leading-relaxed">
                  Most items are recovered within 24 hours of being reported. Our matching algorithm alerts you instantly.
                </p>
              </div>
              
              <div className="relative z-10 mt-8 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-slate-300">Live Activity</span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-300">Found: Blue Airpods</div>
                  <div className="text-sm text-slate-300">Returned: ID Card</div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Standard */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 group"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Locations</h3>
              <p className="text-slate-500">
                Filter by campus zones like "Library" or "Canteen" to narrow your search instantly.
              </p>
            </motion.div>

            {/* Card 4: Standard */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 group"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Karma Points</h3>
              <p className="text-slate-500">
                Earn reputation for every item you return. Be a hero on campus.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-900 -z-20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <Sparkles className="h-10 w-10 text-teal-300" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to help out?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students making our campus a more honest and connected place.
          </p>
          <Link href="/api/auth/login">
            <Button size="lg" className="h-16 px-12 text-lg bg-white text-teal-900 hover:bg-teal-50 rounded-full shadow-2xl shadow-black/20 transition-all hover:scale-105 font-bold">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
