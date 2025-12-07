"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, MapPin, Users, Shield, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-radial-fade pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Campus Lost & Found Platform
            </motion.div>
            
            {/* Main headline */}
            <motion.h1 
              variants={fadeIn}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white"
            >
              Lost something?
              <br />
              <span className="text-shine text-shine-animated">We got you.</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              variants={fadeIn}
              className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              The modern way to find your lost items on campus. 
              Report, search, and recover with our community-powered platform.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link href="/feed">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 h-12 text-base font-medium">
                  Browse Items
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/report/lost">
                <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 px-8 h-12 text-base font-medium">
                  Report Lost Item
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="relative py-20 px-4 border-y border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "500+", label: "Items Recovered" },
              { value: "2,000+", label: "Active Users" },
              { value: "95%", label: "Success Rate" },
              { value: "< 24h", label: "Avg. Recovery Time" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              A simple, streamlined process to help you find what you&apos;ve lost or return what you&apos;ve found.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Report & Search",
                description: "Quickly report a lost item or search through found items with our intuitive interface."
              },
              {
                icon: MapPin,
                title: "Location Tracking",
                description: "Pin the exact location where you lost or found an item for better visibility."
              },
              {
                icon: Users,
                title: "Connect Securely",
                description: "Chat directly with finders through our secure messaging system."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                  <feature.icon className="h-5 w-5 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Trust Section */}
      <section className="relative py-24 px-4 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Built for campus communities
              </h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Gotchu is designed specifically for university and college campuses. 
                Our platform integrates with your campus ecosystem to make finding lost items as simple as possible.
              </p>
              
              <div className="space-y-4">
                {[
                  "Verified campus accounts only",
                  "Real-time notifications",
                  "Private messaging system",
                  "Karma rewards for helpers"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Shield, label: "Secure", desc: "End-to-end encryption" },
                { icon: Zap, label: "Fast", desc: "Instant notifications" },
                { icon: Users, label: "Community", desc: "Peer-powered network" },
                { icon: MapPin, label: "Local", desc: "Campus-focused" }
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
                  <item.icon className="h-6 w-6 text-zinc-400 mb-3" />
                  <div className="font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-zinc-500">{item.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to find your lost items?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of students who have already recovered their belongings through Gotchu.
          </p>
          <Link href="/api/auth/login">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 h-12 text-base font-medium">
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-zinc-500">
            © 2024 Gotchu. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/feed" className="hover:text-zinc-300 transition-colors">Browse</Link>
            <Link href="/report/lost" className="hover:text-zinc-300 transition-colors">Report</Link>
            <Link href="/profile" className="hover:text-zinc-300 transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
