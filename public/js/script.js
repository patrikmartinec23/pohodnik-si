// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navbar scroll effect
    initNavbarScroll();
});

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    function updateNavbarStyle() {
        if (window.scrollY > 50) {
            // When scrolled down
            navbar.classList.remove('bg-primary', 'navbar-dark');
            navbar.classList.add(
                'bg-light',
                'navbar-light',
                'border-bottom',
                'border-secondary',
                'navbar-sticky'
            );
        } else {
            // When at top
            navbar.classList.add('bg-primary', 'navbar-dark');
            navbar.classList.remove(
                'bg-light',
                'navbar-light',
                'border-bottom',
                'border-secondary',
                'navbar-sticky'
            );
        }
    }

    // Apply styles on scroll
    window.addEventListener('scroll', updateNavbarStyle);

    // Check initial scroll position
    updateNavbarStyle();
}
