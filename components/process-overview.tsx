"use client"

import { Card } from "@/components/ui/card"
import { ArrowRight, Target, Lightbulb, Database, Ruler, Calculator, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    number: 1,
    title: "Information Need",
    description: "Define what you want to learn about your software quality",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: 2,
    title: "Measurable Concept",
    description: "Convert needs into concrete, measurable concepts",
    icon: Lightbulb,
    color: "from-cyan-500 to-teal-500",
  },
  {
    number: 3,
    title: "Entity & Attributes",
    description: "Identify what to measure and their properties",
    icon: Database,
    color: "from-teal-500 to-green-500",
  },
  {
    number: 4,
    title: "Base Measure",
    description: "Collect raw data through direct measurement",
    icon: Ruler,
    color: "from-green-500 to-emerald-500",
  },
  {
    number: 5,
    title: "Derived Measure",
    description: "Calculate meaningful metrics from base measures",
    icon: Calculator,
    color: "from-emerald-500 to-lime-500",
  },
  {
    number: 6,
    title: "Indicator",
    description: "Generate actionable insights for decision making",
    icon: TrendingUp,
    color: "from-lime-500 to-green-600",
  },
]

export function ProcessOverview() {
  return (
    <section id="process" className="border-b border-border py-20 md:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">The ISO 15939 Process</h2>
            <p className="text-pretty text-lg text-muted-foreground">
              A structured 6-step approach to transform information needs into actionable quality indicators
            </p>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group relative h-full overflow-hidden p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${step.color}`}
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">{step.number}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="absolute -bottom-3 -right-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
