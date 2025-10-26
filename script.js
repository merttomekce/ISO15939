// Theme Toggle
function initTheme() {
  const theme = localStorage.getItem("theme") || "dark"
  document.documentElement.classList.toggle("light", theme === "light")
  updateThemeIcons(theme)
}

function updateThemeIcons(theme) {
  const sunIcon = document.getElementById("sun-icon")
  const moonIcon = document.getElementById("moon-icon")

  if (theme === "light") {
    sunIcon?.classList.remove("hidden")
    moonIcon?.classList.add("hidden")
  } else {
    sunIcon?.classList.add("hidden")
    moonIcon?.classList.remove("hidden")
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains("light") ? "light" : "dark"
  const newTheme = currentTheme === "light" ? "dark" : "light"

  document.documentElement.classList.toggle("light")
  localStorage.setItem("theme", newTheme)
  updateThemeIcons(newTheme)
}

// Initialize theme on page load
document.addEventListener("DOMContentLoaded", () => {
  initTheme()

  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }
})
