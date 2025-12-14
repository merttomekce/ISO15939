"use client"


import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import jsPDF from 'jspdf';

const FIELDS = [
    "infoNeed", "measurableConcept", "entity", "attribute", "baseMeasure", "derivedMeasure", "indicator"
]



// Sub-components for consistent UI
function CustomInput({ label, description, value, onChange, placeholder, autoFocus }: any) {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold">{label}</h3>
            <p className="text-muted-foreground">{description}</p>
            <input
                type="text"
                autoFocus={autoFocus}
                className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder={placeholder}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}

function CustomTextArea({ label, description, value, onChange, placeholder, autoFocus }: any) {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold">{label}</h3>
            <p className="text-muted-foreground">{description}</p>
            <textarea
                autoFocus={autoFocus}
                className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                rows={5}
                placeholder={placeholder}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}

function MeasurementContent() {
    const { token } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Initial Load
    useEffect(() => {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const endpoint = id ? `/api/measurements/${id}` : '/api/measurements/latest';

        fetch(endpoint, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Object.keys(data).length > 0) setFormData(data);
            })
            .catch(() => { });
    }, [token, id]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const saveDraft = async (redirect = false) => {
        try {
            const res = await fetch("/api/measurements/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Save failed");
            if (redirect) router.push('/dashboard');
        } catch (e: any) {
            alert(`Failed to save: ${e.message}`);
        }
    }

    const steps = [
        {
            title: "Information Need",
            component: (
                <CustomTextArea
                    label="Information Need"
                    description="What information do you need to make decisions? Be specific about the goal."
                    placeholder="e.g. We need to evaluate if the codebase stability is improving over time..."
                    value={formData.infoNeed}
                    onChange={(v: string) => handleChange('infoNeed', v)}
                    autoFocus
                />
            )
        },
        {
            title: "Measurable Concept",
            component: (
                <CustomInput
                    label="Measurable Concept"
                    description="What abstract concept are you trying to quantify?"
                    placeholder="e.g. Code Stability, User Satisfaction, Performance..."
                    value={formData.measurableConcept}
                    onChange={(v: string) => handleChange('measurableConcept', v)}
                    autoFocus
                />
            )
        },
        {
            title: "Entity & Attribute",
            component: (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold">Entity & Attribute</h3>
                        <p className="text-muted-foreground">Define the specific object and the property you are measuring.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entity</label>
                            <input
                                type="text"
                                autoFocus
                                className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="e.g. Source Code Module"
                                value={formData.entity || ''}
                                onChange={e => handleChange('entity', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Attribute</label>
                            <input
                                type="text"
                                className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="e.g. Complexity / Lines"
                                value={formData.attribute || ''}
                                onChange={e => handleChange('attribute', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Base Measure",
            component: (
                <CustomTextArea
                    label="Base Measure"
                    description="How exactly will you collect the raw data? Describe the counting rule."
                    placeholder="e.g. Count the number of lines in each file ending with .ts, excluding comments..."
                    value={formData.baseMeasure}
                    onChange={(v: string) => handleChange('baseMeasure', v)}
                    autoFocus
                />
            )
        },
        {
            title: "Derived Measure",
            component: (
                <CustomInput
                    label="Derived Measure"
                    description="How will you combine base measures? (Formula)"
                    placeholder="e.g. (Defects / KLOC) * 100"
                    value={formData.derivedMeasure}
                    onChange={(v: string) => handleChange('derivedMeasure', v)}
                    autoFocus
                />
            )
        },
        {
            title: "Indicator",
            component: (
                <CustomTextArea
                    label="Indicator"
                    description="How will this be visualized and interpreted?"
                    placeholder="e.g. A trend line chart showing defect density over the last 6 sprints..."
                    value={formData.indicator}
                    onChange={(v: string) => handleChange('indicator', v)}
                    autoFocus
                />
            )
        },
        {
            title: "Summary",
            component: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Review Your Plan</h3>
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                        {Object.keys(formData).map(key => (
                            <div key={key} className="border-b border-border/50 pb-2 last:border-0">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <p className="text-sm font-medium">{formData[key] || "Not specified"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // AI Analysis Logic
    const analyzeAI = async () => {
        setIsAnalyzing(true);
        setShowModal(true);

        const prompt = `
            Analyze this ISO 15939 Plan:
            1. Info Need: ${formData.infoNeed}
            2. Concept: ${formData.measurableConcept}
            3. Entity: ${formData.entity}
            4. Attribute: ${formData.attribute}
            5. Base Measure: ${formData.baseMeasure}
            6. Derived Measure: ${formData.derivedMeasure}
            7. Indicator: ${formData.indicator}
            
            Provide:
            ## Analysis
            [Strengths/Weaknesses]
            ## Compliance
            [Check measurability]
            ## Recommendations
            [Improvements]
        `;

        try {
            const res = await fetch('/api/ai/analyze', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error("AI Service Unavailable");
            const result = await res.json();
            const aiText = result.candidates[0].content.parts[0].text;
            setAnalysisResult(aiText);

            // Simple PDF gen reuse if needed, or just download text
        } catch (e: any) {
            setAnalysisResult(`Error: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col">
            <header className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold">Measurement Wizard</h1>
                <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
                {/* Progress Bar */}
                <div className="h-1 bg-accent rounded-full max-w-xs mx-auto overflow-hidden mt-4">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border rounded-2xl p-8 shadow-lg"
                    >
                        {currentStepData.component}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Navigation */}
            <div className="mt-8 flex justify-between gap-4">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="px-6 py-3 rounded-xl font-medium transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    ← Back
                </button>

                {isLastStep ? (
                    <div className="flex gap-3">
                        <button
                            onClick={analyzeAI}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                        >
                            ✨ Analyze with AI
                        </button>
                        <button
                            onClick={() => saveDraft(true)}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                        >
                            Save & Finish
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md transition-transform hover:scale-105"
                    >
                        Next →
                    </button>
                )}
            </div>

            {/* AI Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-4">AI Analysis Report</h2>
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                {isAnalyzing ? "Analyzing your plan..." : analysisResult}
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-6 w-full py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-medium"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default function Measurement() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <MeasurementContent />
        </Suspense>
    )
}
