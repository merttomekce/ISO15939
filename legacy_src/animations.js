document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('startup-overlay');
    const heroContent = document.querySelector('.hero-content');

    // Check if we should skip the intro
    const shouldSkip = sessionStorage.getItem('skipIntro') === 'true';

    if (shouldSkip) {
        // Hide immediately
        if (overlay) overlay.style.display = 'none';
        sessionStorage.removeItem('skipIntro'); // Clear it so refresh plays again

        // Ensure content is visible
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    } else {
        // Play Animation
        if (overlay && heroContent) {
            // Start sequence
            setTimeout(() => {
                // 1. Slide up curtain
                overlay.classList.add('curtain-up');

                // 2. Stagger content (timed with curtain)
                setTimeout(() => {
                    heroContent.classList.add('animate-stagger');
                }, 300);

                // 3. Cleanup
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 1500); // Match CSS animation duration
            }, 500); // Initial delay
        }
    }
});
