"use client"


import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import { CircularWeights } from "@/components/CircularWeights"
import { ToastContainer, useToast } from "@/components/Toast"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { useAuth } from "@/context/AuthContext" // Assuming this hook exists
import { useRouter } from "next/navigation" // Assuming Next.js router


ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const CASE_STUDIES = {
    ecommerce: {
        title: "E-commerce Platform",
        desc: "High transaction volume system requiring security and speed.",
        dimensions: ["efficiency", "security", "usability"]
    },
    banking: {
        title: "Banking System",
        desc: "Critical financial system focused on data integrity.",
        dimensions: ["security", "reliability", "usability"]
    },
    startup: {
        title: "MVP Startup App",
        desc: "Rapid iteration product needing high user retention.",
        dimensions: ["usability", "functionality", "maintainability"]
    },
    iot: {
        title: "IoT Dashboard",
        desc: "Real-time monitoring for connected devices.",
        dimensions: ["efficiency", "reliability", "portability"]
    },
    legacy: {
        title: "Legacy Migration",
        desc: "Updating an old enterprise monolith.",
        dimensions: ["maintainability", "compatibility", "reliability"]
    },
    social: {
        title: "Social Network",
        desc: "User-centric platform with massive scale.",
        dimensions: ["usability", "efficiency", "security"]
    },
    healthcare: {
        title: "Healthcare System",
        desc: "Patient tracking with strict privacy needs.",
        dimensions: ["reliability", "security", "functionality"]
    },
    game_engine: {
        title: "Game Engine",
        desc: "High-performance rendering core.",
        dimensions: ["efficiency", "usability", "portability"]
    }
}

const ALL_DIMENSIONS = [
    "functionality", "reliability", "usability", "efficiency",
    "maintainability", "portability", "security", "compatibility"
];

const METRIC_PRESETS: Record<string, { label: string, score: number, desc: string }[]> = {
    functionality: [
        { label: "Basic", score: 30, desc: "Minimal features, missing core requirements." },
        { label: "Standard", score: 70, desc: "Meets most user needs, some gaps." },
        { label: "Advanced", score: 95, desc: "Feature-rich, exceeds expectations." }
    ],
    reliability: [
        { label: "Unstable", score: 25, desc: "Frequent crashes, data loss risks." },
        { label: "Stable", score: 75, desc: "Consistent uptime, acceptable errors." },
        { label: "Robust", score: 98, desc: "Fault-tolerant, 99.99% uptime." }
    ],
    usability: [
        { label: "Complex", score: 30, desc: "Steep learning curve, confusing UI." },
        { label: "Intuitive", score: 75, desc: "Easy to learn, standard patterns." },
        { label: "Seamless", score: 95, desc: "Frictionless, accessible, delightful." }
    ],
    efficiency: [
        { label: "Sluggish", score: 30, desc: "High latency, resource heavy." },
        { label: "Performant", score: 70, desc: "Fast load times, optimized assets." },
        { label: "Instant", score: 95, desc: "<100ms response, highly scalable." }
    ],
    maintainability: [
        { label: "Spaghetti", score: 20, desc: "High technical debt, hard to change." },
        { label: "Modular", score: 70, desc: "Separation of concerns, documented." },
        { label: "Clean", score: 95, desc: "Modern patterns, high test coverage." }
    ],
    security: [
        { label: "Vulnerable", score: 20, desc: "No encryption, weak auth." },
        { label: "Secured", score: 80, desc: "HTTPS, RBAC, sanitized inputs." },
        { label: "Fortified", score: 100, desc: "MFA, Audits, Penny-test certified." }
    ]
};

// Fallback for others
ALL_DIMENSIONS.forEach(dim => {
    if (!METRIC_PRESETS[dim]) {
        METRIC_PRESETS[dim] = [
            { label: "Low", score: 25, desc: "Below industry standards." },
            { label: "Medium", score: 65, desc: "Meets basic standards." },
            { label: "High", score: 90, desc: "Follows best practices." }
        ];
    }
});

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 50, damping: 20 }
    }
}

