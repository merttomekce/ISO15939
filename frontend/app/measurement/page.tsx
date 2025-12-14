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
        <div className="space-y-4 h-full flex flex-col">
            <h3 className="text-2xl font-bold">{label}</h3>
            <p className="text-muted-foreground">{description}</p>
            <textarea
                autoFocus={autoFocus}
                className="w-full flex-1 bg-accent/30 border border-input rounded-xl px-4 py-4 text-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none min-h-[200px]"
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
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [lastAnalyzedState, setLastAnalyzedState] = useState<string | null>(null);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

    // Initial Load
    useEffect(() => {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const endpoint = id ? `/api/measurements/${id}` : '/api/measurements/latest';

        fetch(endpoint, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setFormData(data);
                    if (data.aiAnalysis) {
                        setAnalysisResult(data.aiAnalysis);
                        const url = generatePDF(data.aiAnalysis, false);
                        setPdfUrl(url);
                        // Mark as analyzed with current state
                        const { aiAnalysis, ...rest } = data;
                        setLastAnalyzedState(JSON.stringify(rest));
                    }
                }
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

    // Helper to check if form is dirty compared to last analysis
    const isFormDirty = () => {
        if (!lastAnalyzedState) return true;

        // Create current state snapshot excluding analysis
        const { aiAnalysis, ...currentRest } = formData;
        const currentState = JSON.stringify(currentRest);
        return currentState !== lastAnalyzedState;
    }

    const startAnalysis = async () => {
        // If we have an existing analysis and the form hasn't changed, just show it
        if (pdfUrl && !isFormDirty()) {
            setShowModal(true);
            return;
        }

        // If we have an analysis but form changed, ask for confirmation
        if (pdfUrl && isFormDirty()) {
            setShowOverwriteConfirm(true);
            return;
        }

        // Otherwise start fresh analysis
        await performAnalysis();
    }

    // AI Analysis Logic
    const performAnalysis = async () => {
        setIsAnalyzing(true);
        setShowModal(true);
        setShowOverwriteConfirm(false); // Close confirm if open

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

            // Save to form data specific field
            setFormData(prev => ({ ...prev, aiAnalysis: aiText }));

            // Update last analyzed state
            const { aiAnalysis, ...rest } = formData;
            setLastAnalyzedState(JSON.stringify(rest));

            // Generate PDF Blob for Preview
            const url = generatePDF(aiText, false);
            setPdfUrl(url);

        } catch (e: any) {
            setAnalysisResult(`Error: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    }

    const generatePDF = (text: string, download = false) => {
        if (!text) return null;
        const doc = new jsPDF();
        const MARGIN_LEFT = 20;
        const PAGE_HEIGHT = doc.internal.pageSize.height;
        let yPos = 30;

        // Header
        doc.setFillColor(41, 128, 185); // Blue header
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("AI Quality Analysis Report", 105, 10, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const lines = doc.splitTextToSize(text, 170);
        lines.forEach((line: string) => {
            if (yPos > PAGE_HEIGHT - 20) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, MARGIN_LEFT, yPos);
            yPos += 7;
        });

        if (download) {
            doc.save("ISO15939_AI_Analysis.pdf");
            return null;
        } else {
            return doc.output('bloburl').toString();
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
                <div className="space-y-6 h-full flex flex-col">
                    <h3 className="text-2xl font-bold">Review Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-y-auto max-h-[600px]">
                            {FIELDS.map(key => (
                                <div key={key} className="border-b border-border/50 pb-2 last:border-0">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <p className="text-sm font-medium">{formData[key] || "Not Specified"}</p>
                                </div>
                            ))}
                        </div>

                        {/* Summary View PDF Display */}
                        <div className="bg-neutral-100 rounded-xl overflow-hidden border border-border flex flex-col">
                            <div className="bg-neutral-200 px-4 py-2 border-b border-neutral-300 flex justify-between items-center">
                                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">AI Analysis Report</span>
                                {formData.aiAnalysis && (
                                    <button
                                        onClick={() => generatePDF(formData.aiAnalysis || "", true)}
                                        className="text-xs text-primary hover:underline font-bold"
                                    >
                                        Download PDF
                                    </button>
                                )}
                            </div>
                            {formData.aiAnalysis ? (
                                <iframe
                                    src={generatePDF(formData.aiAnalysis, false) || ""}
                                    className="w-full flex-1 min-h-[400px]"
                                    title="AI Report Summary"
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4">
                                    <div className="text-4xl">🤖</div>
                                    <p>No analysis generated yet.</p>
                                    <p className="text-sm">Click "Analyze with AI" to generate a report.</p>
                                </div>
                            )}
                        </div>
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


    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col">
            <header className="mb-6 text-center space-y-6">
                <h1 className="text-3xl font-bold">Measurement Wizard</h1>

                {/* 7 Equal Boxes Interactive Progress Bar */}
                <div className="grid grid-cols-7 gap-1 max-w-6xl mx-auto w-full px-2">
                    {steps.map((s, idx) => {
                        let bgClass = "bg-neutral-900 text-neutral-500 border border-neutral-800"; // Default

                        if (currentStep === idx) {
                            bgClass = "bg-primary text-primary-foreground shadow-lg scale-105 ring-2 ring-offset-2 ring-primary z-10 border-primary";
                        } else if (idx < currentStep) {
                            bgClass = "bg-primary/40 text-primary-foreground/90 border-primary/40";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`
                                    h-20 rounded-lg transition-all duration-300 flex flex-col items-center justify-center p-1
                                    hover:opacity-90 hover:scale-105 transform
                                    ${bgClass}
                                `}
                            >
                                <span className="text-lg font-bold leading-none mb-1">{idx + 1}</span>
                                <span className="text-[10px] md:text-xs font-medium leading-tight text-center line-clamp-2 px-1">
                                    {s.title}
                                </span>
                            </button>
                        )
                    })}
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
                        className="bg-card border border-border rounded-2xl p-8 shadow-lg h-full"
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
                            onClick={startAnalysis}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <span>Analyze with AI</span>
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

            {/* Overwrite Confirmation Modal (Small) */}
            <AnimatePresence>
                {showOverwriteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4"
                        >
                            <h3 className="text-xl font-bold text-destructive">Plan Changed!</h3>
                            <p className="text-muted-foreground">
                                You modified your input since the last analysis.
                            </p>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={performAnalysis}
                                    className="w-full py-3 bg-destructive text-destructive-foreground font-bold rounded-xl"
                                >
                                    Overwrite & Generate New Report
                                </button>
                                <button
                                    onClick={() => saveDraft(true)}
                                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl"
                                >
                                    Save Current & Start New
                                </button>
                                <button
                                    onClick={() => setShowOverwriteConfirm(false)}
                                    className="w-full py-3 border border-border rounded-xl font-medium hover:bg-accent"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* AI Modal (Large) */}
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
                            className="bg-card border border-border rounded-3xl p-8 max-w-7xl w-full h-[90vh] flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-4 flex justify-between">
                                <span>AI Analysis Report</span>
                                <button onClick={() => setShowModal(false)}>✕</button>
                            </h2>

                            <div className="flex-1 bg-neutral-100 rounded-xl overflow-hidden border border-border">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-muted-foreground animate-pulse">Consulting Expert System...</p>
                                    </div>
                                ) : pdfUrl ? (
                                    <iframe src={pdfUrl} className="w-full h-full" title="PDF Report"></iframe>
                                ) : (
                                    <p className="p-8 text-center text-red-500">Failed to generate report.</p>
                                )}
                            </div>

                            <div className="mt-6 flex gap-4 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-colors"
                                >
                                    Close
                                </button>
                                {pdfUrl && (
                                    <button
                                        onClick={() => generatePDF(analysisResult || "", true)}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:scale-105 transition-transform"
                                    >
                                        ⬇️ Download PDF
                                    </button>
                                )}
                            </div>
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
