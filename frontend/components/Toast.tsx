"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export type ToastType = "success" | "error" | "info"

export interface ToastMessage {
    id: string
    type: ToastType
    message: string
}

interface ToastProps {
    toasts: ToastMessage[]
    removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(
        <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
            </AnimatePresence>
        </div>,
        document.body
    )
}

function ToastItem({ toast, removeToast }: { toast: ToastMessage, removeToast: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id)
        }, 3000)
        return () => clearTimeout(timer)
    }, [toast.id, removeToast])

    const bgColors = {
        success: "bg-green-600",
        error: "bg-destructive",
        info: "bg-primary"
    }

    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ"
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white font-medium min-w-[300px] backdrop-blur-md ${bgColors[toast.type]}`}
        >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {icons[toast.type]}
            </div>
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity"
            >
                ✕
            </button>
        </motion.div>
    )
}

// Hook for easy usage
export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const addToast = (message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, type, message }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return { toasts, addToast, removeToast }
}
