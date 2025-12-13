// Define the fields to track
const FIELDS = [
    "infoNeed",
    "measurableConcept",
    "entity",
    "attribute",
    "baseMeasure",
    "derivedMeasure",
    "indicator"
];

// --- CONFIGURATION ---
// API Key is now handled in the backend (.env file)
// ---------------------

const saveDraftBtn = document.getElementById("saveDraft");
const completeBtn = document.getElementById("completeMeasurement");
const analyzeBtn = document.getElementById("analyzeAI");

// Modal Elements
const analysisModal = document.getElementById("analysisModal");
const analysisContent = document.getElementById("analysisContent");
const closeAnalysisBtn = document.getElementById("closeAnalysis");
const doneAnalysisBtn = document.getElementById("doneAnalysis");
const copyAnalysisBtn = document.getElementById("copyAnalysis");
const downloadAiPdfBtn = document.getElementById("downloadAiPdf");

// Collect form data into an object
function getFormData() {
    const data = {};
    FIELDS.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            data[id] = element.value;
        }
    });
    return data;
}

// Populate form from data object
function setFormData(data) {
    if (!data) return;
    FIELDS.forEach(id => {
        const element = document.getElementById(id);
        if (element && data[id] !== undefined) {
            element.value = data[id];
        }
    });
}

// Load data from Database on startup
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/api/measurements/latest');

        if (response.ok) {
            const data = await response.json();
            // Validate data existence to prevent form errors
            if (data && Object.keys(data).length > 0) {
                setFormData(data);
                console.log("Data successfully retrieved from database.");
            }
        }
    } catch (e) {
        // Suppress error if no initial data is found or server is unreachable
        console.warn("No existing data found or server unreachable.");
    }
});

// Save to Database (Draft)
if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", async (e) => {
        // Prevent default form submission behavior
        if (e) e.preventDefault();

        const data = getFormData();

        // UI Feedback: Set button state to 'Saving...'
        const originalText = saveDraftBtn.innerText;
        saveDraftBtn.innerText = "Saving...";
        saveDraftBtn.disabled = true;

        try {
            const token = auth.getToken();
            const headers = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch("/api/measurements/save", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Draft saved successfully:", result);

                saveDraftBtn.innerText = "Saved!";
            } else {
                throw new Error("Server responded with an error");
            }
        } catch (error) {
            console.error("Save operation failed:", error);
            saveDraftBtn.innerText = "Error!";
            alert("Failed to save data. Please verify the server connection.");
        } finally {
            // Restore button to original state
            setTimeout(() => {
                saveDraftBtn.innerText = originalText;
                saveDraftBtn.disabled = false;
            }, 2000);
        }
    });
}

// Complete Measurement
if (completeBtn) {
    completeBtn.addEventListener("click", async () => {
        const data = getFormData();

        // Save to Backend (for history)
        try {
            const token = auth.getToken();
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            await fetch("/api/measurements/save", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data),
            });
        } catch (e) {
            console.error("Failed to save to history on complete:", e);
        }

        // Clear draft and save completed measurement (Legacy/Report Page support)
        localStorage.removeItem("measurementDraft");
        FIELDS.forEach((field, index) => {
            localStorage.setItem(`step${index + 1}`, data[field]);
        });
        localStorage.setItem("completedMeasurement", JSON.stringify(data));

        window.location.href = "measurementReport.html";
    });
}

// --- AI Analysis Logic ---

// Toggle Modals
function toggleModal(modal, show) {
    if (show) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } else {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

// Handle Analyze Button Click
if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
        performAnalysis();
    });
}

// Handle Analysis Modal Actions
if (closeAnalysisBtn) closeAnalysisBtn.addEventListener("click", () => toggleModal(analysisModal, false));
if (doneAnalysisBtn) doneAnalysisBtn.addEventListener("click", () => toggleModal(analysisModal, false));

if (copyAnalysisBtn) {
    copyAnalysisBtn.addEventListener("click", () => {
        const text = analysisContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyAnalysisBtn.innerText;
            copyAnalysisBtn.innerText = "Copied!";
            setTimeout(() => {
                copyAnalysisBtn.innerText = originalText;
            }, 2000);
        });
    });
}

