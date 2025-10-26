"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Target } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border py-20 md:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Target className="h-4 w-4" />
            ISO 15939 Compliant
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl"
          >
            Software Quality Measurement{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Made Simple</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl"
          >
            Transform information needs into actionable indicators with our comprehensive measurement process. Built on
            ISO 15939, 25010, and 25023 standards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="group">
              Start Measuring
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 rounded-xl border border-border bg-card p-2 shadow-2xl"
          >
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20" />
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/2 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>
    </section>
  )
}
