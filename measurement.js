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
            const response = await fetch('/api/measurements/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
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
    completeBtn.addEventListener("click", () => {
        const data = getFormData();

        // Clear draft and save completed measurement
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

        // Render Markdown using marked.js if available, else simple pre-wrap
        if (typeof marked !== 'undefined') {
            analysisContent.innerHTML = marked.parse(aiText);
        } else {
            console.warn("marked.js not found, falling back to plain text");
            analysisContent.innerHTML = `<pre class="whitespace-pre-wrap font-sans">${aiText}</pre>`;
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
