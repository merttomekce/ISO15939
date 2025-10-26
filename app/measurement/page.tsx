import { Header } from "@/components/header"
import { MeasurementWizard } from "@/components/measurement-wizard"

export default function MeasurementPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">New Measurement Process</h1>
            <p className="text-lg text-muted-foreground">Follow the ISO 15939 process to create quality indicators</p>
          </div>
          <MeasurementWizard />
        </div>
      </main>
    </div>
  )
}
