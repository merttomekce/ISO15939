"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">ISO</span>
          </div>
          <span className="text-lg font-semibold">Quality Assessment</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link
            href="#process"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Process
          </Link>
          <Link
            href="#dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/simulator"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Simulator
          </Link>
          <Link
            href="/measurement"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Measurement
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="#process" className="text-sm font-medium">
              Process
            </Link>
            <Link href="#dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/simulator" className="text-sm font-medium">
              Simulator
            </Link>
            <Link href="/measurement" className="text-sm font-medium">
              Measurement
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
