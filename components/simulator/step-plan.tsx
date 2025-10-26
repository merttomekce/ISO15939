"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { CaseStudy } from "@/components/simulator-wizard"

type StepPlanProps = {
  selectedCaseStudy: CaseStudy | null
  selectedDimensions: string[]
  weights: Record<string, number>
  setWeights: (weights: Record<string, number>) => void
}

export function StepPlan({ selectedCaseStudy, selectedDimensions, weights, setWeights }: StepPlanProps) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0)
  const isValid = totalWeight === 100

  const handleWeightChange = (dimension: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setWeights({ ...weights, [dimension]: numValue })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Step 2: Plan - Assign Weights</CardTitle>
        <CardDescription className="text-base">
          Assign percentage weights to each selected dimension. Total must equal 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedCaseStudy && (
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>Case Study Mode:</strong> Weights are pre-configured for {selectedCaseStudy.title}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {selectedDimensions.map((dimension) => (
            <div key={dimension} className="flex items-center gap-4 rounded-lg bg-muted/50 p-5">
              <div className="flex-1 font-semibold text-foreground">{dimension}</div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={weights[dimension] || 0}
                  onChange={(e) => handleWeightChange(dimension, e.target.value)}
                  className="w-20 text-center"
                  readOnly={!!selectedCaseStudy}
                  disabled={!!selectedCaseStudy}
                />
                <span className="font-semibold text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Weight Display */}
        <div
          className={`rounded-lg border-2 p-5 ${
            isValid
              ? "border-green-500 bg-green-50 dark:bg-green-950"
              : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-lg font-bold ${isValid ? "text-green-900 dark:text-green-100" : "text-yellow-900 dark:text-yellow-100"}`}
            >
              Total Weight:
            </span>
            <span
              className={`text-2xl font-bold ${isValid ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
            >
              {totalWeight}%
            </span>
          </div>
          {!isValid && (
            <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-200">
              {totalWeight < 100 ? `Add ${100 - totalWeight}% more` : `Reduce by ${totalWeight - 100}%`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
