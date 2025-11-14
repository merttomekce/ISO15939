// Simulator State
const state = {
  currentStep: 1,
  selectedDimensions: [],
  weights: {},
  metrics: {},
  caseStudy: null,
  customScenario: { name: '', description: '' },
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initSimulator()
})

function initSimulator() {
  // Case study selection
  document.querySelectorAll(".case-study-card").forEach((card) => {
    card.addEventListener("click", () => selectCaseStudy(card))
  })

  // Custom Scenario selection
  document.getElementById('custom-scenario-radio').addEventListener('change', selectCustomScenario);
  document.querySelector('.custom-scenario-card').addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'text' || e.target.tagName === 'TEXTAREA') {
          return;
      }
      if (!document.getElementById('custom-scenario-radio').checked) {
          document.getElementById('custom-scenario-radio').click();
      }
  });

  document.getElementById('project-name').addEventListener('input', (e) => {
    state.customScenario.name = e.target.value;
  });
  document.getElementById('project-description').addEventListener('input', (e) => {
    state.customScenario.description = e.target.value;
  });

  // Dimension checkboxes
  document.querySelectorAll(".dimension-checkbox input").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const dimension = e.target.value;
      if (e.target.checked) {
        if (!state.selectedDimensions.includes(dimension)) {
            state.selectedDimensions.push(dimension);
        }
      } else {
        state.selectedDimensions = state.selectedDimensions.filter((d) => d !== dimension);
      }
      
      // When a dimension is manually changed, switch to a custom mode
      // but do NOT clear the dimension that was just changed.
      document.getElementById('custom-scenario-radio').checked = true;
      document.getElementById('custom-scenario-inputs').classList.remove('hidden');
      document.querySelectorAll('.case-study-card').forEach(c => c.classList.remove('selected'));
      state.caseStudy = null;
    })
  })

  // Navigation buttons
  document.getElementById("prev-btn").addEventListener("click", previousStep)
  document.getElementById("next-btn").addEventListener("click", nextStep)

  // Step navigation
  document.querySelectorAll(".step-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number.parseInt(btn.dataset.step)
      if (step <= state.currentStep || btn.classList.contains("completed")) {
        goToStep(step)
      }
    })
  })
}

function selectCustomScenario() {
    // This function is called by an explicit click on the custom scenario radio/label.
    // Its purpose is to provide a clean slate.
    if (document.getElementById('custom-scenario-radio').checked) {
        document.getElementById('custom-scenario-inputs').classList.remove('hidden');

        // Deselect case studies
        document.querySelectorAll('.case-study-card').forEach(c => c.classList.remove('selected'));
        state.caseStudy = null;

        // Clear all dimension selections
        document.querySelectorAll(".dimension-checkbox input").forEach((cb) => (cb.checked = false));
        state.selectedDimensions = [];
    }
}

function selectCaseStudy(card) {
  // Deselect all case study cards
  document.querySelectorAll(".case-study-card").forEach((c) => c.classList.remove("selected"))

  // Select the clicked card
  card.classList.add("selected")

  // Hide custom scenario inputs and uncheck radio
  document.getElementById('custom-scenario-inputs').classList.add('hidden');
  document.getElementById('custom-scenario-radio').checked = false;
  state.customScenario = { name: '', description: '' };
  document.getElementById('project-name').value = '';
  document.getElementById('project-description').value = '';

  // Clear existing selected dimensions and checkboxes
  document.querySelectorAll(".dimension-checkbox input").forEach((cb) => (cb.checked = false))
  state.selectedDimensions = [];

  // Set predefined dimensions based on case study
  const title = card.querySelector("h4").textContent
  if (title.includes("E-commerce")) {
    state.selectedDimensions = ["efficiency", "security", "usability"]
    state.caseStudy = "ecommerce"
  } else if (title.includes("Banking")) {
    state.selectedDimensions = ["security", "reliability", "usability"]
    state.caseStudy = "banking"
  }

  // Check corresponding checkboxes
  state.selectedDimensions.forEach((dim) => {
    const checkbox = document.querySelector(`input[value="${dim}"]`)
    if (checkbox) checkbox.checked = true
  })
}

