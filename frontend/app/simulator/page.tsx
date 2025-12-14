"use client"

import { Header } from "@/components/Header"
import { useState, useEffect, useRef } from "react"
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
    }
}

const ALL_DIMENSIONS = [
    "functionality", "reliability", "usability", "efficiency",
    "maintainability", "portability", "security", "compatibility"
];

export default function Simulator() {
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

    const handleNext = () => {
        if (step === 1) {
            if (selectedDimensions.length === 0) return alert("Please select a case study or at least one dimension.");
            setStep(2);
        } else if (step === 2) {
            const total = Object.values(weights).reduce((a, b) => a + b, 0);
            if (Math.abs(total - 100) > 0.5) return alert("Total weight must equal 100%");
            setStep(3);
        } else if (step === 3) {
            const missing = selectedDimensions.filter(d => metrics[d] === undefined);
            if (missing.length > 0) return alert("Please enter values for all metrics.");
            setStep(4);
        } else {
            finishSimulator();
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

    const finishSimulator = async () => {
        setIsProcessing(true);
        const score = Number(calculateScore());
        const rating = getAnalysisRating(score);

        // Background Save (Fire and Forget)
        const payload = {
            projectName: customScenario.name || (caseStudy ? CASE_STUDIES[caseStudy as keyof typeof CASE_STUDIES].title : "Unnamed Project"),
            description: customScenario.description,
            overallScore: score,
            qualityRating: rating.text,
            selectedDimensions,
            weights,
            metrics
        };

        const token = localStorage.getItem('token'); // Simplistic auth check for now

        // Database Save
        fetch('/api/simulation/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Save failed", err));

        // PDF Generation
        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text("ISO 15939 Simulation Report", 105, 20, { align: "center" });

            doc.setFontSize(12);
            doc.text(`Project: ${payload.projectName}`, 20, 40);
            doc.text(`Score: ${payload.overallScore} / 100 (${payload.qualityRating})`, 20, 50);

            let y = 70;
            doc.text("Detailed Breakdown:", 20, y);
            y += 10;

            selectedDimensions.forEach(dim => {
                const w = weights[dim];
                const m = metrics[dim];
                doc.text(`- ${dim.toUpperCase()}: Score ${m}, Weight ${w}%`, 30, y);
                y += 10;
            });

            doc.save("simulation_report.pdf");

            setTimeout(() => {
                if (confirm("Report generated! Start over?")) {
                    window.location.reload();
                }
                setIsProcessing(false);
            }, 1000);

        } catch (e) {
            console.error(e);
            alert("PDF Generation failed");
            setIsProcessing(false);
        }
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
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between mb-2 text-sm font-medium">
                        <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>1. Define</span>
                        <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>2. Weights</span>
                        <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>3. Metrics</span>
                        <span className={step >= 4 ? "text-primary" : "text-muted-foreground"}>4. Analysis</span>
                    </div>
                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: `${step * 25}%` }}
                        />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 shadow-sm min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-2xl font-bold">Define Quality Model</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {Object.entries(CASE_STUDIES).map(([key, study]) => (
                                        <div key={key}
                                            onClick={() => selectCaseStudy(key)}
                                            className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md ${caseStudy === key ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                        >
                                            <h3 className="font-bold text-lg mb-2">{study.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">{study.desc}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {study.dimensions.map(d => (
                                                    <span key={d} className="px-2 py-1 bg-background border border-border rounded text-xs capitalize">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or Custom Scenario</span></div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {ALL_DIMENSIONS.map(dim => (
                                        <label key={dim} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${selectedDimensions.includes(dim) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                            <input type="checkbox" checked={selectedDimensions.includes(dim)} onChange={() => toggleDimension(dim)} className="accent-primary w-4 h-4" />
                                            <span className="capitalize">{dim}</span>
                                        </label>
                                    ))}
                                </div>
                                {caseStudy === null && selectedDimensions.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <input
                                            type="text"
                                            placeholder="Project Name"
                                            className="w-full p-2 border border-border rounded bg-background"
                                            value={customScenario.name}
                                            onChange={(e) => setCustomScenario({ ...customScenario, name: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Description (Optional)"
                                            className="w-full p-2 border border-border rounded bg-background"
                                            value={customScenario.description}
                                            onChange={(e) => setCustomScenario({ ...customScenario, description: e.target.value })}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-2xl font-bold">Assign Weights</h2>
                                <p className="text-muted-foreground">Distribute 100% across your selected dimensions.</p>
                                <div className="space-y-6">
                                    {selectedDimensions.map(dim => (
                                        <div key={dim}>
                                            <div className="flex justify-between mb-2">
                                                <span className="capitalize font-medium">{dim}</span>
                                                <span className="font-bold text-primary">{weights[dim]}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100"
                                                value={weights[dim]}
                                                onChange={(e) => {
                                                    setWeights({ ...weights, [dim]: Number(e.target.value) })
                                                }}
                                                className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-4 border-t border-border">
                                        <span className="font-bold">Total</span>
                                        <span className={`text-xl font-bold ${Object.values(weights).reduce((a, b) => a + b, 0) === 100 ? 'text-green-500' : 'text-red-500'}`}>
                                            {Object.values(weights).reduce((a, b) => a + b, 0)}%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h2 className="text-2xl font-bold">Collect Metrics</h2>
                                <p className="text-muted-foreground">Enter values (0-100) for each dimension.</p>
                                <div className="space-y-6">
                                    {selectedDimensions.map(dim => (
                                        <div key={dim} className="space-y-2">
                                            <label className="capitalize font-medium block">{dim}</label>
                                            <input
                                                type="number" min="0" max="100"
                                                value={metrics[dim] || ''}
                                                onChange={(e) => setMetrics({ ...metrics, [dim]: Number(e.target.value) })}
                                                placeholder="Enter value (0-100)"
                                                className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                                            />
                                            <div className="h-1 bg-accent rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${metrics[dim] || 0}%` }}></div>
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1}
                        className="px-6 py-2 border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                        {isProcessing ? "Processing..." : step === 4 ? "Finish & Download" : "Next"}
                    </button>
                </div>
            </main>
        </div>
    )
}
