"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import type { CaseStudy } from "@/components/simulator-wizard"

const allDimensions = [
  { id: "performance", name: "Performance Efficiency", subCount: 3 },
  { id: "compatibility", name: "Compatibility", subCount: 2 },
  { id: "reliability", name: "Reliability", subCount: 4 },
  { id: "security", name: "Security", subCount: 5 },
  { id: "usability", name: "Usability", subCount: 5 },
  { id: "maintainability", name: "Maintainability", subCount: 5 },
  { id: "functional", name: "Functional Suitability", subCount: 3 },
  { id: "portability", name: "Portability", subCount: 3 },
]

type StepDefineProps = {
  caseStudies: CaseStudy[]
  selectedCaseStudy: CaseStudy | null
  setSelectedCaseStudy: (study: CaseStudy | null) => void
  selectedDimensions: string[]
  setSelectedDimensions: (dimensions: string[]) => void
  setWeights: (weights: Record<string, number>) => void
}

export function StepDefine({
  caseStudies,
  selectedCaseStudy,
  setSelectedCaseStudy,
  selectedDimensions,
  setSelectedDimensions,
  setWeights,
}: StepDefineProps) {
  const handleCaseStudySelect = (study: CaseStudy) => {
    setSelectedCaseStudy(study)
    setSelectedDimensions(study.dimensions)
    setWeights(study.weights)
  }

  const handleDimensionToggle = (dimensionName: string) => {
    if (selectedCaseStudy) {
      setSelectedCaseStudy(null)
    }

    if (selectedDimensions.includes(dimensionName)) {
      setSelectedDimensions(selectedDimensions.filter((d) => d !== dimensionName))
    } else {
      setSelectedDimensions([...selectedDimensions, dimensionName])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Step 1: Define Quality Dimensions</CardTitle>
        <CardDescription className="text-base">
          Select the ISO 25010 quality characteristics you want to measure, or choose a predefined case study.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Case Study Selection */}
        <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="text-xl">📋</span>
            Load Predefined Case Study
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {caseStudies.map((study) => (
              <button
                key={study.id}
                onClick={() => handleCaseStudySelect(study)}
                className={`rounded-lg border-2 bg-card p-5 text-left transition-all hover:scale-105 hover:shadow-lg ${
                  selectedCaseStudy?.id === study.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <h4 className="mb-2 font-semibold text-foreground">{study.title}</h4>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{study.description}</p>
                <p className="text-sm font-semibold text-primary">{study.dimensionCount} dimensions included</p>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Dimension Selection */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Or Select Dimensions Manually</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {allDimensions.map((dimension) => {
              const isSelected = selectedDimensions.includes(dimension.name)
              return (
                <button
                  key={dimension.id}
                  onClick={() => handleDimensionToggle(dimension.name)}
                  className={`flex items-center justify-between rounded-lg border-2 p-5 transition-all hover:scale-[1.02] ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">{dimension.name}</h4>
                    <p className="text-sm text-muted-foreground">{dimension.subCount} sub-characteristics</p>
                  </div>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selection Summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-semibold text-foreground">{selectedDimensions.length} dimension(s)</span>
            {selectedCaseStudy && <span className="ml-2 font-semibold text-primary">({selectedCaseStudy.title})</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
