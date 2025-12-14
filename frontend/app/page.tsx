"use client"


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 50, damping: 20 }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">




      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              variants={container}
              initial="hidden"
              animate={isLoaded ? "show" : "hidden"}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold tracking-tight">
                Software Quality <br />
                <span className="text-primary">Assessment</span>
              </motion.h1>
              <motion.p variants={item} className="text-xl text-muted-foreground">
                Measure, analyze, and improve software quality using ISO 15939 standards
              </motion.p>
              <motion.div variants={item} className="flex gap-4 justify-center pt-4">
                <Link href="/simulator" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Start Assessment
                </Link>
                <Link href="/references" className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors">
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Process Overview */}
        <section id="process" className="py-20 bg-accent/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">ISO 15939 Measurement Process</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A systematic approach to software measurement following international standards
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { step: 1, title: "Information Need", desc: "Define what information is needed and why it's important for decision-making." },
                { step: 2, title: "Measurable Concept", desc: "Identify the abstract concept that needs to be quantified." },
                { step: 3, title: "Entity & Attributes", desc: "Determine what to measure and which attributes are relevant." },
                { step: 4, title: "Base Measure", desc: "Collect raw data through direct measurement of attributes." },
                { step: 5, title: "Derived Measure", desc: "Calculate metrics by combining base measures using formulas." },
                { step: 6, title: "Indicator", desc: "Interpret results and provide actionable insights for improvement." }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for software quality measurement and analysis
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold">Data Visualization</h3>
                <p className="text-sm text-muted-foreground">Interactive charts and graphs for quality metrics</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <h3 className="text-xl font-semibold">Guided Workflow</h3>
                <p className="text-sm text-muted-foreground">Step-by-step process following ISO standards</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold">Real-time Analysis</h3>
                <p className="text-sm text-muted-foreground">Instant feedback and recommendations</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Assess Your Software Quality?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start measuring and improving your software quality today with our comprehensive assessment tool
            </p>
            <Link href="/simulator" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Launch Simulator
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
