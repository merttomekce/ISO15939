"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
    const [show, setShow] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Sequence
        // 0s: Start
        // 3.5s: Exit start (Curtain goes up)
        // 4.3s: Unmount (Animation finished)

        const timers: NodeJS.Timeout[] = []

        // Start Exit Animation (Curtain Up)
        timers.push(setTimeout(() => {
            setShow(false)
        }, 3500))

        // Call onComplete after animation finishes
        timers.push(setTimeout(() => {
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
