"use client"

import Link from "next/link"
import { ModeToggle } from "./ModeToggle"
import { useAuth } from "@/context/AuthContext"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

function AuthButtons() {
    const { user, isAuthenticated, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Register</Link>
            </div>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Account Menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50 origin-top-right"
                    >
                        <div className="px-4 py-2 border-b border-border">
                            <p className="text-sm font-medium text-foreground truncate">{user}</p>
                        </div>
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>Dashboard</Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>Settings</Link>
                        <button
                            onClick={() => { setIsOpen(false); logout(); }}
                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent hover:text-destructive"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function Header() {
    const handleHomeClick = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('skipIntro', 'true')
        }
    }

    return (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" onClick={handleHomeClick} className="text-xl font-bold text-primary">ISO 15939</Link>
                    <nav className="hidden md:flex gap-6">
                        <Link href="/" onClick={handleHomeClick} className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                        <Link href="/simulator" className="text-sm font-medium hover:text-primary transition-colors">Simulator</Link>
                        <Link href="/measurement" className="text-sm font-medium hover:text-primary transition-colors">Measurement</Link>
                        <Link href="/references" className="text-sm font-medium hover:text-primary transition-colors">References</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <AuthButtons />
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}
