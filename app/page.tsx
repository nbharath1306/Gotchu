"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">Circle13 Product</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Don't panic. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">
                We'll help you find it.
              </span>
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
              Gotchu is the calm, organized way to recover lost items on campus. 
              Connect with honest students and get back what matters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/feed">
                <Button size="lg" className="h-14 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/10 transition-all hover:scale-105 hover:shadow-xl">
                  Browse Found Items
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/report/lost">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-200 text-slate-700 hover:bg-white hover:text-teal-700 hover:border-teal-200 rounded-xl bg-white/50 backdrop-blur-sm transition-all">
                  I Lost Something
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Community",
                desc: "Only authenticated students can post and claim items. Safe, secure, and trusted."
              },
              {
                icon: Search,
                title: "Smart Matching",
                desc: "Our system helps match lost reports with found items automatically."
              },
              {
                icon: HeartHandshake,
                title: "Honest Returns",
                desc: "Join a community built on integrity. 95% of found items are returned."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-slate-50 flex items-center justify-center text-teal-600">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Hook / How it works */}
      <section className="py-32 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">From "Lost" to "Found" in 3 steps</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We've simplified the process to reduce your stress.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Report", desc: "Tell us what you lost and where. It takes less than a minute." },
              { step: "02", title: "Connect", desc: "Browse the feed or get notified when a match is found." },
              { step: "03", title: "Recover", desc: "Verify ownership and meet safely to get your item back." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className="absolute -top-6 left-8 text-6xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 mt-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Bring hope back to campus.
          </h2>
          <p className="text-xl text-slate-500 mb-10">
            Whether you lost something valuable or found something that belongs to someone else, 
            Gotchu is the place to make it right.
          </p>
          <Link href="/api/auth/login">
            <Button size="lg" className="h-14 px-10 text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl shadow-teal-600/20 transition-all hover:scale-105">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