if (downloadAiPdfBtn) {
    downloadAiPdfBtn.addEventListener("click", () => {
        if (!window.jspdf) {
            alert("PDF library not loaded.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("ISO 15939 - AI Analysis Report", 105, 20, null, null, "center");

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, null, null, "center");

        doc.setFontSize(11);
        const text = analysisContent.innerText;
        const splitText = doc.splitTextToSize(text, 170);

        doc.text(splitText, 20, 40);
        doc.save("ISO15939_AI_Analysis.pdf");
    });
}

// Perform User Data Analysis
async function performAnalysis() {
    toggleModal(analysisModal, true);

    // Show loading state
    analysisContent.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 space-y-4">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-muted-foreground animate-pulse">Analyzing your measurement plan with AI...</p>
        </div>
    `;

    const data = getFormData();

    // Construct Prompt
    const prompt = `
        You are an expert Software Quality Assurance Consultant specializing in ISO/IEC 15939 standards.
        Please analyze the following software measurement definition plan and provide a detailed compliance and quality report.
        
        Measurement Plan Details:
        1. Context/Information Need: ${data.infoNeed || "Not specified"}
        2. Measurable Concept: ${data.measurableConcept || "Not specified"}
        3. Entity: ${data.entity || "Not specified"}
        4. Attribute: ${data.attribute || "Not specified"}
        5. Base Measure: ${data.baseMeasure || "Not specified"}
        6. Derived Measure: ${data.derivedMeasure || "Not specified"}
        7. Indicator: ${data.indicator || "Not specified"}

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
        // Send to local backend proxy
        const response = await fetch('/api/ai/analyze', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch from Backend API");
        }

        const result = await response.json();
        const aiText = result.candidates[0].content.parts[0].text;

        // Save to LocalStorage for the Report Page
        localStorage.setItem("aiMeasurementAnalysis", aiText);

        // --- Generate Professional PDF Immediately ---
        if (!window.jspdf) {
            analysisContent.innerHTML = `<div class="p-4 text-red-600">PDF Library missing. Please reload.</div>`;
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // --- Helper Constants ---
        const MARGIN_LEFT = 20;
        const MARGIN_TOP = 25;
        const LINE_HEIGHT_NORMAL = 6;
        const LINE_HEIGHT_HEADING = 10;
        const PAGE_HEIGHT = doc.internal.pageSize.height;
        let yPos = MARGIN_TOP;

        // --- Header Function ---
        function drawHeader() {
            doc.setFillColor(41, 128, 185); // Professional Blue
            doc.rect(0, 0, 210, 15, 'F'); // Blue banner top

            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("AI Quality Analysis Report", 105, 10, null, null, "center");

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`ISO 15939 Measurement Analysis`, MARGIN_LEFT, 22);
            doc.text(`${new Date().toLocaleString()}`, 190, 22, null, null, "right");

            // Divider Line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(MARGIN_LEFT, 23, 190, 23);

            yPos = 35; // Reset yPos for content
        }

        // --- Pages Setup ---
        drawHeader();

        const lines = aiText.split('\n');

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        lines.forEach(line => {
            // 1. New Page Check
            if (yPos > PAGE_HEIGHT - 25) {
                doc.addPage();
                drawHeader();
            }

            line = line.trim();
            if (!line) {
                yPos += 3; // Small spacer for empty lines
                return;
            }

            // 2. Formatting Logic
            if (line.startsWith('## ')) {
                // H2 Heading
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.setTextColor(41, 128, 185); // Blue

                const text = line.replace('## ', '');
                doc.text(text, MARGIN_LEFT, yPos);
                yPos += LINE_HEIGHT_HEADING;

                // Underline for headings
                doc.setDrawColor(41, 128, 185);
                doc.setLineWidth(0.5);
                doc.line(MARGIN_LEFT, yPos - 8, 150, yPos - 8);

            } else if (line.startsWith('### ')) {
                // H3 Heading
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50); // Dark Gray

                const text = line.replace('### ', '');
                doc.text(text, MARGIN_LEFT, yPos);
                yPos += LINE_HEIGHT_HEADING - 2;

            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                // Bullet Point
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);

                const text = line.replace(/^[-*]\s*/, '');
                const wrappedText = doc.splitTextToSize(text, 160); // Narrower for indent

                // Draw Bullet
                doc.text("•", MARGIN_LEFT + 2, yPos);

                // Draw Text Block
                wrappedText.forEach(outputLine => {
                    // Check page break inside list item
                    if (yPos > PAGE_HEIGHT - 25) {
                        doc.addPage();
                        drawHeader();
                    }
                    doc.text(outputLine, MARGIN_LEFT + 8, yPos);
                    yPos += LINE_HEIGHT_NORMAL;
                });
                yPos += 1; // Extra space between items

            } else {
                // Normal Paragraph
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);

                // Simple bold detection like **text** - remove marks and bold whole line if mostly bold, 
                // otherwise just print plain. Building a full rich-text parser is complex for jspdf without plugins.
                // We will strip the MD syntax for bolding to keep it clean.
                const cleanLine = line.replace(/\*\*/g, '');

                const wrappedText = doc.splitTextToSize(cleanLine, 170);

                wrappedText.forEach(outputLine => {
                    if (yPos > PAGE_HEIGHT - 25) {
                        doc.addPage();
                        drawHeader();
                    }
                    doc.text(outputLine, MARGIN_LEFT, yPos);
                    yPos += LINE_HEIGHT_NORMAL;
                });
                yPos += 2; // Spacer after paragraphs
            }
        });

        // Add Footer page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, PAGE_HEIGHT - 10, null, null, "center");
        }

        // Open in new tab
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const newWindow = window.open(pdfUrl, '_blank');

        // Update Modal Content
        if (newWindow) {
            analysisContent.innerHTML = `
                <div class="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                    <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                         <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-foreground">Report Generated!</h3>
                    <p class="text-muted-foreground">The PDF has opened in a new tab.</p>
                </div>
            `;
        } else {
            analysisContent.innerHTML = `
                <div class="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                    <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                         <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-foreground">Your AI analyzed PDF report is ready</h3>
                    <a href="${pdfUrl}" target="_blank" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Open PDF Report</a>
                </div>
            `;
        }

    } catch (error) {
        console.error("AI Analysis Error:", error);
        analysisContent.innerHTML = `
            <div class="text-center p-6 text-red-500">
                <h3 class="text-lg font-bold mb-2">Analysis Failed</h3>
                <p>Error: ${error.message}</p>
                 <div class="mt-4 p-4 bg-red-50 text-sm rounded text-left">
                    <strong>Troubleshooting:</strong>
                    <ul class="list-disc ml-5 mt-2">
                        <li>Make sure the backend server is running (<code>npm start</code> in backend folder).</li>
                         <li>Check if API Key is configured in <code>backend/.env</code>.</li>
                    </ul>
                </div>
                <button onclick="toggleModal(analysisModal, false)" class="mt-4 px-4 py-2 border border-red-200 rounded text-red-700 hover:bg-red-50">Close</button>
            </div>
        `;
    }
}
