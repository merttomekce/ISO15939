"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useContext, useRef } from "react"

function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext)
    const frozen = useRef(context).current

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    )
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 1.0, delay: 0.2, ease: "easeInOut" } }}
                exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                className="min-h-screen"
            >
                <FrozenRouter>{children}</FrozenRouter>
            </motion.div>
        </AnimatePresence>
    )
}
