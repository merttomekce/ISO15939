"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import type { CaseStudy } from "@/components/simulator-wizard"

type StepAnalyseProps = {
  selectedCaseStudy: CaseStudy | null
  selectedDimensions: string[]
  weights: Record<string, number>
  metrics: Record<string, Record<string, number>>
}

export function StepAnalyse({ selectedCaseStudy, selectedDimensions, weights, metrics }: StepAnalyseProps) {
  // Calculate scores for each dimension (simplified calculation)
  const dimensionScores = selectedDimensions.map((dimension) => {
    const dimensionMetrics = metrics[dimension] || {}
    const metricValues = Object.values(dimensionMetrics)
    const avgScore = metricValues.length > 0 ? metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length : 0

    // Normalize to 0-100 scale (simplified)
    const normalizedScore = Math.min(100, Math.max(0, avgScore))

    return {
      dimension,
      score: normalizedScore,
      weight: weights[dimension] || 0,
    }
  })

  // Calculate overall weighted score
  const overallScore = dimensionScores.reduce((sum, item) => {
    return sum + (item.score * item.weight) / 100
  }, 0)

  // Prepare radar chart data
  const radarData = dimensionScores.map((item) => ({
    dimension: item.dimension.split(" ")[0], // Shortened for display
    score: item.score,
  }))

  // Find gaps (dimensions below 70)
  const gaps = dimensionScores.filter((item) => item.score < 70)

  // Get quality rating
  const getQualityRating = (score: number) => {
    if (score >= 90) return "Excellent Quality"
    if (score >= 80) return "Very Good Quality"
    if (score >= 70) return "Good Quality"
    if (score >= 60) return "Acceptable Quality"
    return "Needs Improvement"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Step 4: Analyse - Results & Recommendations</CardTitle>
        {selectedCaseStudy && (
          <Alert className="mt-4 border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <AlertDescription className="text-purple-900 dark:text-purple-100">
              <strong>Case Study:</strong> {selectedCaseStudy.title} - {selectedCaseStudy.description}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground">
          <h3 className="mb-2 text-lg opacity-90">Overall Weighted Quality Score</h3>
          <div className="mb-2 text-6xl font-bold">
            {overallScore.toFixed(1)}
            <span className="text-3xl">/100</span>
          </div>
          <div className="text-lg opacity-90">{getQualityRating(overallScore)}</div>
        </div>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Dimensions Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Score",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gap Analysis */}
        {gaps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚠️</span>
                Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gaps.map((gap) => {
                const severity = gap.score < 50 ? "critical" : "moderate"
                return (
                  <div
                    key={gap.dimension}
                    className={`flex items-center justify-between rounded-lg p-4 ${
                      severity === "critical" ? "bg-red-50 dark:bg-red-950" : "bg-yellow-50 dark:bg-yellow-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">{gap.dimension}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          severity === "critical"
                            ? "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100"
                            : "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                      >
                        {severity === "critical" ? "Critical" : "Moderate"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{gap.score.toFixed(1)}</div>
                      <div className="text-sm text-red-600 dark:text-red-400">Gap: {(100 - gap.score).toFixed(1)}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💡</span>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.length > 0 ? (
              gaps.map((gap, index) => (
                <div key={gap.dimension} className="flex gap-4 rounded-lg bg-card p-4">
                  <div className="text-xl font-bold text-primary">{index + 1}.</div>
                  <div className="flex-1 leading-relaxed text-foreground">
                    <strong>Enhance {gap.dimension}:</strong> Focus on improving this dimension as it shows a
                    significant gap. Consider implementing best practices and conducting targeted improvements.
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-green-50 p-4 text-green-900 dark:bg-green-950 dark:text-green-100">
                <strong>Excellent work!</strong> All quality dimensions meet the acceptable threshold. Continue
                monitoring and maintaining these standards.
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
