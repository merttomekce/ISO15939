"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, PanInfo } from "framer-motion"

interface CircularWeightsProps {
    weights: Record<string, number>
    onChange: (newWeights: Record<string, number>) => void
    dimensions: string[]
}

// Warm/Theme-matching Pastel Palette (No Blue/Green)
const COLORS = [
    "#FNB4A4", // Muted Terra Cotta (Wait, hex code invalid, using standard)
    "#E8A598", // Terracotta / Rose
    "#FFD7BA", // Peach
    "#FEC5BB", // Soft Pink
    "#D8E2DC", // Light Platinum (Neutral)
    "#FFE5D9", // Pale Orange
    "#E2ECE9", // Off white for contrast if needed but sticking to warm
    "#D4A5A5", // Old Rose
]

// Fixed Palette
const SUBTLE_COLORS = [
    "#E76F51", // Burnt Sienna (Softened) -> use Pastel version #F4A261
    "#F4A261", // Sandy Brown
    "#E9C46A", // Saffron
    "#D4A373", // Tan
    "#BC6C25", // Bronze (Lightened) -> #DDA15E
    "#CDB4DB", // Wisteria (Purple fits warmish themes sometimes)
]

// Let's use a curated "Sunset/Warm" pastel list
const THEME_COLORS = [
    "#FF9AA2", // Melon
    "#FFB7B2", // Pastel Red
    "#FFDAC1", // Pastel Orange/Peach
    "#E2F0CB", // Dirty/Yellow Green (Avoid? User said no green. Skip)
    "#B5EAD7", // Mint (Skip)
    "#C7CEEA", // Periwinkle (Skip blue?)
    // Custom set:
    "#F28482", // English Vermillion (Soft Red)
    "#F6BD60", // Maximum Yellow Red
    "#F5CAC3", // Unbleached Silk
    "#84DCC6", // (Greenish - Skip)
    "#FFD6A5", // Sunset
    "#D8BBFF", // Lavender (Neutralish)
]

const FINAL_COLORS = [
    "#E5989B", // English Lavender/Pink
    "#FFB4A2", // Apricot
    "#E0B1CB", // Langnid Lavender
    "#B08968", // Beaver (Brownish)
    "#FFCDB2", // Peach Puff
    "#6D6875", // Old Lavender
]

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// SVG Path for single arc line (for TextPath)
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    let diff = endAngle - startAngle;
    if (diff < 0) diff += 360;
    if (diff >= 360) diff = 359.99;

    // We want the text to run clockwise.
    // SVG coordinates: 0 is Right (3 o'clock), 90 is Bottom. 
    // Our logic tracks 0 at top? 
    // The previous math `polarToCartesian` assumes 
    // angleInRadians = (angle - 90). So 0 input -> -90 deg (Top).

    // For textPath, if we just draw start->end, it runs clockwise.
    // However, if the text is at the bottom (say 180 deg), it will be upside down.
    // To fix readability, we could flip the path for angles > 90 && < 270? 
    // Let's stick to simple clockwise first as requested "circumference".

    const safeEnd = startAngle + diff;
    const start = polarToCartesian(x, y, radius, safeEnd); // Logic inverted in previous measure?
    const end = polarToCartesian(x, y, radius, startAngle);

    // Check previous `describeSlice` logic.
    // `start` var there corresponds to `safeEnd` (the CCW end point?). 
    // Actually, `describeSlice` does `L end.x, end.y` first.
    // `polarToCartesian` uses (angle - 90).
    // Let's rely on standard SVG Arc format:
    // M start A radius radius 0 largeArc sweep end.
    // To go Clockwise (Sweep 1), we need M startAngle -> A -> endAngle (geometry wise).
    // But our angles measure CW from top.

    // Let's just reproduce the exact arc used in the Slice but at a different radius.
    // Re-using the slice logic points guarantees alignment.

    // We need "Start Point" of the arc path to be the visual "Left/Start" of the text.
    // In a CW system, Start is `startAngle`. End is `endAngle`.
    // so M startAnglePoint A ... endAnglePoint.

    const startP = polarToCartesian(x, y, radius, startAngle);
    const endP = polarToCartesian(x, y, radius, safeEnd);

    // Large arc?
    const largeArcFlag = diff <= 180 ? "0" : "1";

    // Sweep Flag: 1 for CW (if Y increases down).
    // Let's verify. 0->90. Start (Top), End (Right). M Top A ... Right. 
    // This is CW.

    return [
        "M", startP.x, startP.y,
        "A", radius, radius, 0, largeArcFlag, 1, endP.x, endP.y
    ].join(" ");
}

