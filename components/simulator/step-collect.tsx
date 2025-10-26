"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Metric = {
  id: string
  name: string
  description: string
  unit: string
  min: number
  max: number
  inverse?: boolean
}

const dimensionMetrics: Record<string, Metric[]> = {
  "Performance Efficiency": [
    { id: "time", name: "Time Behaviour", description: "Response time", unit: "ms", min: 0, max: 5000, inverse: true },
    {
      id: "resource",
      name: "Resource Utilization",
      description: "CPU/Memory usage",
      unit: "%",
      min: 0,
      max: 100,
      inverse: true,
    },
    { id: "capacity", name: "Capacity", description: "Concurrent users", unit: "users", min: 0, max: 10000 },
  ],
  Reliability: [
    { id: "availability", name: "Availability", description: "Uptime percentage", unit: "%", min: 0, max: 100 },
    {
      id: "recoverability",
      name: "Recoverability",
      description: "Recovery time",
      unit: "seconds",
      min: 0,
      max: 300,
      inverse: true,
    },
    { id: "fault-tolerance", name: "Fault Tolerance", description: "Error handling rate", unit: "%", min: 0, max: 100 },
  ],
  Security: [
    {
      id: "confidentiality",
      name: "Confidentiality",
      description: "Data encryption coverage",
      unit: "%",
      min: 0,
      max: 100,
    },
    { id: "integrity", name: "Integrity", description: "Data validation rate", unit: "%", min: 0, max: 100 },
    { id: "authentication", name: "Authentication", description: "Auth success rate", unit: "%", min: 0, max: 100 },
  ],
  Compatibility: [
    { id: "coexistence", name: "Co-existence", description: "System compatibility", unit: "%", min: 0, max: 100 },
    {
      id: "interoperability",
      name: "Interoperability",
      description: "API integration success",
      unit: "%",
      min: 0,
      max: 100,
    },
  ],
  Usability: [
    {
      id: "learnability",
      name: "Learnability",
      description: "Time to learn",
      unit: "minutes",
      min: 0,
      max: 120,
      inverse: true,
    },
    { id: "operability", name: "Operability", description: "Task completion rate", unit: "%", min: 0, max: 100 },
    {
      id: "user-error",
      name: "User Error Protection",
      description: "Error prevention rate",
      unit: "%",
      min: 0,
      max: 100,
    },
  ],
  Maintainability: [
    { id: "modularity", name: "Modularity", description: "Code modularity score", unit: "score", min: 0, max: 100 },
    { id: "reusability", name: "Reusability", description: "Component reuse rate", unit: "%", min: 0, max: 100 },
    { id: "testability", name: "Testability", description: "Test coverage", unit: "%", min: 0, max: 100 },
  ],
  "Functional Suitability": [
    {
      id: "completeness",
      name: "Functional Completeness",
      description: "Feature coverage",
      unit: "%",
      min: 0,
      max: 100,
    },
    { id: "correctness", name: "Functional Correctness", description: "Accuracy rate", unit: "%", min: 0, max: 100 },
    {
      id: "appropriateness",
      name: "Functional Appropriateness",
      description: "Feature relevance",
      unit: "score",
      min: 0,
      max: 100,
    },
  ],
  Portability: [
    { id: "adaptability", name: "Adaptability", description: "Platform support", unit: "platforms", min: 0, max: 10 },
    { id: "installability", name: "Installability", description: "Install success rate", unit: "%", min: 0, max: 100 },
    { id: "replaceability", name: "Replaceability", description: "Migration ease", unit: "score", min: 0, max: 100 },
  ],
}

type StepCollectProps = {
  selectedDimensions: string[]
  metrics: Record<string, Record<string, number>>
  setMetrics: (metrics: Record<string, Record<string, number>>) => void
}

export function StepCollect({ selectedDimensions, metrics, setMetrics }: StepCollectProps) {
  const handleMetricChange = (dimension: string, metricId: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setMetrics({
      ...metrics,
      [dimension]: {
        ...(metrics[dimension] || {}),
        [metricId]: numValue,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Step 3: Collect - Enter Metric Values</CardTitle>
        <CardDescription className="text-base">
          Enter measurement values for each sub-characteristic based on ISO 25023 metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedDimensions.map((dimension) => {
          const metricsForDimension = dimensionMetrics[dimension] || []
          return (
            <div key={dimension} className="rounded-xl border border-border p-6">
              <h3 className="mb-5 text-xl font-bold text-primary">{dimension}</h3>
              <div className="space-y-4">
                {metricsForDimension.map((metric) => (
                  <div key={metric.id} className="rounded-lg bg-muted/50 p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{metric.name}</h4>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={metric.min}
                          max={metric.max}
                          value={metrics[dimension]?.[metric.id] || ""}
                          onChange={(e) => handleMetricChange(dimension, metric.id, e.target.value)}
                          className="w-24 text-center"
                          placeholder="0"
                        />
                        <span className="min-w-[60px] font-semibold text-muted-foreground">{metric.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Range: {metric.min} - {metric.max}
                      </span>
                      {metric.inverse && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        >
                          Lower is better
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
