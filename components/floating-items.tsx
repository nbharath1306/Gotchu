"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const floatingItems = [
  { emoji: "📱", delay: 0 },
  { emoji: "🔑", delay: 0.5 },
  { emoji: "💳", delay: 1 },
  { emoji: "🎧", delay: 1.5 },
  { emoji: "👜", delay: 2 },
  { emoji: "📚", delay: 2.5 },
  { emoji: "⌚", delay: 3 },
  { emoji: "🎒", delay: 3.5 },
]

export function FloatingItems() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, index) => {
        const randomX = 10 + Math.random() * 80
        const randomY = 10 + Math.random() * 80
        
        return (
          <motion.div
            key={index}
            className="absolute text-4xl md:text-5xl opacity-20"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1.2, 0.8],
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 6,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {item.emoji}
          </motion.div>
        )
      })}
    </div>
  )
}
