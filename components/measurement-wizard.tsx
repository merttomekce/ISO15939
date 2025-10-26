"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const steps = [
  { id: 1, title: "Information Need", description: "Define what you want to learn" },
  { id: 2, title: "Measurable Concept", description: "Convert to measurable concepts" },
  { id: 3, title: "Entity & Attributes", description: "Identify what to measure" },
  { id: 4, title: "Base Measure", description: "Define raw data collection" },
  { id: 5, title: "Derived Measure", description: "Calculate metrics" },
  { id: 6, title: "Indicator", description: "Generate actionable insights" },
]

export function MeasurementWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    informationNeed: "",
    measurableConcept: "",
    entity: "",
    attributes: "",
    baseMeasure: "",
    derivedMeasure: "",
    indicator: "",
  })

  const progress = (currentStep / steps.length) * 100

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

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "border-primary bg-background text-primary"
                      : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <span className="hidden text-xs font-medium md:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 transition-all md:w-16 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-base">
                  Step {currentStep}
                </Badge>
                <div>
                  <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
                  <CardDescription className="mt-1">{steps[currentStep - 1].description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="informationNeed">What do you want to learn?</Label>
                    <Textarea
                      id="informationNeed"
                      placeholder="e.g., Is the user experience of our mobile application at an acceptable level?"
                      value={formData.informationNeed}
                      onChange={(e) => setFormData({ ...formData, informationNeed: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h4 className="mb-2 font-semibold">Examples:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• What is the usability level of the software?</li>
                      <li>• Does the system have security vulnerabilities?</li>
                      <li>• Have we met our performance targets?</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualityCharacteristic">Quality Characteristic (ISO 25010)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quality characteristic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usability">Usability</SelectItem>
                        <SelectItem value="performance">Performance Efficiency</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="reliability">Reliability</SelectItem>
                        <SelectItem value="maintainability">Maintainability</SelectItem>
                        <SelectItem value="compatibility">Compatibility</SelectItem>
                        <SelectItem value="functional">Functional Suitability</SelectItem>
                        <SelectItem value="portability">Portability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="measurableConcept">Measurable Concept</Label>
                    <Input
                      id="measurableConcept"
                      placeholder="e.g., Task completion rate, Learning time, User error rate"
                      value={formData.measurableConcept}
                      onChange={(e) => setFormData({ ...formData, measurableConcept: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entity">Entity</Label>
                    <Input
                      id="entity"
                      placeholder="e.g., User interaction, Form field, Payment transaction"
                      value={formData.entity}
                      onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attributes">Attributes (comma-separated)</Label>
                    <Textarea
                      id="attributes"
                      placeholder="e.g., Duration, Success status, Error count"
                      value={formData.attributes}
                      onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseMeasure">Base Measure Definition</Label>
                    <Textarea
                      id="baseMeasure"
                      placeholder="e.g., Total payment initiations: count, Successful payments: count"
                      value={formData.baseMeasure}
                      onChange={(e) => setFormData({ ...formData, baseMeasure: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collectionMethod">Collection Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="How will you collect this data?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logs">Log file analysis</SelectItem>
                        <SelectItem value="automated">Automated measurement tools</SelectItem>
                        <SelectItem value="testing">User testing</SelectItem>
                        <SelectItem value="monitoring">System monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="derivedMeasure">Derived Measure Formula</Label>
                    <Input
                      id="derivedMeasure"
                      placeholder="e.g., Success Rate = (Successful / Total) × 100"
                      value={formData.derivedMeasure}
                      onChange={(e) => setFormData({ ...formData, derivedMeasure: e.target.value })}
                    />
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h4 className="mb-2 font-semibold">Common Formulas:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Success Rate = (Successful / Total) × 100</li>
                      <li>• Average Time = Σ(Times) / Count</li>
                      <li>• Error Rate = (Errors / Total) × 100</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Value</Label>
                    <Input id="target" type="number" placeholder="e.g., 95" className="max-w-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indicator">Indicator Interpretation</Label>
                    <Textarea
                      id="indicator"
                      placeholder="e.g., Payment Usability: Improvement Needed. Current: 87% | Target: 95% | Gap: -8%"
                      value={formData.indicator}
                      onChange={(e) => setFormData({ ...formData, indicator: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action">Recommended Action</Label>
                    <Textarea id="action" placeholder="e.g., Improve card information fields with auto-fill" rows={3} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Check className="mr-2 h-4 w-4" />
            Complete
          </Button>
        )}
      </div>
    </div>
  )
}