export default function Simulator() {
    const { token } = useAuth() // Assuming useAuth provides token
    const router = useRouter()
    const { toasts, addToast, removeToast } = useToast()

    // Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        type: 'RESTART' | 'FINISH' | null
    }>({ isOpen: false, type: null })

    const [step, setStep] = useState(1);
    const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
    const [caseStudy, setCaseStudy] = useState<string | null>(null);
    const [customScenario, setCustomScenario] = useState<{ name: string, description: string }>({ name: '', description: '' });
    const [weights, setWeights] = useState<Record<string, number>>({});
    const [metrics, setMetrics] = useState<Record<string, number>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Step 1: Selection Logic
    const toggleDimension = (dim: string) => {
        setCaseStudy(null); // Clear case study if manually selecting
        setSelectedDimensions(prev =>
            prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]
        )
    }

    const selectCaseStudy = (key: string) => {
        setCaseStudy(key);
        setSelectedDimensions(CASE_STUDIES[key as keyof typeof CASE_STUDIES].dimensions);
        setCustomScenario({ name: '', description: '' });
    }

    // Step 2: Weights Logic
    useEffect(() => {
        if (step === 2 && selectedDimensions.length > 0 && Object.keys(weights).length === 0) {
            const equalWeight = Math.floor(100 / selectedDimensions.length);
            const remaining = 100 - (equalWeight * selectedDimensions.length);
            const newWeights: Record<string, number> = {};
            selectedDimensions.forEach((dim, idx) => {
                newWeights[dim] = equalWeight + (idx === 0 ? remaining : 0);
            });
            setWeights(newWeights);
        }
    }, [step, selectedDimensions]);

    // Updated handleNext with Toasts
    const handleNext = () => {
        if (step === 1) {
            if (!caseStudy) {
                if (!customScenario.name.trim()) {
                    addToast("Please enter a Project Name", "error")
                    return
                }
                if (selectedDimensions.length === 0) {
                    addToast("Please select at least one Dimension", "error")
                    return
                }
            } else {
                if (selectedDimensions.length === 0) {
                    addToast("System Error: No dimensions loaded", "error")
                    return
                }
            }

            // Initialize weights if empty
            if (Object.keys(weights).length === 0) {
                const initialWeights: Record<string, number> = {}
                const count = selectedDimensions.length
                selectedDimensions.forEach(d => initialWeights[d] = Math.floor(100 / count))
                // Distribute remainder
                const remainder = 100 - (Math.floor(100 / count) * count)
                if (remainder > 0) initialWeights[selectedDimensions[0]] += remainder
                setWeights(initialWeights)
            }
            setStep(2)
        } else if (step === 2) {
            const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
            if (Math.abs(totalWeight - 100) > 1) {
                addToast(`Total weight must be 100% (Current: ${totalWeight}%)`, "error")
                return
            }
            setStep(3)
        } else if (step === 3) {
            const missingMetrics = selectedDimensions.filter(d => !metrics[d] && metrics[d] !== 0) // Allow 0 if needed, but here assuming empty is bad
            if (missingMetrics.length > 0) {
                addToast("Please enter values for all metrics", "error")
                return
            }
            setStep(4)
        } else {
            handleFinish()
        }
    }

    const calculateScore = () => {
        let score = 0;
        selectedDimensions.forEach(dim => {
            score += (metrics[dim] || 0) * (weights[dim] || 0) / 100;
        });
        return score.toFixed(1);
    }

    const getAnalysisRating = (score: number) => {
        if (score >= 80) return { text: "Excellent Quality", color: "text-green-500" };
        if (score >= 60) return { text: "Good Quality", color: "text-blue-500" };
        if (score >= 40) return { text: "Fair Quality", color: "text-yellow-500" };
        return { text: "Needs Improvement", color: "text-red-500" };
    }

    const handleSave = async () => {
        setIsProcessing(true);
        const score = Number(calculateScore());
        const rating = getAnalysisRating(score);

        // Mock save
        setTimeout(() => {
            addToast("Simulation saved to profile successfully!", "success");
            setIsProcessing(false);
        }, 800);
    }

    const handleDownload = () => {
        const score = Number(calculateScore());
        const rating = getAnalysisRating(score);
        const projectName = customScenario.name || (caseStudy ? CASE_STUDIES[caseStudy as keyof typeof CASE_STUDIES].title : "Unnamed Project");

        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text("ISO 15939 Simulation Report", 105, 20, { align: "center" });

            doc.setFontSize(14);
            doc.text(`Project: ${projectName}`, 20, 40);
            doc.text(`Overall Score: ${score} / 100`, 20, 50);

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Rating: ${rating.text}`, 20, 58);

            let y = 80;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text("Dimension Breakdown", 20, y);
            y += 15;

            doc.setFontSize(12);
            selectedDimensions.forEach(dim => {
                const w = weights[dim];
                const m = metrics[dim];
                doc.text(`• ${dim.toUpperCase()}`, 30, y);
                doc.text(`Score: ${m} / 100`, 80, y);
                doc.text(`Weight: ${w}%`, 130, y);
                y += 10;
            });

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("Generated by ISO 15939 Simulator", 105, 280, { align: "center" });

            doc.save("simulation_report.pdf");
            addToast("Report downloaded as PDF", "info");
        } catch (e) {
            console.error(e);
            addToast("PDF Generation failed", "error");
        }
    }

    // Dialog Logic
    const triggerRestart = () => {
        setConfirmDialog({ isOpen: true, type: 'RESTART' })
    }

    const triggerFinish = () => {
        setConfirmDialog({ isOpen: true, type: 'FINISH' })
    }

    const handleFinish = () => {
        triggerFinish()
    }

    const handleConfirmAction = () => {
        if (confirmDialog.type === 'RESTART') {
            setStep(1)
            setCaseStudy(null)
            setSelectedDimensions([])
            setCustomScenario({ name: '', description: '' })
            setWeights({})
            setMetrics({})
            addToast("Simulator restarted", "info")
        } else if (confirmDialog.type === 'FINISH') {
            router.push('/dashboard')
            addToast("Simulation completed", "success")
        }
        setConfirmDialog({ isOpen: false, type: null })
    }

    const chartData = {
        labels: selectedDimensions.map(d => d.charAt(0).toUpperCase() + d.slice(1)),
        datasets: [
            {
                label: 'Quality Score',
                data: selectedDimensions.map(d => metrics[d] || 0),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.type === 'RESTART' ? "Restart Simulation?" : "Finish & Exit?"}
                description={confirmDialog.type === 'RESTART'
                    ? "Are you sure you want to restart? All current progress will be lost."
                    : "Are you sure you want to finish? Make sure you have saved your results."}
                confirmText={confirmDialog.type === 'RESTART' ? "Restart" : "Finish & Exit"}
                variant={confirmDialog.type === 'RESTART' ? "destructive" : "default"}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0 pointer-events-none"></div>

            <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10 min-h-screen">



                <motion.header
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="mb-12 text-center space-y-4 relative z-10"
                >
                    <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                        ISO 15939 <span className="text-primary">Simulator</span>
                    </motion.h1>
                    <motion.p variants={item} className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Interactive workshop to master the measurement process.
                    </motion.p>
                </motion.header>

                <main className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "25%" }}
                            animate={{ width: `${step * 25}%` }}
                        />
                    </div>

                    <div className="mt-6 md:mt-2">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-sm font-bold text-muted-foreground tracking-wider">STEP {step} OF 4</span>
                            {step > 1 && (
                                <button
                                    onClick={triggerRestart}
                                    className="px-6 py-2.5 text-base font-bold bg-secondary text-secondary-foreground border-2 border-border/50 hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <span className="text-xl">↺</span> Restart
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold">Define the Context</h2>
                                        <p className="text-muted-foreground">Select a Case Study or build your own scenario.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                        {Object.entries(CASE_STUDIES).map(([key, study]) => (
                                            <div
                                                key={key}
                                                onClick={() => {
                                                    setCaseStudy(key);
                                                    setSelectedDimensions(study.dimensions);
                                                    setCustomScenario({ name: '', description: '' });
                                                }}
                                                className={`p-6 border rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${caseStudy === key ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                            >
                                                <h3 className="font-bold text-lg mb-2">{study.title}</h3>
                                                <p className="text-sm text-muted-foreground mb-4">{study.desc}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {study.dimensions.map(d => (
                                                        <span key={d} className="text-xs bg-accent px-2 py-1 rounded capitalize">{d}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Custom option */}
                                        <div
                                            onClick={() => setCaseStudy(null)}
                                            className={`p-6 border rounded-xl cursor-pointer flex flex-col items-center justify-center text-center gap-4 transition-all hover:bg-accent/50 ${caseStudy === null ? 'border-primary ring-2 ring-primary' : 'border-border border-dashed'}`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-2xl">✨</div>
                                            <div>
                                                <h3 className="font-bold">Custom Scenario</h3>
                                                <p className="text-xs text-muted-foreground">Build from scratch</p>
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {caseStudy === null && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                                className="overflow-hidden p-1"
                                            >
                                                {/* Spacer (Top Margin equivalent - animated) */}
                                                <div className="h-6" />
                                                {/* Divider */}
                                                <div className="h-px bg-border" />
                                                {/* Spacer (Top Padding equivalent) */}
                                                <div className="h-6" />

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-base font-semibold">Project Name</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-background border border-input rounded-xl px-5 py-3 text-lg focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                                                            value={customScenario.name}
                                                            onChange={e => setCustomScenario({ ...customScenario, name: e.target.value })}
                                                            placeholder="e.g. NextGen Payment Gateway"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-base font-semibold">Description (Optional)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-background border border-input rounded-xl px-5 py-3 text-lg focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                                                            value={customScenario.description}
                                                            onChange={e => setCustomScenario({ ...customScenario, description: e.target.value })}
                                                            placeholder="Brief objective statement..."
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Persistent Dimension Grid */}
                                    <div className={`space-y-4 pt-6 mt-6 border-t border-border ${caseStudy !== null ? 'mt-6' : ''}`}>
                                        <div className="flex justify-between items-center">
                                            <label className="text-base font-semibold">Select Quality Dimensions (Max 5)</label>
                                            <span className={`text-sm font-bold ${selectedDimensions.length > 5 ? 'text-red-500' : 'text-primary'}`}>
                                                {selectedDimensions.length} selected
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {ALL_DIMENSIONS.map(dim => (
                                                <motion.div
                                                    key={dim}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleDimension(dim)}
                                                    className={`
                                                    group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                                                    flex flex-col items-start gap-2 h-full
                                                    ${selectedDimensions.includes(dim)
                                                            ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                                                            : 'border-border/50 bg-card hover:border-primary/50 hover:bg-accent/50'}
                                                `}
                                                >
                                                    <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                                                    ${selectedDimensions.includes(dim) ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
                                                `}>
                                                        {selectedDimensions.includes(dim) && (
                                                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </motion.svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold capitalize text-lg block">{dim}</span>
                                                        <span className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                            {METRIC_PRESETS[dim]?.[1]?.desc || "Standard metric evaluation"}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold">Assign Weights</h2>
                                            <p className="text-muted-foreground">Adjust the dial to distribute importance.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const equal = Math.floor(100 / selectedDimensions.length)
                                                const rem = 100 - (equal * selectedDimensions.length)
                                                const newW: any = {}
                                                selectedDimensions.forEach((d, i) => newW[d] = equal + (i === 0 ? rem : 0))
                                                setWeights(newW)
                                            }}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Reset Equal
                                        </button>
                                    </div>

                                    <div className="flex justify-center py-8">
                                        <CircularWeights
                                            weights={weights}
                                            dimensions={selectedDimensions}
                                            onChange={setWeights}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <h2 className="text-2xl font-bold">Collect Metrics</h2>
                                    <p className="text-muted-foreground">Select a scenario that best fits your current status.</p>

                                    <div className="space-y-8">
                                        {selectedDimensions.map(dim => (
                                            <div key={dim} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="capitalize font-semibold text-lg">{dim}</h3>
                                                    <span className="text-sm font-bold text-primary">Score: {metrics[dim] || 0}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {METRIC_PRESETS[dim].map((preset) => (
                                                        <div
                                                            key={preset.label}
                                                            onClick={() => setMetrics({ ...metrics, [dim]: preset.score })}
                                                            className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${metrics[dim] === preset.score ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border bg-card'}`}
                                                        >
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold">{preset.label}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${metrics[dim] === preset.score ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                                    {preset.score}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{preset.desc}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Fine tune slider (optional hidden/revealed or just there) */}
                                                <div className="pt-1">
                                                    <input
                                                        type="range" min="0" max="100"
                                                        value={metrics[dim] || 0}
                                                        onChange={(e) => setMetrics({ ...metrics, [dim]: Number(e.target.value) })}
                                                        className="w-full h-1 bg-accent rounded-lg appearance-none cursor-pointer accent-primary opacity-50 hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <h2 className="text-2xl font-bold">Analysis Results</h2>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-accent/30 p-6 rounded-lg text-center">
                                            <div className="text-4xl font-bold mb-2">{calculateScore()}</div>
                                            <div className={`text-xl font-semibold ${getAnalysisRating(Number(calculateScore())).color}`}>
                                                {getAnalysisRating(Number(calculateScore())).text}
                                            </div>
                                            <div className="mt-8 max-h-[300px] flex justify-center">
                                                <Radar data={chartData} options={{ scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Breakdown</h3>
                                            {selectedDimensions.map(dim => (
                                                <div key={dim} className="flex justify-between items-center p-3 border border-border rounded">
                                                    <span className="capitalize">{dim}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Score: {metrics[dim]} (Wt: {weights[dim]}%)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Step 4 Action Buttons */}
                                    <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t border-border">
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-all shadow-sm"
                                        >
                                            Save Simulation
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="flex-1 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-all shadow-sm"
                                        >
                                            Download Report
                                        </button>
                                        <button
                                            onClick={handleFinish}
                                            className="flex-1 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-all shadow-sm"
                                        >
                                            Finish & Exit
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Navigation (Hidden on Step 4) */}
                    {step < 4 && (
                        <div className="flex justify-between mt-8 pt-4 border-t border-border">
                            <button
                                onClick={() => setStep(s => s - 1)}
                                disabled={step === 1}
                                className="px-6 py-2 border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
