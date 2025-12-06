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

const saveDraftBtn = document.getElementById("saveDraft");
const completeBtn = document.getElementById("completeMeasurement");

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

        // Visual feedback (optional but good UI)
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
        localStorage.setItem("completedMeasurement", JSON.stringify(data));

        window.location.href = "measurementReport.html";
    });
}

