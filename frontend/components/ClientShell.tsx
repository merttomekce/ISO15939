"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import Chatbot from "@/components/Chatbot"
import { StartupAnimation } from "@/components/StartupAnimation"
import PageTransition from "@/components/PageTransition"

export default function ClientShell({ children }: { children: React.ReactNode }) {
    // Default to true so we hide UI initially (prevent flicker of UI before animation)
    const [introFinished, setIntroFinished] = useState(false)
    const [shouldShowAnimation, setShouldShowAnimation] = useState(true)

    useEffect(() => {
        // Check if we should skip
        const skip = sessionStorage.getItem("skipIntro") === "true"
        if (skip) {
            setShouldShowAnimation(false)
            setIntroFinished(true)
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
