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
// REPLACE THIS WITH YOUR GEMINI API KEY
const GEMINI_API_KEY = "AIzaSyDJf8lfK4CmyNSWQ4GEC8jM0zs5XlWTwOo";
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

// Load draft on startup
window.addEventListener("DOMContentLoaded", () => {
    try {
        const draft = localStorage.getItem("measurementDraft");
        if (draft) {
            setFormData(JSON.parse(draft));
            console.log("Draft loaded");
        }
    } catch (e) {
        console.error("Error loading draft:", e);
    }
});

// Save Draft
if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
        const data = getFormData();
        localStorage.setItem("measurementDraft", JSON.stringify(data));

        // Visual feedback
        const originalText = saveDraftBtn.innerText;
        saveDraftBtn.innerText = "Saved!";
        setTimeout(() => {
            saveDraftBtn.innerText = originalText;
        }, 2000);
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
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            alert("API Key not configured. Please add your Gemini API Key to measurement.js");
            return;
        }
        performAnalysis(GEMINI_API_KEY);
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
async function performAnalysis(apiKey) {
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch from Gemini API");
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
                <p class="mt-4 text-sm text-foreground">Please check your internet connection or API Quota.</p>
                <button onclick="toggleModal(analysisModal, false)" class="mt-4 px-4 py-2 border border-red-200 rounded text-red-700 hover:bg-red-50">Close</button>
            </div>
        `;
    }
}
