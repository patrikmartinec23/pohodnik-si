// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navbar scroll effect
    userScroll();
});

// Replace Text In Header
const checkReplace = document.querySelector('.replace-me');

if (checkReplace !== null) {
    const replace = new ReplaceMe(checkReplace, {
        animation: 'animated fadeIn',
        speed: 2000,
        separator: ',',
        loopCount: 'infinite',
        autoRun: true,
    });
}

// Navbar Scroll Effect with Class Switching
function userScroll() {
    const navbar = document.querySelector('.navbar');
    const toTopBtn = document.querySelector('#to-top');

    function applyNavbarStyles() {
        if (window.scrollY > 50) {
            // When scrolled down
            navbar.classList.remove('bg-primary');
            navbar.classList.remove('navbar-dark');
            navbar.classList.add('bg-light');
            navbar.classList.add('navbar-light');
            navbar.classList.add('border-bottom');
            navbar.classList.add('border-secondary');
            navbar.classList.add('navbar-sticky');
            toTopBtn.classList.add('show');
        } else {
            // When at the top
            navbar.classList.add('bg-primary');
            navbar.classList.add('navbar-dark');
            navbar.classList.remove('bg-light');
            navbar.classList.remove('navbar-light');
            navbar.classList.remove('border-bottom');
            navbar.classList.remove('border-secondary');
            navbar.classList.remove('navbar-sticky');
            toTopBtn.classList.remove('show');
        }
    }

    // Apply styles on scroll
    window.addEventListener('scroll', applyNavbarStyles);

    // Check and apply styles on page load/refresh
    window.addEventListener('load', () => {
        if (window.scrollY > 50) {
            navbar.classList.remove('bg-primary');
            navbar.classList.remove('navbar-dark');
            navbar.classList.add('bg-light');
            navbar.classList.add('navbar-light');
            navbar.classList.add('border-bottom');
            navbar.classList.add('border-secondary');
            navbar.classList.add('navbar-sticky');
            toTopBtn.classList.add('show');
        } else {
            navbar.classList.add('bg-primary');
            navbar.classList.add('navbar-dark');
            toTopBtn.classList.remove('show');
        }
    });
}

function incrementStats(counter) {
    const target = +counter.getAttribute('data-target');
    counter.innerText = 0;

    const updateCounter = () => {
        const c = +counter.innerText;
        const increment = target / 350;

        if (c < target) {
            counter.innerText = Math.ceil(c + increment);
            setTimeout(updateCounter, 1);
        } else {
            counter.innerText = target;
        }
    };

    updateCounter();
}

function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            incrementStats(entry.target);
            observer.unobserve(entry.target);
        }
    });
}

const observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.5,
});

document.querySelectorAll('.counter').forEach((counter) => {
    observer.observe(counter);
});

// Video Modal
const videoBtn = document.querySelector('.video-btn');
const videoModal = document.querySelector('#videoModal');
const video = document.querySelector('#video');
let videoSrc;

if (videoBtn !== null) {
    videoBtn.addEventListener('click', () => {
        videoSrc = videoBtn.getAttribute('data-bs-src');
    });
}

if (videoModal !== null) {
    videoModal.addEventListener('shown.bs.modal', () => {
        video.setAttribute(
            'src',
            videoSrc + '?autoplay=1&modestbranding=1&showInfo=0'
        );
    });

    videoModal.addEventListener('hide.bs.modal', () => {
        video.setAttribute('src', videoSrc);
    });
}

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

document.querySelector('#to-top').addEventListener('click', scrollToTop);

// Animated counter function
function animateCounter(counter, target) {
    let current = 0;
    // Animation duration: 1000ms for small numbers, up to 4000ms for large numbers
    const duration = Math.min(4000, Math.max(1000, target * 50));
    const steps = Math.min(target, 20); // never more than 20 steps
    const stepValue = Math.ceil(target / steps);
    const stepTime = Math.floor(duration / steps);

    function update() {
        current += stepValue;
        if (current >= target) {
            counter.innerText = target;
        } else {
            counter.innerText = current;
            setTimeout(update, stepTime);
        }
    }
    update();
}

// Fetch stats from the server and update the counters with animation
async function loadStats() {
    try {
        const res = await fetch('https://pohodnik-backend.onrender.com/api/stats');
        if (!res.ok) throw new Error('Napaka pri pridobivanju statistike');
        const stats = await res.json();

        // Find all h2 elements in the stats section and update them
        const statEls = document.querySelectorAll('.col-md-4 h2');
        statEls.forEach((el) => {
            const label =
                el.nextElementSibling?.textContent?.toLowerCase() || '';
            let value = 0;
            if (label.includes('uporabnikov')) {
                value = stats.users;
            } else if (label.includes('pohodov')) {
                value = stats.pohodi;
            } else if (label.includes('društev') || label.includes('drustev')) {
                value = stats.drustva;
            }
            el.setAttribute('data-target', value);
            el.innerText = '0';
            animateCounter(el, value);
        });
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadStats);