function nextStep() {
  if (state.currentStep === 1) {
    const useCustomScenario = document.getElementById('custom-scenario-radio').checked;
    if (useCustomScenario && !state.customScenario.name.trim()) {
        alert('Please enter a Project Name for your custom scenario.');
        return;
    }
    if (state.selectedDimensions.length === 0) {
      alert("Please select at least one quality dimension.")
      return
    }
    generateWeightsStep()
  } else if (state.currentStep === 2) {
    const total = Object.values(state.weights).reduce((sum, w) => sum + w, 0)
    if (Math.abs(total - 100) > 0.1) {
      alert("Total weight must equal 100%")
      return
    }
    generateMetricsStep()
  } else if (state.currentStep === 3) {
    if (Object.keys(state.metrics).length !== state.selectedDimensions.length) {
      alert("Please enter values for all dimensions.")
      return
    }
    generateAnalysisStep()
  }

  if (state.currentStep < 4) {
    goToStep(state.currentStep + 1)
  } else { // This will be step 4, and the button text is "Finish"
    window.location.href = 'index.html'; // Redirect to the main page
  }
}

function previousStep() {
  if (state.currentStep > 1) {
    goToStep(state.currentStep - 1)
  }
}

function goToStep(step) {
  // Hide all steps
  document.querySelectorAll(".step-content").forEach((s) => s.classList.add("hidden"))

  // Show target step
  document.getElementById(`step-${step}`).classList.remove("hidden")

  // Update state
  state.currentStep = step

  // Update UI
  document.getElementById("current-step").textContent = step
  document.getElementById("progress-bar").style.width = `${(step / 4) * 100}%`

  // Update step titles
  const titles = ["Define Quality Dimensions", "Assign Weights", "Collect Metrics", "Analyse Results"]
  document.getElementById("step-title").textContent = titles[step - 1]

  // Update navigation buttons
  document.getElementById("prev-btn").disabled = step === 1
  document.getElementById("next-btn").textContent = step === 4 ? "Finish" : "Next"

  // Update step navigation
  document.querySelectorAll(".step-nav-btn").forEach((btn) => {
    const btnStep = Number.parseInt(btn.dataset.step)
    btn.classList.remove("active", "completed")
    if (btnStep === step) {
      btn.classList.add("active")
    } else if (btnStep < step) {
      btn.classList.add("completed")
    }
  })
}

function generateWeightsStep() {
  const container = document.getElementById("weights-container")
  container.innerHTML = ""

  const equalWeight = Math.floor(100 / state.selectedDimensions.length)
  const remaining = 100 - equalWeight * state.selectedDimensions.length

  state.selectedDimensions.forEach((dim, index) => {
    const weight = equalWeight + (index === 0 ? remaining : 0)
    state.weights[dim] = weight

    const div = document.createElement("div")
    div.className = "space-y-2"
    div.innerHTML = `
            <div class="flex justify-between items-center">
                <label class="font-medium capitalize">${dim}</label>
                <span class="text-primary font-semibold">${weight}%</span>
            </div>
            <input type="range" min="0" max="100" value="${weight}" 
                   class="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer"
                   data-dimension="${dim}"
                   oninput="updateWeight('${dim}', this.value)">
        `
    container.appendChild(div)
  })

  updateTotalWeight()
}

function updateWeight(dimension, value) {
  state.weights[dimension] = Number.parseInt(value)

  // Update display
  const container = document.getElementById("weights-container")
  const label = container.querySelector(`input[data-dimension="${dimension}"]`).parentElement.querySelector("span")
  label.textContent = `${value}%`

  updateTotalWeight()
}

function updateTotalWeight() {
  const total = Object.values(state.weights).reduce((sum, w) => sum + w, 0)
  const totalElement = document.getElementById("total-weight")
  totalElement.textContent = `${total}%`
  totalElement.className = `text-2xl font-bold ${Math.abs(total - 100) < 0.1 ? "text-primary" : "text-destructive"}`
}

function generateMetricsStep() {
  const container = document.getElementById("metrics-container")
  container.innerHTML = ""

  state.selectedDimensions.forEach((dim) => {
    const div = document.createElement("div")
    div.className = "space-y-2"
    div.innerHTML = `
            <label class="font-medium capitalize block">${dim}</label>
            <p class="text-sm text-muted-foreground">Enter the measured value (0-100)</p>
            <input type="number" min="0" max="100" 
                   class="w-full p-3 border border-border rounded-lg bg-background"
                   placeholder="Enter value..."
                   data-dimension="${dim}"
                   oninput="updateMetric('${dim}', this.value)">
            <div class="h-2 bg-accent rounded-full overflow-hidden">
                <div class="h-full bg-primary transition-all duration-300" 
                     style="width: 0%" 
                     data-bar="${dim}"></div>
            </div>
        `
    container.appendChild(div)
  })
}

function updateMetric(dimension, value) {
  const numValue = Number.parseFloat(value)
  if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
    state.metrics[dimension] = numValue

    // Update progress bar
    const bar = document.querySelector(`[data-bar="${dimension}"]`)
    if (bar) {
      bar.style.width = `${numValue}%`
    }
  }
}

