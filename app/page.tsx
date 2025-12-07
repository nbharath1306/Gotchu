"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Search, ShieldCheck, Sparkles, Users, Zap, Star, TrendingUp, Clock } from "lucide-react"
import { ParticleField } from "@/components/particle-field"
import { FloatingItems } from "@/components/floating-items"
import { AnimatedGradientOrb } from "@/components/animated-gradient"
import { useRef } from "react"

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const stats = [
    { number: "500+", label: "Items Returned", icon: ShieldCheck },
    { number: "2K+", label: "Active Users", icon: Users },
    { number: "98%", label: "Success Rate", icon: TrendingUp },
    { number: "<24h", label: "Avg. Return Time", icon: Clock },
  ]

  return (
    <div ref={containerRef} className="relative">
      {/* Particle Background */}
      <ParticleField />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatedGradientOrb />
        <FloatingItems />
        
        <motion.div
          style={{ y, opacity }}
          className="z-10 max-w-6xl w-full flex flex-col items-center text-center px-4"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 text-sm font-medium text-violet-400">
              <Sparkles className="h-4 w-4" />
              DSU Harohalli's #1 Lost & Found Platform
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6 relative"
          >
            <span className="relative">
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent blur-2xl opacity-50">
                Gotchu
              </span>
              <span className="relative bg-gradient-to-r from-violet-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                Gotchu
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12 leading-relaxed"
          >
            Lost something on campus? Found an item? 
            <span className="text-violet-400 font-semibold"> Connect instantly</span> with your community. 
            We've got you covered.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link href="/feed">
              <Button 
                size="lg" 
                className="group relative overflow-hidden rounded-full px-8 h-14 text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Feed
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Link href="/report/lost">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 h-14 text-lg border-2 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 hover:scale-105"
              >
                <Zap className="mr-2 h-5 w-5 text-amber-500" />
                Report Item
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon className="h-6 w-6 text-violet-400 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to reunite lost items with their owners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Report",
                description: "Lost something? Found an item? Report it in seconds with our intuitive form.",
                icon: "📝",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                step: "02",
                title: "Connect",
                description: "Get matched instantly. Our smart system connects finders with owners.",
                icon: "🔗",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                step: "03",
                title: "Reunite",
                description: "Meet up safely on campus. Earn karma points for being a good samaritan!",
                icon: "🎉",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 h-full">
                  <span className={`text-7xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent opacity-20`}>
                    {feature.step}
                  </span>
                  <div className="text-5xl mb-4 -mt-8">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-indigo-500/20 backdrop-blur-xl border border-white/10 text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium mb-6"
              >
                <Star className="h-4 w-4 fill-current" />
                Earn Karma Points
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to help your campus community?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join hundreds of students making DSU Harohalli a better place. Every item returned is a story of kindness.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/report/found">
                  <Button 
                    size="lg" 
                    className="rounded-full px-10 h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-2xl shadow-green-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Report Found Item
                  </Button>
                </Link>
                <Link href="/report/lost">
                  <Button 
                    size="lg" 
                    className="rounded-full px-10 h-14 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-2xl shadow-red-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Report Lost Item
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Gotchu
          </div>
          <p className="text-muted-foreground text-sm">
            Made with 💜 for DSU Harohalli Campus
          </p>
          <p className="text-muted-foreground/50 text-xs mt-2">
            © 2024 Gotchu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
