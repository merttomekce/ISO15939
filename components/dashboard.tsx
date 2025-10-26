"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const qualityMetrics = [
  { name: "Usability", current: 87, target: 95, status: "warning" },
  { name: "Performance", current: 92, target: 90, status: "success" },
  { name: "Security", current: 78, target: 85, status: "warning" },
  { name: "Reliability", current: 95, target: 90, status: "success" },
  { name: "Maintainability", current: 82, target: 80, status: "success" },
]

const trendData = [
  { month: "Jan", usability: 75, performance: 85, security: 70 },
  { month: "Feb", usability: 78, performance: 87, security: 72 },
  { month: "Mar", usability: 82, performance: 89, security: 75 },
  { month: "Apr", usability: 85, performance: 91, security: 78 },
  { month: "May", usability: 87, performance: 92, security: 78 },
]

const radarData = [
  { characteristic: "Functional Suitability", value: 85 },
  { characteristic: "Performance", value: 92 },
  { characteristic: "Compatibility", value: 78 },
  { characteristic: "Usability", value: 87 },
  { characteristic: "Reliability", value: 95 },
  { characteristic: "Security", value: 78 },
  { characteristic: "Maintainability", value: 82 },
  { characteristic: "Portability", value: 88 },
]

export function Dashboard() {
  return (
    <section id="dashboard" className="border-b border-border py-20 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Quality Dashboard</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Real-time visualization of your software quality metrics and indicators
          </p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="iso25010">ISO 25010</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {qualityMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
                        {metric.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{metric.current}</span>
                        <span className="text-sm text-muted-foreground">/ {metric.target}</span>
                      </div>
                      <Progress value={metric.current} className="mt-3" />
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        {metric.current >= metric.target ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">+{metric.current - metric.target} above target</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-500">{metric.target - metric.current} below target</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quality Score Distribution</CardTitle>
                <CardDescription>Current performance across quality characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={qualityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="current" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="target" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends Over Time</CardTitle>
                <CardDescription>Track improvements in key quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="usability"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="security"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iso25010" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ISO 25010 Quality Model</CardTitle>
                <CardDescription>Comprehensive view of all quality characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="characteristic" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                    <Radar
                      name="Quality Score"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
