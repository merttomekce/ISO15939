"use client"

import { motion, AnimatePresence } from "framer-motion"

interface ConfirmationDialogProps {
    isOpen: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmationDialog({
    isOpen,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    onConfirm,
    onCancel
}: ConfirmationDialogProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-card border border-border/50 shadow-2xl rounded-2xl p-6 overflow-hidden"
                    >
                        {/* Decorative glow */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${variant === 'destructive' ? 'bg-destructive' : 'bg-primary'}`} />

                        <h3 className="text-xl font-bold mb-2">{title}</h3>
                        <p className="text-muted-foreground mb-6">{description}</p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 ${variant === 'destructive' ? 'bg-destructive' : 'bg-primary'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
