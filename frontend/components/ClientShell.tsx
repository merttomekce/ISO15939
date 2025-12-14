"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/Header"
import Chatbot from "@/components/Chatbot"
import { StartupAnimation } from "@/components/StartupAnimation"
import PageTransition from "@/components/PageTransition"

// Track if the app has been loaded in this session (memory-only, resets on refresh)
let hasAppLoaded = false

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    // Default to true so we hide UI initially (prevent flicker of UI before animation)
    const [introFinished, setIntroFinished] = useState(false)
    const [shouldShowAnimation, setShouldShowAnimation] = useState(true)

    useEffect(() => {
        // Logic:
        // 1. If we are NOT on Home (/), we never show animation. Mark app as loaded.
        // 2. If we ARE on Home (/):
        //    a. If app just loaded (refresh), SHOW animation.
        //    b. If app already loaded (navigation), SKIP animation.

        if (pathname !== "/") {
            setShouldShowAnimation(false)
            setIntroFinished(true)
            hasAppLoaded = true
        } else {
            if (!hasAppLoaded) {
                // First load on Home -> Play
                setShouldShowAnimation(true)
                setIntroFinished(false)
                hasAppLoaded = true
            } else {
                // Navigation back to Home -> Skip
                setShouldShowAnimation(false)
                setIntroFinished(true)
            }
        }
    }, [])

    const handleAnimationComplete = () => {
        setIntroFinished(true)
        setShouldShowAnimation(false)
        sessionStorage.setItem("skipIntro", "true")
    }

    return (
        <>
            {shouldShowAnimation && <StartupAnimation onComplete={handleAnimationComplete} />}

            {/* 
                We render children (page content) always (for SEO/LCP), 
                but Header/Chatbot wait for intro.
                Actually, page content might also be hidden if desired, 
                but user specifically asked for "top bar and chatbot icon".
            */}

            <div className={`transition-opacity duration-1000 ${introFinished ? "opacity-100" : "opacity-0"}`}>
                <Header />
            </div>

            <PageTransition>
                {children}
            </PageTransition>

            <div className={`transition-opacity duration-1000 ${introFinished ? "opacity-100" : "opacity-0"}`}>
                {introFinished && <Chatbot />}
            </div>
        </>
    )
}
