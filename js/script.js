// Newsletter Form Handling
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for subscribing! Check your email for confirmation.');
        this.reset();
    });
}

// Active Navigation Link
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            link.classList.remove('active');
            if (href.slice(1) === current) {
                link.classList.add('active');
            }
        }
    });
});

// Smooth Scrolling
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.slice(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight || 110;
                const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - headerHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// CTA Button Scroll/Route
const ctaButtons = document.querySelectorAll('.cta-button, .header-cta');
ctaButtons.forEach((button) => {
    button.addEventListener('click', () => {
        window.location.href = 'inquire.html';
    });
});

// Slideshow Controls
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('slidePrev');
const nextBtn = document.getElementById('slideNext');
let currentSlideIndex = 0;
let slideInterval;

function initSlider() {
    if (slides.length === 0) return;
    
    // Auto slide
    slideInterval = setInterval(nextSlide, 7000);

    // Manual controls
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
            resetInterval();
        });
    });
}

function updateSlider() {
    slides.forEach((slide, idx) => {
        slide.classList.remove('active');
        indicators[idx].classList.remove('active');
        if (idx === currentSlideIndex) {
            slide.classList.add('active');
            indicators[idx].classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    updateSlider();
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    updateSlider();
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateSlider();
}

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 7000);
}

// Initialize when DOM is somewhat already loaded, but safe practice:
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSlider);
} else {
    initSlider();
}


// Handle hash on page load
window.addEventListener('load', () => {
    if (window.location.hash) {
        const targetSection = document.querySelector(window.location.hash);
        if (targetSection) {
            setTimeout(() => {
                const headerHeight = document.querySelector('.header').offsetHeight || 110;
                const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - headerHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    } else {
        // Prevent random auto-scrolls down if no hash is present, restoring top position
        window.scrollTo(0, 0);
    }
});

// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('open');
            nav.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('open');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }
});

// Accordion Logic
document.addEventListener("DOMContentLoaded", () => {
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
});

const tripDetailsData = {
    '01': {
        title: 'Galle Coastal Escape',
        description: 'A relaxed 2-night Galle getaway with heritage sites, beach time, wildlife experiences, and a luxury villa stay.',
        overview: 'Spend 2 nights in Galle with breakfast at the villa each morning. Lunch and dinner are taken out, giving you plenty of flexibility while you enjoy the coast at a comfortable pace.',
        quickFacts: ['2 Nights in Galle', '5-Star Villa Stay', 'Breakfast at the villa', 'Lunch out', 'Dinner out'],
        dayPlans: [
            {
                title: 'Day 1 | Galle Fort, Beach Time, and Peace Pagoda',
                items: [
                    'Explore Galle Fort and the old Dutch quarter at an easy pace.',
                    'Choose Unawatuna Beach or Jungle Beach for swimming or snorkeling.',
                    'Visit the Japanese Peace Pagoda for a calm sunset viewpoint.',
                    'Return to your 5-star villa for the night after lunch and dinner out.'
                ]
            },
            {
                title: 'Day 2 | Turtle Hatchery, Koggala Lake, and Stilt Fishing',
                items: [
                    'Visit the Habaraduwa Turtle Hatchery to see conservation work up close.',
                    'Enjoy a Koggala Lake safari and the surrounding lagoon scenery.',
                    'Stop for a traditional stilt fishing experience and photos.',
                    'Breakfast is served at the villa, with lunch and dinner out again.'
                ]
            }
        ],
        stayPlan: [
            '2 nights in a 5-star villa in Galle',
            'Private, comfortable accommodation for a relaxed coastal break',
            'Ideal for couples, families, or small private groups'
        ],
        mealPlan: [
            'Breakfast: from the villa',
            'Lunch: out',
            'Dinner: out'
        ],
        highlights: ['Galle Fort', 'Unawatuna Beach', 'Jungle Beach', 'Japanese Peace Pagoda', 'Habaraduwa Turtle Hatchery', 'Koggala Lake Safari', 'Stilt Fishing'],
        photoText: 'Temporary placeholder: upload Day 1 Galle photos later.',
        videoText: 'Temporary placeholder: upload Day 1 Galle videos later.'
    },
    '02': {
        title: 'Anuradhapura',
        description: 'A sacred city tour focused on key Buddhist heritage sites and historical monuments.',
        highlights: ['Ruwanwelisaya', 'Jaya Sri Maha Bodhi', 'Thuparamaya', 'Jethawanaramaya', 'Abhayagiriya', 'Tissa Lake'],
        photoText: 'Temporary placeholder: upload Day 2 Anuradhapura photos later.',
        videoText: 'Temporary placeholder: upload Day 2 Anuradhapura videos later.'
    },
    '03': {
        title: 'Polonnaruwa',
        description: 'Discover ancient ruins and nearby nature parks around the Polonnaruwa region.',
        highlights: ['Vatadage', 'Gal Viharaya', 'Parakrama Samudra', 'Minneriya National Park', 'Kaudulla Lake'],
        photoText: 'Temporary placeholder: upload Day 3 Polonnaruwa photos later.',
        videoText: 'Temporary placeholder: upload Day 3 Polonnaruwa videos later.'
    },
    '04': {
        title: 'Kandy',
        description: 'A cultural and scenic day in and around Kandy with temples, gardens, and viewpoints.',
        highlights: ['Temple of the Tooth', 'Royal Botanic Gardens Peradeniya', 'Ramboda Falls', 'Victoria Dam'],
        photoText: 'Temporary placeholder: upload Day 4 Kandy photos later.',
        videoText: 'Temporary placeholder: upload Day 4 Kandy videos later.'
    },
    '05': {
        title: 'Nuwara Eliya',
        description: 'Enjoy cool-climate attractions with nature, open parks, and tea-country landscapes.',
        highlights: ['Horton Plains National Park', 'Gregory Park', 'Sandathenna'],
        photoText: 'Temporary placeholder: upload Day 5 Nuwara Eliya photos later.',
        videoText: 'Temporary placeholder: upload Day 5 Nuwara Eliya videos later.'
    },
    '06': {
        title: 'Ella',
        description: 'An adventure and sightseeing day across Ella landmarks and surrounding waterfalls.',
        highlights: ['Nine Arch Bridge', "Little Adam's Peak", 'Ella Rock', 'Ravana Cave', 'Ella Waterfall', 'Kubalwela Temple', 'Flying Ravana Adventure Park', 'Dunhinda Falls'],
        photoText: 'Temporary placeholder: upload Day 6 Ella photos later.',
        videoText: 'Temporary placeholder: upload Day 6 Ella videos later.'
    }
};

