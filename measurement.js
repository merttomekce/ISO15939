// DOM elementlerini al
const saveDraftBtn = document.getElementById("saveDraft");
const completeBtn = document.getElementById("completeMeasurement");

// Form verilerini toplayan fonksiyon
function getFormData() {
    const textareas = document.querySelectorAll("textarea");
    const inputs = document.querySelectorAll("input[type='text']");
    let data = [];
    textareas.forEach(ta => data.push(ta.value));
    inputs.forEach(inp => data.push(inp.value));
    return data;
}

// Form verilerini geri yükleyen fonksiyon
function setFormData(data) {
    const textareas = document.querySelectorAll("textarea");
    const inputs = document.querySelectorAll("input[type='text']");
    let i = 0;
    textareas.forEach(ta => ta.value = data[i++] || "");
    inputs.forEach(inp => inp.value = data[i++] || "");
}

// Kaydedilmiş draft varsa yükle
window.addEventListener("DOMContentLoaded", () => {
    const draft = localStorage.getItem("measurementDraft");
    if (draft) setFormData(JSON.parse(draft));
});

// Save Draft
saveDraftBtn.addEventListener("click", () => {
    const data = getFormData();
    localStorage.setItem("measurementDraft", JSON.stringify(data));
    alert("Draft saved!");
});

// Complete Measurement
completeBtn.addEventListener("click", () => {
    const data = getFormData();

    // backend varsa fetch ile gönderebilirsin
    /*
    fetch("http://localhost:5000/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measurement: data })
    }).then(res => res.json())
      .then(res => console.log(res));
    */

    // localStorage temizle ve rapor sayfasına yönlendir
    localStorage.removeItem("measurementDraft");
    localStorage.setItem("completedMeasurement", JSON.stringify(data));
    window.location.href = "measurementReport.html";
    
});

