"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, MapPin, Bell, Shield, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="max-w-6xl mx-auto relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Trusted by 500+ students
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Lost something?
              <br />
              <span className="text-gray-400">We have got you.</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-xl text-gray-500 text-center max-w-2xl mx-auto leading-relaxed"
          >
            The modern lost and found platform for your campus. 
            Report, search, and recover items in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <Link href="/feed">
              <Button size="lg" className="h-14 px-8 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                Browse Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/report/lost">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                Report Lost Item
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-12 mt-20"
          >
            {[
              { value: "500+", label: "Items Posted" },
              { value: "89%", label: "Recovery Rate" },
              { value: "24h", label: "Avg Response" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Visual Section - Cards Preview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Sample Cards */}
            {[
              { type: "lost", title: "AirPods Pro", location: "Library 2nd Floor", time: "2 hours ago", color: "red" },
              { type: "found", title: "Student ID Card", location: "Cafeteria", time: "Just now", color: "green" },
              { type: "lost", title: "MacBook Charger", location: "Engineering Building", time: "5 hours ago", color: "red" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.color === "red" 
                      ? "bg-red-50 text-red-600" 
                      : "bg-green-50 text-green-600"
                  }`}>
                    {item.type === "lost" ? "Lost" : "Found"}
                  </span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Simple, fast, and effective. Built for the way students actually use it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Search, title: "Smart Search", desc: "Find items instantly with powerful filters" },
              { icon: Bell, title: "Instant Alerts", desc: "Get notified when your item is found" },
              { icon: Shield, title: "Verified Users", desc: "Only authenticated students can post" },
              { icon: Zap, title: "Quick Reports", desc: "Post an item in under 30 seconds" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-400">
              Three simple steps to recover your items
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Report", desc: "Lost something? Create a report with details and location." },
              { step: "02", title: "Match", desc: "Our system matches lost and found reports automatically." },
              { step: "03", title: "Connect", desc: "Get connected with the finder and recover your item." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <span className="text-4xl font-bold text-white/20">{item.step}</span>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to find what you lost?
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Join hundreds of students already using Gotchu
            </p>
            <Link href="/api/auth/login">
              <Button size="lg" className="h-14 px-10 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                Get Started — It is Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-xl text-gray-900">Gotchu</div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/feed" className="hover:text-gray-900 transition-colors">Feed</Link>
            <Link href="/report/lost" className="hover:text-gray-900 transition-colors">Report</Link>
            <Link href="/profile" className="hover:text-gray-900 transition-colors">Profile</Link>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 Gotchu. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
