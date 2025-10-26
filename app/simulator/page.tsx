import { Header } from "@/components/header"
import { SimulatorWizard } from "@/components/simulator-wizard"

export default function SimulatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              ISO 15939 Measurement Process Simulator
            </h1>
            <p className="text-pretty text-lg text-muted-foreground">
              Learn software quality measurement using ISO 25010 quality model
            </p>
          </div>
          <SimulatorWizard />
        </div>
      </main>
    </div>
  )
}