function generateAnalysisStep() {
  // Calculate overall score
  let overallScore = 0
  state.selectedDimensions.forEach((dim) => {
    overallScore += (state.metrics[dim] * state.weights[dim]) / 100
  })

  document.getElementById("overall-score").textContent = overallScore.toFixed(1)

  // Quality rating
  let rating = ""
  if (overallScore >= 80) rating = "Excellent Quality"
  else if (overallScore >= 60) rating = "Good Quality"
  else if (overallScore >= 40) rating = "Fair Quality"
  else rating = "Needs Improvement"

  document.getElementById("quality-rating").textContent = rating

  // Generate radar chart
  generateRadarChart()

  // Generate dimension breakdown
  generateDimensionBreakdown()

  // Generate recommendations
  generateRecommendations()
}

function generateRadarChart() {
  const ctx = document.getElementById("radarChart")

  // Destroy existing chart if any
  if (window.radarChartInstance) {
    window.radarChartInstance.destroy()
  }

  const labels = state.selectedDimensions.map((d) => d.charAt(0).toUpperCase() + d.slice(1))
  const data = state.selectedDimensions.map((d) => state.metrics[d])

  window.radarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Quality Metrics",
          data: data,
          backgroundColor: "rgba(0, 191, 165, 0.2)",
          borderColor: "rgb(0, 191, 165)",
          borderWidth: 2,
          pointBackgroundColor: "rgb(0, 191, 165)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(0, 191, 165)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: "hsl(215.4 16.3% 56.9%)",
          },
          grid: {
            color: "hsl(216 34% 17%)",
          },
          pointLabels: {
            color: "hsl(213 31% 91%)",
            font: {
              size: 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })
}

function generateDimensionBreakdown() {
  const container = document.getElementById("dimension-breakdown")
  container.innerHTML = ""

  state.selectedDimensions.forEach((dim) => {
    const score = state.metrics[dim]
    const weight = state.weights[dim]
    const weightedScore = (score * weight) / 100

    const div = document.createElement("div")
    div.className = "flex items-center justify-between p-4 border border-border rounded-lg"
    div.innerHTML = `
            <div class="flex-1">
                <div class="font-medium capitalize mb-1">${dim}</div>
                <div class="text-sm text-muted-foreground">Weight: ${weight}% | Score: ${score}</div>
            </div>
            <div class="text-right">
                <div class="text-2xl font-bold text-primary">${weightedScore.toFixed(1)}</div>
                <div class="text-xs text-muted-foreground">Weighted</div>
            </div>
        `
    container.appendChild(div)
  })
}

function generateRecommendations() {
  const container = document.getElementById("recommendations")
  container.innerHTML = ""

  // Find dimensions that need improvement
  const improvements = state.selectedDimensions
    .filter((dim) => state.metrics[dim] < 60)
    .sort((a, b) => state.metrics[a] - state.metrics[b])

  if (improvements.length === 0) {
    container.innerHTML = `
            <div class="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div class="flex gap-3">
                    <svg class="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <div class="font-semibold mb-1">Excellent Performance!</div>
                        <div class="text-sm text-muted-foreground">All quality dimensions meet or exceed expectations. Continue monitoring to maintain this level of quality.</div>
                    </div>
                </div>
            </div>
        `
  } else {
    improvements.forEach((dim) => {
      const score = state.metrics[dim]
      const recommendation = getRecommendation(dim, score)

      const div = document.createElement("div")
      div.className = "p-4 bg-accent border border-border rounded-lg"
      div.innerHTML = `
                <div class="flex gap-3">
                    <svg class="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <div class="font-semibold mb-1 capitalize">${dim} (Score: ${score})</div>
                        <div class="text-sm text-muted-foreground">${recommendation}</div>
                    </div>
                </div>
            `
      container.appendChild(div)
    })
  }
}

function getRecommendation(dimension, score) {
  const recommendations = {
    functionality: "Review feature completeness and correctness. Consider user feedback and conduct thorough testing.",
    reliability: "Implement better error handling, increase test coverage, and monitor system stability.",
    usability: "Conduct user testing, simplify workflows, and improve UI/UX design based on user feedback.",
    efficiency: "Optimize algorithms, reduce resource consumption, and implement caching strategies.",
    maintainability: "Improve code documentation, refactor complex code, and establish coding standards.",
    portability: "Reduce platform dependencies, use standard APIs, and test on multiple environments.",
    security: "Conduct security audits, implement encryption, and follow security best practices.",
    compatibility: "Test with different systems and browsers, use standard protocols and formats.",
  }

  return recommendations[dimension] || "Focus on improving this quality dimension through targeted improvements."
}