// SVG Path for a Pie Slice
function describeSlice(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    // Handle full circle case or inversion
    let diff = endAngle - startAngle;
    if (diff < 0) diff += 360;
    if (diff >= 360) diff = 359.99; // Prevent disappearance

    // Convert endAngle relative to start for calculation to avoid flipping
    const safeEnd = startAngle + diff;

    const start = polarToCartesian(x, y, radius, safeEnd);
    const end = polarToCartesian(x, y, radius, startAngle);

    // Large arc flag: is the slice > 180 deg?
    const largeArcFlag = diff <= 180 ? "0" : "1";

    const d = [
        "M", x, y,                 // Start at center
        "L", end.x, end.y,         // Line to start on edge
        "A", radius, radius, 0, largeArcFlag, 1, start.x, start.y, // Arc to end
        "Z"                        // Close back to center
    ].join(" ");

    return d;
}

export function CircularWeights({ weights, onChange, dimensions }: CircularWeightsProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const center = 150
    const radius = 120 // Slightly larger for full pie feel
    const textRadius = 75 // Radius where text sits

    // "Cuts" represent the boundary angles between slices. 
    // cuts[i] = The divider AFTER Dimension[i].
    // Slice 0 (Dim 0) is from cuts[last] to cuts[0].

    // We strictly enforce 0 <= Angle < 360.
    const [cuts, setCuts] = useState<number[]>([])

    // Initialize logic
    useEffect(() => {
        let currentAngle = 0
        const newCuts: number[] = []
        dimensions.forEach((dim) => {
            const w = weights[dim] || 0
            currentAngle = (currentAngle + w * 3.6) % 360
            // Fix: if exactly 0 or 360, store as 0, but logic needs to handle ordering.
            // Let's store raw 0-360.
            newCuts.push(currentAngle)
        })
        // Ensure they are what we expect (sorted isn't guaranteed if we just add, but initialization implies order)
        setCuts(newCuts)
    }, [dimensions.length])

    // Weight Calculation from Angles
    const updateWeights = (newCuts: number[]) => {
        const newW: Record<string, number> = {}

        dimensions.forEach((dim, i) => {
            // Start is the CUT before me.
            const startCut = i === 0 ? newCuts[newCuts.length - 1] : newCuts[i - 1]
            const endCut = newCuts[i]

            let diff = endCut - startCut
            if (diff < 0) diff += 360

            newW[dim] = Math.max(1, Math.round((diff / 360) * 100)) // Min 1% to prevent 0 division issues
        })

        // Normalize to 100%
        const total = Object.values(newW).reduce((a, b) => a + b, 0)
        if (total !== 100) {
            // Adjust largest or first slice
            newW[dimensions[0]] += (100 - total)
        }
        onChange(newW)
    }

    const handleDrag = (index: number, info: PanInfo) => {
        if (!svgRef.current) return

        const rect = svgRef.current.getBoundingClientRect()
        const mouseX = info.point.x - rect.left - center
        const mouseY = info.point.y - rect.top - center

        let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI) + 90
        if (angle < 0) angle += 360

        // --- Constrain Ordering --- //
        // For Cut[i], it's between Cut[i-1] (Previous) and Cut[i+1] (Next).
        // Standardize to ring geometry

        const prevIdx = index === 0 ? cuts.length - 1 : index - 1
        const nextIdx = index === cuts.length - 1 ? 0 : index + 1

        const prevAngle = cuts[prevIdx]
        const nextAngle = cuts[nextIdx]

        // BUFFER: 10 degrees (~2.7%)
        const BUFFER = 10

        // Check if valid "gap" exists
        // Calculate the "forbidden zone" which is the arc from Next to Prev (counter-clockwise)
        // Wait, simpler:
        // Angle must be clearly "after" Prev and "before" Next.

        /*
          Case A: Normal (Prev < Next) e.g., 90 ... 270. 
            Angle must be (90+B) < A < (270-B).
          Case B: Wrapping (Prev > Next) e.g., 270 ... 90. 
            Angle must be > (270+B) OR < (90-B).
        */

        let valid = false
        if (prevAngle < nextAngle) {
            if (angle > prevAngle + BUFFER && angle < nextAngle - BUFFER) valid = true
        } else {
            // Wrap scenario
            if (angle > prevAngle + BUFFER || angle < nextAngle - BUFFER) valid = true
        }

        if (valid) {
            const nextCuts = [...cuts]
            nextCuts[index] = angle
            setCuts(nextCuts)
            updateWeights(nextCuts)
        }
    }

    // Generate Slices & Text Paths
    const slices = dimensions.map((dim, i) => {
        const start = i === 0 ? cuts[cuts.length - 1] : cuts[i - 1]
        const end = cuts[i]

        let diff = end - start
        if (diff < 0) diff += 360

        // Dynamic Font Sizing
        // Arc length = (diff/360) * 2 * PI * textRadius
        const arcLen = (diff / 360) * 2 * Math.PI * textRadius
        // Average char width approx 9px at 14px font?
        // Let's cap max font at 16, min at 0 (hides).
        // Estimate size:
        const letters = dim.length
        let fontSize = Math.min(18, (arcLen / letters) * 1.6)
        if (fontSize < 8) fontSize = 0 // Too small -> Hide

        return {
            dim,
            path: describeSlice(center, center, radius, start, end),
            textPathId: `textPath-${i}`,
            textPathD: describeArc(center, center, textRadius, start, end), // Arc for text
            color: FINAL_COLORS[i % FINAL_COLORS.length],
            fontSize
        }
    })

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-card/40 rounded-3xl backdrop-blur-xl shadow-2xl border border-white/5">
            <div className="relative w-[300px] h-[300px] select-none">
                <svg
                    ref={svgRef}
                    width="300"
                    height="300"
                    viewBox="0 0 300 300"
                    className="drop-shadow-2xl"
                >
                    <defs>
                        {slices.map(slice => (
                            <path key={slice.textPathId} id={slice.textPathId} d={slice.textPathD} />
                        ))}
                    </defs>

                    {/* Slices */}
                    {slices.map((slice, i) => (
                        <g key={slice.dim}>
                            <path
                                d={slice.path}
                                fill={slice.color}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="2"
                                className="transition-[d] duration-75 ease-linear hover:opacity-90 cursor-pointer"
                            />
                            {/* Curved Text */}
                            {slice.fontSize > 0 && (
                                <text dy="5" style={{ fontSize: `${slice.fontSize}px`, textShadow: "0px 1px 2px rgba(255,255,255,0.4)" }} className="font-bold fill-black/60 pointer-events-none uppercase tracking-widest transition-all duration-75">
                                    <textPath href={`#${slice.textPathId}`} startOffset="50%" textAnchor="middle">
                                        {slice.dim}
                                    </textPath>
                                </text>
                            )}
                        </g>
                    ))}

                    {/* Knobs */}
                    {cuts.map((angle, i) => {
                        const pos = polarToCartesian(center, center, radius, angle)
                        return (
                            <motion.circle
                                key={i}
                                cx={pos.x}
                                cy={pos.y}
                                r={16}
                                fill="white"
                                stroke="rgba(0,0,0,0.1)"
                                strokeWidth={4}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.95 }}
                                drag
                                dragMomentum={false}
                                dragElastic={0}
                                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} // Free drag conceptually, limited by logic
                                onDrag={(e, info) => handleDrag(i, info)}
                                className="cursor-grab active:cursor-grabbing shadow-lg"
                                style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.3))" }}
                            />
                        )
                    })}

                    {/* Inner Hub */}
                    <circle cx={center} cy={center} r={15} fill="white" fillOpacity={0.8} pointerEvents="none" className="drop-shadow-sm" />
                </svg>

                {/* Overlaid Center Percentage (Optional, maybe floating?)
                    Since it's a solid pie, putting text in the exact center might conflict with the hub vertex.
                    Let's float it or keep strictly to legend.
                 */}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {dimensions.map((dim, i) => (
                    <div key={dim} className="flex items-center gap-2 bg-background/60 px-3 py-1.5 rounded-lg border border-border/30">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FINAL_COLORS[i % FINAL_COLORS.length] }} />
                        <span className="text-xs font-bold uppercase opacity-70">{dim}</span>
                        <span className="text-lg font-mono font-bold ml-1">{weights[dim]}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
