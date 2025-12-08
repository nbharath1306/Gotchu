"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 bg-dot-pattern font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Circle13 Product</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6">
              Lost it? <br />
              <span className="text-slate-500">We've gotchu.</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
              The reliable way to recover lost items on campus. 
              Connect with honest students and get back what matters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/feed">
                <Button size="lg" className="h-12 px-8 text-base rounded-lg">
                  Browse Found Items
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/report/lost">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-lg">
                  I Lost Something
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why students trust Gotchu</h2>
            <p className="text-slate-500 text-lg">Built for safety, speed, and peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-clean p-8">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-900">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Community</h3>
              <p className="text-slate-500 leading-relaxed">
                Every report and claim is tied to a verified student ID. No anonymous posts, no scams. Just a safe community.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-clean p-8">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-900">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-500 leading-relaxed">
                Most items are recovered within 24 hours. Our matching system alerts you instantly when a match is found.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-clean p-8">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-900">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Honesty First</h3>
              <p className="text-slate-500 leading-relaxed">
                We reward honest students who return items. Building a culture of trust on campus, one item at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
