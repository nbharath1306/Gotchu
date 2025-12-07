"use client"

import { motion } from "framer-motion"

export function AnimatedGradientOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Main Gradient Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0) 70%)",
          top: "-20%",
          left: "-10%",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0) 70%)",
          top: "50%",
          right: "-15%",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)",
          bottom: "-10%",
          left: "30%",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mesh Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(at 40% 20%, rgba(139,92,246,0.15) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(236,72,153,0.1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(59,130,246,0.1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgba(139,92,246,0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(236,72,153,0.1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, rgba(59,130,246,0.1) 0px, transparent 50%)
          `,
        }}
      />
    </div>
  )
}
