import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProcessOverview } from "@/components/process-overview"
import { Dashboard } from "@/components/dashboard"
import { Features } from "@/components/features"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProcessOverview />
        <Dashboard />
        <Features />
      </main>
    </div>
  )
}