// Open trip details page in a new tab/window from tours page
document.addEventListener("DOMContentLoaded", () => {
    const viewButtons = document.querySelectorAll('.view-tour-btn');
    if (viewButtons.length === 0) {
        return;
    }

    viewButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const day = button.dataset.day || '01';
            window.location.href = `trip-details.html?day=${encodeURIComponent(day)}`;
        });
    });
});

// Initialize trip details page content
document.addEventListener("DOMContentLoaded", () => {
    const dayLabel = document.getElementById('tripDayLabel');
    const title = document.getElementById('tripTitle');
    const description = document.getElementById('tripSummary');
    const highlights = document.getElementById('tripHighlights');
    const genericTripDetails = document.getElementById('genericTripDetails');
    const galleTourDetails = document.getElementById('galleTourDetails');
    const galleTourOverview = document.getElementById('galleTourOverview');
    const galleQuickFacts = document.getElementById('galleQuickFacts');
    const galleDayPlans = document.querySelectorAll('[data-galle-day-plan]');
    const galleStayPlan = document.getElementById('galleStayPlan');
    const galleMealPlan = document.getElementById('galleMealPlan');
    const galleHeroSlider = document.getElementById('galleHeroSlider');
    const anuradhapuraHeroSlider = document.getElementById('anuradhapuraHeroSlider');
    const kandyHeroSlider = document.getElementById('kandyHeroSlider');

    if (!dayLabel || !title || !description || !highlights) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const day = params.get('day') || '01';
    const detail = tripDetailsData[day] || tripDetailsData['01'];

    dayLabel.textContent = day === '01' ? 'GALLE TOUR' : `DAY ${day}`;
    title.textContent = detail.title;
    description.textContent = detail.description;

    if (genericTripDetails && galleTourDetails) {
        if (day === '01') {
            genericTripDetails.classList.add('hidden');
            galleTourDetails.classList.remove('hidden');
        } else {
            genericTripDetails.classList.remove('hidden');
            galleTourDetails.classList.add('hidden');
        }
    }

    if (day === '01' && galleTourOverview && galleQuickFacts && galleStayPlan && galleMealPlan) {
        galleTourOverview.textContent = detail.overview || detail.description;

        galleQuickFacts.innerHTML = '';
        (detail.quickFacts || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            galleQuickFacts.appendChild(li);
        });

        galleDayPlans.forEach((planElement, index) => {
            const plan = detail.dayPlans && detail.dayPlans[index];
            if (!plan) {
                planElement.innerHTML = '';
                return;
            }

            planElement.innerHTML = `
                <h3>${plan.title}</h3>
                <ul>${plan.items.map((item) => `<li>${item}</li>`).join('')}</ul>
            `;
        });

        galleStayPlan.innerHTML = `<ul>${(detail.stayPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
        galleMealPlan.innerHTML = `<ul>${(detail.mealPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
    }

    highlights.innerHTML = '';
    detail.highlights.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        highlights.appendChild(li);
    });

    const initHeroSlider = (section) => {
        const slides = section.querySelectorAll('.kandy-slide');
        const indicators = section.querySelectorAll('.kandy-indicator');

        if (slides.length === 0 || indicators.length === 0) {
            return;
        }

        let currentSlide = 0;
        let slideInterval;

        const renderSlide = () => {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
            });

            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            renderSlide();
        };

        indicators.forEach((indicator) => {
            indicator.addEventListener('click', () => {
                const index = Number(indicator.getAttribute('data-index'));
                currentSlide = Number.isNaN(index) ? 0 : index;
                renderSlide();
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 5000);
            });
        });

        renderSlide();
        slideInterval = setInterval(nextSlide, 5000);
    };

    if (galleHeroSlider) {
        galleHeroSlider.classList.add('hidden');
    }
    if (anuradhapuraHeroSlider) {
        anuradhapuraHeroSlider.classList.add('hidden');
    }
    if (kandyHeroSlider) {
        kandyHeroSlider.classList.add('hidden');
    }

    if (day === '01' && galleHeroSlider) {
        galleHeroSlider.classList.remove('hidden');
        initHeroSlider(galleHeroSlider);
    } else if (day === '02' && anuradhapuraHeroSlider) {
        anuradhapuraHeroSlider.classList.remove('hidden');
        initHeroSlider(anuradhapuraHeroSlider);
    } else if (day === '04' && kandyHeroSlider) {
        kandyHeroSlider.classList.remove('hidden');
        initHeroSlider(kandyHeroSlider);
    }
});
