"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GitBranch, Shield, Zap, Users, BarChart } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: FileText,
    title: "ISO Standards Compliant",
    description: "Built on ISO 15939, 25010, and 25023 for comprehensive quality assessment",
  },
  {
    icon: GitBranch,
    title: "Structured Process",
    description: "Follow the proven 6-step measurement process from needs to indicators",
  },
  {
    icon: BarChart,
    title: "Real-time Analytics",
    description: "Visualize quality metrics with interactive charts and dashboards",
  },
  {
    icon: Zap,
    title: "Automated Collection",
    description: "Integrate with your tools to automatically collect base measures",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share insights and collaborate on quality improvement initiatives",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Enterprise-grade security to protect your quality data",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Everything You Need</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Comprehensive tools and features to measure, analyze, and improve your software quality
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
