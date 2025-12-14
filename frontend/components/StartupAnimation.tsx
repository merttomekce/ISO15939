"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
    const [show, setShow] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const skip = sessionStorage.getItem("skipIntro") === "true"

        if (skip) {
            setShow(false)
            sessionStorage.removeItem("skipIntro")
            onComplete()
        } else {
            // Play sequence
            // Wait a bit for "loading" look
            const timer1 = setTimeout(() => {
                setShow(false)
            }, 1000)

            const timer2 = setTimeout(() => {
                onComplete()
            }, 1500) // 1000 + 500ms transition

            return () => {
                clearTimeout(timer1)
                clearTimeout(timer2)
            }
        }
    }, [])

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                    className="fixed inset-0 z-50 bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                        <div>ISO 15939</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
