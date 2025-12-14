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

// Page Transition & Navigation Logic
document.addEventListener('DOMContentLoaded', () => {

  // 1. Entry Animation
  // Small delay to ensure DOM is ready, then fade in
  setTimeout(() => {
    document.body.classList.add('is-loaded');
  }, 50);


  // 2. Link Interception (Exit Animation)
  const links = document.querySelectorAll('a');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Logic to determine if we should intercept:
      // 1. Must have an href
      // 2. Must not be a hash link (#)
      // 3. Must be a local link (not external)
      // 4. Must not be opening in new tab

      if (href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !link.target &&
        (href.includes('.html') || href.startsWith('/') || href.startsWith('.'))) {

        // Specific logic for Home Link tracking (from previous task)
        if (href.includes('index.html') || href === './' || href === '/') {
          sessionStorage.setItem('skipIntro', 'true');
        }

        e.preventDefault();

        // Play Exit Animation
        document.body.classList.remove('is-loaded');
        document.body.classList.add('is-exiting');

        // Wait for animation then navigate
        setTimeout(() => {
          window.location.href = href;
        }, 500); // Matches CSS transition duration
      }
    });
  });

  initTheme();
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});
