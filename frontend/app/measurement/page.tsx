"use client"

import { Header } from "@/components/Header"
import { useState, useEffect } from "react"
import jsPDF from 'jspdf';

const FIELDS = [
    "infoNeed", "measurableConcept", "entity", "attribute", "baseMeasure", "derivedMeasure", "indicator"
]

export default function Measurement() {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Load latest data on mount
        fetch('/api/measurements/latest')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Object.keys(data).length > 0) setFormData(data);
            })
            .catch(() => { });
    }, [])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const saveDraft = async () => {
        const btn = document.getElementById("saveDraftBtn") as HTMLButtonElement
        if (btn) { btn.disabled = true; btn.innerText = "Saving..." }

        try {
            const token = localStorage.getItem('token');
            await fetch("/api/measurements/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            });
            if (btn) btn.innerText = "Saved!"
        } catch (e) {
            if (btn) btn.innerText = "Error"
        } finally {
            setTimeout(() => { if (btn) { btn.disabled = false; btn.innerText = "Save Draft" } }, 2000)
        }
    }

    const analyzeAI = async () => {
        setIsAnalyzing(true);
        setShowModal(true);

        const prompt = `
            You are an expert Software Quality Assurance Consultant specializing in ISO/IEC 15939 standards.
            Please analyze the following software measurement definition plan and provide a detailed compliance and quality report.
            
            Measurement Plan Details:
            1. Context/Information Need: ${formData.infoNeed || "Not specified"}
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
            - **Information Need Alignment:** [Assessment]
            - **Measurability:** [Assessment of base/derived measures]
            - **Indicator Effectiveness:** [Assessment]

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
            setAnalysisResult(`Error: ${e.message}`);
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

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">ISO 15939 Measurement Wizard</h1>
                    <p className="text-muted-foreground">Follow the 6-step process to define and implement software measurements</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-8 space-y-8">
                    {/* Steps */}
                    <div className="border-l-4 border-primary pl-6">
                        <h3 className="text-xl font-semibold mb-2">Step 1: Information Need</h3>
                        <p className="text-muted-foreground mb-4">What information do you need to make decisions?</p>
                        <textarea
                            className="w-full p-3 border border-border rounded-lg bg-background" rows={3}
                            placeholder="Example: We need to know if our application meets user expectations..."
                            value={formData.infoNeed || ''}
                            onChange={(e) => handleChange('infoNeed', e.target.value)}
                        />
                    </div>

                    <div className="border-l-4 border-border pl-6">
                        <h3 className="text-xl font-semibold mb-2">Step 2: Measurable Concept</h3>
                        <p className="text-muted-foreground mb-4">What abstract concept needs to be quantified?</p>
                        <input
                            type="text"
                            className="w-full p-3 border border-border rounded-lg bg-background"
                            placeholder="Example: Performance Efficiency"
                            value={formData.measurableConcept || ''}
                            onChange={(e) => handleChange('measurableConcept', e.target.value)}
                        />
                    </div>
                    {/* Simplified repeating blocks for brevity, could be componentized */}
                    <div className="border-l-4 border-border pl-6">
                        <h3 className="text-xl font-semibold mb-2">Step 3: Entity & Attributes</h3>
                        <div className="space-y-2">
                            <input type="text" className="w-full p-3 border border-border rounded-lg bg-background" placeholder="Entity: Web Application" value={formData.entity || ''} onChange={(e) => handleChange('entity', e.target.value)} />
                            <input type="text" className="w-full p-3 border border-border rounded-lg bg-background" placeholder="Attribute: Response Time" value={formData.attribute || ''} onChange={(e) => handleChange('attribute', e.target.value)} />
                        </div>
                    </div>

                    <div className="border-l-4 border-border pl-6">
                        <h3 className="text-xl font-semibold mb-2">Step 4: Base Measure</h3>
                        <textarea className="w-full p-3 border border-border rounded-lg bg-background" rows={2} placeholder="Collect raw data..." value={formData.baseMeasure || ''} onChange={(e) => handleChange('baseMeasure', e.target.value)} />
                    </div>

                    <div className="border-l-4 border-border pl-6">
                        <h3 className="text-xl font-semibold mb-2">Step 5: Derived Measure</h3>
                        <input type="text" className="w-full p-3 border border-border rounded-lg bg-background" placeholder="Formula..." value={formData.derivedMeasure || ''} onChange={(e) => handleChange('derivedMeasure', e.target.value)} />
                    </div>

                    <div className="border-l-4 border-border pl-6">
                        <h3 className="text-xl font-semibold mb-2">Step 6: Indicator</h3>
                        <textarea className="w-full p-3 border border-border rounded-lg bg-background" rows={2} placeholder="Interpretation logic..." value={formData.indicator || ''} onChange={(e) => handleChange('indicator', e.target.value)} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button id="saveDraftBtn" onClick={saveDraft} className="flex-1 px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors">Save Draft</button>
                        <button onClick={analyzeAI} className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                            Analyze with AI
                        </button>
                        <button className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">Complete</button>
                    </div>
                </div>

                {/* Analysis Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full mx-4 shadow-lg max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">AI Analysis Report</h3>
                                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">Close</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 border border-border rounded bg-background/50 whitespace-pre-wrap">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center h-64">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p>Analyzing...</p>
                                    </div>
                                ) : (
                                    analysisResult || "No result"
                                )}
                            </div>
                            {!isAnalyzing && analysisResult && (
                                <div className="mt-4 text-center text-sm text-green-600">PDF Downloaded automatically!</div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
