"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
    const [show, setShow] = useState(true)
    const [phase, setPhase] = useState(0) // 0: Start, 1: Text, 2: Exit
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Sequence
        // 0s: Start
        // 0.5s: Measure
        // 1.5s: Analyze
        // 2.5s: Improve
        // 4.0s: Exit start

        const timers: NodeJS.Timeout[] = []

        timers.push(setTimeout(() => setPhase(1), 500))
        timers.push(setTimeout(() => setPhase(2), 3500))
        timers.push(setTimeout(() => {
            setShow(false)
            // sessionStorage.setItem("skipIntro", "true") // Uncomment to persist skip
            onComplete()
        }, 4300)) // 3500 + 800ms exit transition

        return () => timers.forEach(clearTimeout)
    }, [])

    if (!isMounted) return null

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center text-white"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-3xl md:text-5xl font-bold tracking-tighter"
                    >
                        <Word delay={0}>Measure.</Word>
                        <Word delay={0.8}>Analyze.</Word>
                        <Word delay={1.6}>Improve.</Word>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function Word({ children, delay }: { children: React.ReactNode, delay: number }) {
    return (
        <motion.span
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className="inline-block"
        >
            {children}
        </motion.span>
    )
}
