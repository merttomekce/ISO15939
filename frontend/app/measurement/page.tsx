"use client"


import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import jsPDF from 'jspdf';

const FIELDS = [
    "infoNeed", "measurableConcept", "entity", "attribute", "baseMeasure", "derivedMeasure", "indicator"
]



function MeasurementContent() {
    const { token } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token} `;
        }

        // If ID is provided, fetch specific measurement. Otherwise fetch latest draft.
        const endpoint = id ? `/ api / measurements / ${id} ` : '/api/measurements/latest';

        fetch(endpoint, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Object.keys(data).length > 0) setFormData(data);
            })
            .catch(() => { });
    }, [token, id])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const saveDraft = async (redirect = false) => {
        setIsSaving(true);
        setSaveMessage("");

        try {
            const res = await fetch("/api/measurements/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token} ` } : {})
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Save failed");
            }

            setSaveMessage("Draft saved successfully!");
            setTimeout(() => setSaveMessage(""), 3000);

            if (redirect) router.push('/dashboard');

        } catch (e: any) {
            alert(`Failed to save: ${e.message} `);
        } finally {
            setIsSaving(false);
        }
    }

    const handleComplete = () => {
        if (confirm("Complete measurement and return to dashboard?")) {
            saveDraft(true);
        }
    }

    const analyzeAI = async () => {
        setIsAnalyzing(true);
        setShowModal(true);

        const prompt = `
            You are an expert Software Quality Assurance Consultant specializing in ISO / IEC 15939 standards.
            Please analyze the following software measurement definition plan and provide a detailed compliance and quality report.
            
            Measurement Plan Details:
1. Context / Information Need: ${formData.infoNeed || "Not specified"}
2. Measurable Concept: ${formData.measurableConcept || "Not specified"}
3. Entity: ${formData.entity || "Not specified"}
4. Attribute: ${formData.attribute || "Not specified"}
5. Base Measure: ${formData.baseMeasure || "Not specified"}
6. Derived Measure: ${formData.derivedMeasure || "Not specified"}
7. Indicator: ${formData.indicator || "Not specified"}

            Please provide your analysis in the following Markdown format:
            ## Analysis Summary
[Brief summary of the plan's strengths and weaknesses]

            ## ISO 15939 Compliance Check
    - ** Information Need Alignment:** [Assessment]
        - ** Measurability:** [Assessment of base / derived measures]
            - ** Indicator Effectiveness:** [Assessment]

            ## Recommendations
[Specific, actionable improvements]
            
            ## Proposed Refinements
[Better definitions if applicable]
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

            // Generate PDF
            generatePDF(aiText);

        } catch (e: any) {
            setAnalysisResult(`Error: ${e.message} `);
        } finally {
            setIsAnalyzing(false);
        }
    }

    const generatePDF = (text: string) => {
        const doc = new jsPDF();
        const MARGIN_LEFT = 20;
        const PAGE_HEIGHT = doc.internal.pageSize.height;
        let yPos = 30;

        // Header
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("AI Quality Analysis Report", 105, 10, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        // Simple text dump with naive pagination
        const lines = doc.splitTextToSize(text, 170);
        lines.forEach((line: string) => {
            if (yPos > PAGE_HEIGHT - 20) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, MARGIN_LEFT, yPos);
            yPos += 7;
        });

        doc.save("ISO15939_AI_Analysis.pdf");
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <header className="mb-12 text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-foreground"
                >
                    ISO 15939 Wizard
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    Define your measurement process with precision and clarity.
                </motion.p>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {/* Step 1 */}
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                        <h3 className="text-xl font-bold">Information Need</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">What information do you need to make decisions?</p>
                    <textarea
                        className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        rows={4}
                        placeholder="e.g. We need to know if the project is on track..."
                        value={formData.infoNeed || ''}
                        onChange={(e) => handleChange('infoNeed', e.target.value)}
                    />
                </motion.div>

                {/* Step 2 */}
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                        <h3 className="text-xl font-bold">Measurable Concept</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">What abstract concept needs to be quantified?</p>
                    <input
                        type="text"
                        className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. Project Progress"
                        value={formData.measurableConcept || ''}
                        onChange={(e) => handleChange('measurableConcept', e.target.value)}
                    />
                </motion.div>

                {/* Step 3 */}
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
                        <h3 className="text-xl font-bold">Entity & Attribute</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Target object and specific property.</p>
                    <div className="space-y-3">
                        <input
                            type="text"
                            className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Entity (e.g. Source Code)"
                            value={formData.entity || ''}
                            onChange={(e) => handleChange('entity', e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Attribute (e.g. Size)"
                            value={formData.attribute || ''}
                            onChange={(e) => handleChange('attribute', e.target.value)}
                        />
                    </div>
                </motion.div>

                {/* Step 4 */}
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">4</div>
                        <h3 className="text-xl font-bold">Base Measure</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">How is the raw data collected?</p>
                    <textarea
                        className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        rows={3}
                        placeholder="e.g. Count of physical lines of code..."
                        value={formData.baseMeasure || ''}
                        onChange={(e) => handleChange('baseMeasure', e.target.value)}
                    />
                </motion.div>

                {/* Step 5 */}
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">5</div>
                        <h3 className="text-xl font-bold">Derived Measure</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Formula or calculation method.</p>
                    <input
                        type="text"
                        className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. Sum(Lines of Code)"
                        value={formData.derivedMeasure || ''}
                        onChange={(e) => handleChange('derivedMeasure', e.target.value)}
                    />
                </motion.div>

                {/* Step 6 */}
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">6</div>
                        <h3 className="text-xl font-bold">Indicator</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Visualization and interpretation.</p>
                    <textarea
                        className="w-full bg-accent/30 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        rows={3}
                        placeholder="e.g. Bar chart comparing actual vs planned..."
                        value={formData.indicator || ''}
                        onChange={(e) => handleChange('indicator', e.target.value)}
                    />
                </motion.div>
            </motion.div>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto"
            >
                <button
                    onClick={() => saveDraft(false)}
                    disabled={isSaving}
                    className="flex-1 px-8 py-4 border border-border rounded-xl font-bold text-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSaving ? "Saving..." : <span>💾 Save Draft</span>}
                </button>
                <button
                    onClick={analyzeAI}
                    className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                    <span>✨ Analyze with AI</span>
                </button>
                <button
                    onClick={handleComplete}
                    className="flex-1 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <span>✅ Complete</span>
                </button>
            </motion.div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">AI Analysis Report</h3>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 border border-border rounded-xl bg-accent/20 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-muted-foreground animate-pulse">Consulting Expert System...</p>
                                    </div>
                                ) : (
                                    analysisResult || "No result"
                                )}
                            </div>
                            {!isAnalyzing && analysisResult && (
                                <div className="mt-4 text-center text-sm text-green-500 font-semibold flex items-center justify-center gap-2">
                                    <span>📄</span> PDF Report Downloaded
                                </div>
                            )}
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
