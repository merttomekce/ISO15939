"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { StepDefine } from "@/components/simulator/step-define"
import { StepPlan } from "@/components/simulator/step-plan"
import { StepCollect } from "@/components/simulator/step-collect"
import { StepAnalyse } from "@/components/simulator/step-analyse"

const steps = [
  { id: 1, label: "Define" },
  { id: 2, label: "Plan" },
  { id: 3, label: "Collect" },
  { id: 4, label: "Analyse" },
]

export type CaseStudy = {
  id: string
  title: string
  description: string
  dimensionCount: number
  dimensions: string[]
  weights: Record<string, number>
}

const caseStudies: CaseStudy[] = [
  {
    id: "iot",
    title: "IoT System",
    description: "Internet of Things device with resource constraints and connectivity requirements",
    dimensionCount: 4,
    dimensions: ["Performance Efficiency", "Compatibility", "Reliability", "Security"],
    weights: {
      "Performance Efficiency": 30,
      Compatibility: 25,
      Reliability: 25,
      Security: 20,
    },
  },
  {
    id: "healthcare",
    title: "Safety Critical (Health)",
    description: "Healthcare system where reliability and accuracy are life-critical",
    dimensionCount: 4,
    dimensions: ["Reliability", "Security", "Functional Suitability", "Usability"],
    weights: {
      Reliability: 35,
      Security: 30,
      "Functional Suitability": 20,
      Usability: 15,
    },
  },
  {
    id: "mobile",
    title: "Mobile Application",
    description: "Consumer mobile app focused on user experience and cross-platform compatibility",
    dimensionCount: 4,
    dimensions: ["Usability", "Performance Efficiency", "Compatibility", "Portability"],
    weights: {
      Usability: 35,
      "Performance Efficiency": 25,
      Compatibility: 25,
      Portability: 15,
    },
  },
]

export function SimulatorWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null)
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [metrics, setMetrics] = useState<Record<string, Record<string, number>>>({})

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSelectedCaseStudy(null)
    setSelectedDimensions([])
    setWeights({})
    setMetrics({})
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                      currentStep > step.id
                        ? "border-green-500 bg-green-500 text-white"
                        : currentStep === step.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-6 w-6" /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-semibold ${currentStep === step.id ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="relative mx-2 h-0.5 flex-1 bg-muted">
                    <div
                      className={`absolute inset-0 bg-primary transition-all ${currentStep > step.id ? "w-full" : "w-0"}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <StepDefine
              caseStudies={caseStudies}
              selectedCaseStudy={selectedCaseStudy}
              setSelectedCaseStudy={setSelectedCaseStudy}
              selectedDimensions={selectedDimensions}
              setSelectedDimensions={setSelectedDimensions}
              setWeights={setWeights}
            />
          )}
          {currentStep === 2 && (
            <StepPlan
              selectedCaseStudy={selectedCaseStudy}
              selectedDimensions={selectedDimensions}
              weights={weights}
              setWeights={setWeights}
            />
          )}
          {currentStep === 3 && (
            <StepCollect selectedDimensions={selectedDimensions} metrics={metrics} setMetrics={setMetrics} />
          )}
          {currentStep === 4 && (
            <StepAnalyse
              selectedCaseStudy={selectedCaseStudy}
              selectedDimensions={selectedDimensions}
              weights={weights}
              metrics={metrics}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} size="lg">
            Previous
          </Button>
          <div className="rounded-full bg-muted px-6 py-2 font-semibold">
            {currentStep} / {steps.length}
          </div>
          {currentStep < steps.length ? (
            <Button onClick={handleNext} size="lg">
              Next
            </Button>
          ) : (
            <Button onClick={handleReset} size="lg" className="bg-green-600 hover:bg-green-700">
              Start New Measurement
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
