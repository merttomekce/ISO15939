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

// Navigation Tracking for Animation
document.addEventListener('DOMContentLoaded', () => {
  // Select all links navigating to home
  const homeLinks = document.querySelectorAll('a[href="index.html"], a[href="./index.html"]');

  homeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Only if we are NOT currently on index.html (optional, but good practice)
      // Actually, we want it even if we are on index.html and clicking home again?
      // The requirement says "not when we click another page... and then click home again"
      // Wait, "not when we click another page... and then click home again" means:
      // IF we go simulator -> home, do NOT play animation.
      // So we DO want to set the flag when clicking these links.
      sessionStorage.setItem('skipIntro', 'true');
    });
  });
});
