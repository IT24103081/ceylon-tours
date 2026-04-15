// Newsletter Form Handling
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for subscribing! Check your email for confirmation.');
        this.reset();
    });
}

// Inquiry Form Handling (mailto fallback for static hosting)
const inquiryForm = document.getElementById('inquiryForm');
if (inquiryForm) {
    inquiryForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const data = new FormData(inquiryForm);
        const firstName = (data.get('firstName') || '').toString().trim();
        const lastName = (data.get('lastName') || '').toString().trim();
        const email = (data.get('email') || '').toString().trim();
        const phone = (data.get('phone') || '').toString().trim();
        const travelDate = (data.get('travelDate') || '').toString().trim();
        const adults = (data.get('adults') || '').toString().trim();
        const children = (data.get('children') || '').toString().trim();
        const message = (data.get('message') || '').toString().trim();

        const subject = encodeURIComponent('New Tour Inquiry - Golden Island Tours');
        const bodyLines = [
            'Full Name: ' + [firstName, lastName].filter(Boolean).join(' '),
            'Email: ' + email,
            'Phone / WhatsApp: ' + (phone || 'N/A'),
            'Expected Travel Date: ' + (travelDate || 'N/A'),
            'Adults: ' + (adults || 'N/A'),
            'Children: ' + (children || 'N/A'),
            '',
            'Trip Details:',
            message || 'N/A'
        ];

        const body = encodeURIComponent(bodyLines.join('\n'));
        window.location.href = 'mailto:contact@goldenislandtours.com?subject=' + subject + '&body=' + body;
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
const heroVideo = document.getElementById('heroVideo');
let currentSlideIndex = 0;
let slideInterval;

function initSlider() {
    if (slides.length === 0 || !nextBtn || !prevBtn || indicators.length === 0) return;
    
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
        if (indicators[idx]) {
            indicators[idx].classList.remove('active');
        }
        if (idx === currentSlideIndex) {
            slide.classList.add('active');
            if (indicators[idx]) {
                indicators[idx].classList.add('active');
            }
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

if (heroVideo) {
    const tuneHeroVideo = () => {
        heroVideo.muted = true;
        heroVideo.volume = 0;
        heroVideo.defaultPlaybackRate = 0.7;
        heroVideo.playbackRate = 0.7;
        const playPromise = heroVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tuneHeroVideo);
    } else {
        tuneHeroVideo();
    }
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
        title: 'Udawalawe Safari Stop',
        description: 'A wildlife-focused stop in Udawalawe with a morning safari and a relaxed night near the park.',
        overview: 'Stay one night near Udawalawe National Park with breakfast and lunch from the villa, then enjoy dinner out after your safari day.',
        quickFacts: ['1 Night Near Udawalawe Park', 'Morning Safari', 'Breakfast and Lunch at the Villa', 'Dinner Out'],
        dayPlans: [
            {
                title: 'Morning Safari',
                items: [
                    'Head out early for a morning safari in Udawalawe National Park.',
                    'Look for elephants and other wildlife in open grassland and reservoir views.'
                ]
            },
            {
                title: 'Eco Stay Near the Park',
                items: [
                    'Relax at a villa or eco stay close to the park after the safari.',
                    'Enjoy dinner out before settling in for the night.'
                ]
            }
        ],
        stayPlan: [
            '1 night in an eco stay or villa near Udawalawe National Park',
            'Comfortable base for the safari and early departure next day'
        ],
        mealPlan: [
            'Breakfast: from the villa',
            'Lunch: from the villa',
            'Dinner: out'
        ],
        highlights: ['Udawalawe National Park', 'Morning Safari', 'Elephant Viewing', 'Eco Stay Near Park'],
        photoText: 'Temporary placeholder: upload Day 2 Udawalawe photos later.',
        videoText: 'Temporary placeholder: upload Day 2 Udawalawe videos later.'
    },
    '03': {
        title: 'Yala Leopard Country',
        description: 'A scenic transfer to Yala with a strong focus on leopard sightings and an eco stay near the park.',
        overview: 'Spend one night near Yala National Park in an eco stay, with breakfast, lunch, and dinner from the villa near the park.',
        quickFacts: ['1 Night Near Yala Park', 'Leopard Focus', 'Eco Stay', 'All Meals from Villa'],
        dayPlans: [
            {
                title: 'Yala Safari Drive',
                items: [
                    'Set out for a safari in Yala National Park with a focus on leopards.',
                    'Enjoy birdlife, dry-zone forest, and open plains.'
                ]
            },
            {
                title: 'Eco Stay and Rest',
                items: [
                    'Return to an eco stay near the park for a relaxed evening.',
                    'Meals are served from the villa throughout the day.'
                ]
            }
        ],
        stayPlan: [
            '1 night in an eco stay near Yala National Park',
            'Ideal for an early start and a quiet wildlife-focused evening'
        ],
        mealPlan: [
            'Breakfast: from the villa',
            'Lunch: from the villa',
            'Dinner: from the villa'
        ],
        highlights: ['Yala National Park', 'Leopard Safari', 'Eco Stay', 'Birdlife and Dry-Zone Landscapes'],
        photoText: 'Temporary placeholder: upload Day 3 Yala photos later.',
        videoText: 'Temporary placeholder: upload Day 3 Yala videos later.'
    },
    '04': {
        title: 'Arugam Bay Surf & Lagoon',
        description: 'A beach and lagoon day in Arugam Bay centered on surfing, laid-back coastal vibes, and a cabana stay.',
        overview: 'Stay one night in cabanas with breakfast, lunch, and dinner from a 5-star rated hotel while you enjoy the surf and lagoon.',
        quickFacts: ['1 Night in Cabanas', 'Surfing Focus', 'Lagoon Experience', 'Meals from 5-Star Hotel'],
        dayPlans: [
            {
                title: 'Surf and Beach Time',
                items: [
                    'Spend the day around Arugam Bay with a focus on surfing and the beach.',
                    'Enjoy the relaxed east coast atmosphere and sunset.'
                ]
            },
            {
                title: 'Lagoon Experience and Cabana Stay',
                items: [
                    'Add a lagoon experience or boat outing where timing allows.',
                    'Sleep in cabanas for a true coastal escape.'
                ]
            }
        ],
        stayPlan: [
            '1 night in cabanas at Arugam Bay',
            'A relaxed east coast base with easy beach access'
        ],
        mealPlan: [
            'Breakfast: from the 5-star rated hotel',
            'Lunch: from the 5-star rated hotel',
            'Dinner: from the 5-star rated hotel'
        ],
        highlights: ['Arugam Bay', 'Surfing', 'Lagoon Experience', 'Cabana Stay'],
        photoText: 'Temporary placeholder: upload Day 4 Arugam Bay photos later.',
        videoText: 'Temporary placeholder: upload Day 4 Arugam Bay videos later.'
    },
    '05': {
        title: 'Polonnaruwa Heritage Loop',
        description: 'A day of religious and archaeological heritage around Polonnaruwa with nearby wildlife viewing options.',
        overview: 'Stay one night in a 5-star hotel while exploring ancient religious sites and the surrounding park and lake network.',
        quickFacts: ['1 Night in a 5-Star Hotel', 'Religious and Heritage Sites', 'Minneriya Option', 'Kaudulla Lake Option'],
        dayPlans: [
            {
                title: 'Ancient City Highlights',
                items: [
                    'Visit Vatadage and Gal Viharaya for the classic Polonnaruwa heritage circuit.',
                    'See Parakrama Samudra and the ancient royal city landscape.'
                ]
            },
            {
                title: 'Wildlife Add-On',
                items: [
                    'Add Minneriya National Park or Kaudulla Lake depending on timing and wildlife movement.',
                    'Return to a comfortable 5-star hotel for the night.'
                ]
            }
        ],
        stayPlan: [
            '1 night in a 5-star hotel in the Polonnaruwa area',
            'A comfortable base for heritage sightseeing and wildlife viewing'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Vatadage', 'Gal Viharaya', 'Parakrama Samudra', 'Minneriya National Park', 'Kaudulla Lake'],
        photoText: 'Temporary placeholder: upload Day 5 Polonnaruwa photos later.',
        videoText: 'Temporary placeholder: upload Day 5 Polonnaruwa videos later.'
    },
    '06': {
        title: 'Habarana Village Stay',
        description: 'A relaxed stop in Habarana with a village-style experience and a comfortable hotel base.',
        overview: 'Enjoy a 5-star hotel stay in the Habarana area with breakfast, lunch, and dinner all taken at the hotel.',
        quickFacts: ['1 Night in Habarana', 'Village Experience', '5-Star Hotel', 'All Meals at Hotel'],
        dayPlans: [
            {
                title: 'Habarana Village Experience',
                items: [
                    'Spend time in Habarana village and enjoy the local rural atmosphere.',
                    'Use the area as a calm base before Sigiriya and Dambulla.'
                ]
            }
        ],
        stayPlan: [
            '1 night in a 5-star hotel in Habarana',
            'Comfortable central base for the cultural triangle'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Habarana Village', 'Rural Experience', '5-Star Hotel Stay', 'Central Cultural Triangle Base'],
        photoText: 'Temporary placeholder: upload Day 6 Habarana photos later.',
        videoText: 'Temporary placeholder: upload Day 6 Habarana videos later.'
    },
    '07': {
        title: 'Sigiriya & Dambulla',
        description: 'The classic cultural triangle day with Sigiriya Rock Fortress and Dambulla Cave Temple.',
        overview: 'Continue the Habarana-area stay with breakfast, lunch, and dinner from the hotel while visiting the region’s landmark heritage sites.',
        quickFacts: ['Sigiriya Rock Fortress', 'Dambulla Cave Temple', 'Second Night in Habarana Area', 'All Meals at Hotel'],
        dayPlans: [
            {
                title: 'Sigiriya Rock Fortress',
                items: [
                    'Visit Sigiriya Rock Fortress for the main climb and panorama views.',
                    'Take time for photos and the surrounding gardens.'
                ]
            },
            {
                title: 'Dambulla Cave Temple',
                items: [
                    'Continue to Dambulla Cave Temple for painted caves and religious history.',
                    'Return to the hotel for a relaxed evening meal.'
                ]
            }
        ],
        stayPlan: [
            'Second night in the Habarana area at a 5-star hotel',
            'Ideal for a smooth cultural triangle route'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Sigiriya Rock Fortress', 'Dambulla Cave Temple', 'Habarana Area', 'Cultural Triangle'],
        photoText: 'Temporary placeholder: upload Day 7 Sigiriya photos later.',
        videoText: 'Temporary placeholder: upload Day 7 Sigiriya videos later.'
    },
    '08': {
        title: 'Anuradhapura Sacred City',
        description: 'A full heritage day in Anuradhapura focused on sacred monuments and ancient city landmarks.',
        overview: 'Stay one night in a 5-star hotel while exploring the most important religious and archaeological places in the ancient capital.',
        quickFacts: ['1 Night in Anuradhapura', 'Sacred City Focus', '5-Star Hotel', 'Meals at Hotel'],
        dayPlans: [
            {
                title: 'Sacred Monuments',
                items: [
                    'See Ruwanwelisaya and Jaya Sri Maha Bodhi, the key pilgrimage stops in the city.',
                    'Continue to Thuparamaya and Jethawanaramaya.'
                ]
            },
            {
                title: 'Ancient City Circuit',
                items: [
                    'Visit Abhayagiriya and Tissa Lake to round out the heritage circuit.',
                    'Return to the hotel for the night.'
                ]
            }
        ],
        stayPlan: [
            '1 night in a 5-star hotel in Anuradhapura',
            'Comfortable stay for a full sacred city program'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Ruwanwelisaya', 'Jaya Sri Maha Bodhi', 'Thuparamaya', 'Jethawanaramaya', 'Abhayagiriya', 'Tissa Lake'],
        photoText: 'Temporary placeholder: upload Day 8 Anuradhapura photos later.',
        videoText: 'Temporary placeholder: upload Day 8 Anuradhapura videos later.'
    },
    '09': {
        title: 'Kandy Cultural Capital',
        description: 'A cultural day in Kandy with the Temple of the Tooth and Peradeniya Botanic Gardens.',
        overview: 'Stay one night in a 5-star hotel in Kandy with breakfast and lunch from the hotel while you explore the city’s best-known landmarks.',
        quickFacts: ['1 Night in Kandy', 'Temple of the Tooth', 'Peradeniya Botanical Garden', 'Breakfast and Lunch at Hotel'],
        dayPlans: [
            {
                title: 'Temple of the Tooth',
                items: [
                    'Visit the Temple of the Tooth, Kandy’s most important religious site.',
                    'Take in the atmosphere around the lake and city center.'
                ]
            },
            {
                title: 'Peradeniya Botanical Garden',
                items: [
                    'Continue to Royal Botanic Gardens Peradeniya for a relaxed scenic walk.',
                    'Spend the evening in Kandy before dinner and overnight stay.'
                ]
            }
        ],
        stayPlan: [
            '1 night in a 5-star hotel in Kandy',
            'Central base for temple and garden sightseeing'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: out'
        ],
        highlights: ['Temple of the Tooth', 'Royal Botanic Gardens Peradeniya', 'Kandy Lake', 'Cultural City Views'],
        photoText: 'Temporary placeholder: upload Day 9 Kandy photos later.',
        videoText: 'Temporary placeholder: upload Day 9 Kandy videos later.'
    },
    '10': {
        title: 'Nuwara Eliya Highlands',
        description: 'A cool-climate highland day with tea-country scenery, parks, and open landscapes.',
        overview: 'Enjoy a 5-star hotel stay in Nuwara Eliya with breakfast, lunch, and dinner from the hotel while you explore the highlands.',
        quickFacts: ['1 Night in Nuwara Eliya', 'Horton Plains', 'Gregory Park', 'Tea Country Stay'],
        dayPlans: [
            {
                title: 'Horton Plains National Park',
                items: [
                    'Explore Horton Plains National Park for open highland scenery and nature walks.',
                    'Continue to Gregory Park and Sandathenna for a softer paced afternoon.'
                ]
            }
        ],
        stayPlan: [
            '1 night in a 5-star hotel in Nuwara Eliya',
            'Cool-climate stay in Sri Lanka’s tea country'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Horton Plains National Park', 'Gregory Park', 'Sandathenna', 'Tea-Country Views'],
        photoText: 'Temporary placeholder: upload Day 10 Nuwara Eliya photos later.',
        videoText: 'Temporary placeholder: upload Day 10 Nuwara Eliya videos later.'
    },
    '11': {
        title: 'Ella Scenic Arrival',
        description: 'The first Ella day with the bridge, peak views, and the classic hill-country scenery.',
        overview: 'Stay in a 5-star hotel or boutique property in Ella with all meals at the property and a day focused on the main viewpoints.',
        quickFacts: ['1 Night in Ella', 'Nine Arch Bridge', 'Little Adam’s Peak', 'All Meals at Hotel'],
        dayPlans: [
            {
                title: 'Classic Ella Sights',
                items: [
                    'Visit Nine Arch Bridge and Little Adam’s Peak for the signature Ella views.',
                    'Continue to Ella Rock and Ravana Cave where timing allows.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Ella at a 5-star hotel or boutique stay',
            'A scenic hill-country base for the second Ella day'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Nine Arch Bridge', "Little Adam's Peak", 'Ella Rock', 'Ravana Cave'],
        photoText: 'Temporary placeholder: upload Day 11 Ella photos later.',
        videoText: 'Temporary placeholder: upload Day 11 Ella videos later.'
    },
    '12': {
        title: 'Ella Adventure Day',
        description: 'A second Ella day built around waterfalls, adventure activities, and local temple stops.',
        overview: 'Continue your Ella stay with more adventure stops, all meals from the hotel, and a stronger focus on the southern side of the hill country.',
        quickFacts: ['Second Ella Day', 'Flying Ravana Adventure Park', 'Ella Waterfall', 'All Meals at Hotel'],
        dayPlans: [
            {
                title: 'Adventure and Waterfalls',
                items: [
                    'Visit Ella Waterfall, Kubalwela Temple, and Flying Ravana Adventure Park.',
                    'Use the afternoon for relaxed viewpoints and village time.'
                ]
            }
        ],
        stayPlan: [
            'Second night in Ella at a 5-star hotel or boutique stay',
            'Perfect for a two-day hill-country stop'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Ella Waterfall', 'Kubalwela Temple', 'Flying Ravana Adventure Park', 'Hill-Country Views'],
        photoText: 'Temporary placeholder: upload Day 12 Ella photos later.',
        videoText: 'Temporary placeholder: upload Day 12 Ella videos later.'
    },
    '13': {
        title: 'Haputale & Balangoda Scenic Views',
        description: 'A scenic transfer day through the hill country with viewpoints and a night in Balangoda.',
        overview: 'Stay one night in Balangoda with breakfast, lunch, and dinner from the hotel while you enjoy the hill-country scenery.',
        quickFacts: ['1 Night in Balangoda', 'Haputale Views', 'Scenic Hill Country Drive', 'Meals at Hotel'],
        dayPlans: [
            {
                title: 'Scenic Viewpoints',
                items: [
                    'Travel through Haputale and stop for scenic viewpoints along the route.',
                    'Continue to Balangoda for the overnight stay.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Balangoda at a 5-star hotel',
            'A quiet stop before the final transfer to Negombo'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: from the hotel',
            'Dinner: from the hotel'
        ],
        highlights: ['Haputale', 'Balangoda', 'Scenic Viewpoints', 'Hill-Country Drive'],
        photoText: 'Temporary placeholder: upload Day 13 Balangoda photos later.',
        videoText: 'Temporary placeholder: upload Day 13 Balangoda videos later.'
    },
    '14': {
        title: 'Negombo Departure',
        description: 'The final transfer to Negombo for departure and a relaxed end to the tour.',
        overview: 'Use this final day for transfer to Negombo and departure coordination, with breakfast from the hotel before checkout.',
        quickFacts: ['Final Transfer Day', 'Negombo', 'Airport Access', 'Breakfast at Hotel'],
        dayPlans: [
            {
                title: 'Transfer to Negombo',
                items: [
                    'Travel to Negombo for your final stop or airport transfer.',
                    'Wrap up the tour with a relaxed departure day.'
                ]
            }
        ],
        stayPlan: [
            'No overnight stay planned unless you choose an extra night in Negombo',
            'Best used as a departure or final transfer day'
        ],
        mealPlan: [
            'Breakfast: from the hotel',
            'Lunch: as per departure time',
            'Dinner: not included unless staying on'
        ],
        highlights: ['Negombo', 'Airport Transfer', 'Final Departure Day'],
        photoText: 'Temporary placeholder: upload Day 14 Negombo photos later.',
        videoText: 'Temporary placeholder: upload Day 14 Negombo videos later.'
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
    const overview = document.getElementById('tripOverview');
    const quickFacts = document.getElementById('tripQuickFacts');
    const dayPlans = document.getElementById('tripDayPlans');
    const stayPlan = document.getElementById('tripStayPlan');
    const mealPlan = document.getElementById('tripMealPlan');
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
    const udawalaweHeroSlider = document.getElementById('udawalaweHeroSlider');
    const yalaHeroSlider = document.getElementById('yalaHeroSlider');
    const polonnaruwaHeroSlider = document.getElementById('polonnaruwaHeroSlider');
    const habaranaHeroSlider = document.getElementById('habaranaHeroSlider');
    const sigiriyaDambullaHeroSlider = document.getElementById('sigiriyaDambullaHeroSlider');
    const kandyHeroSlider = document.getElementById('kandyHeroSlider');
    const arugamBayHeroSlider = document.getElementById('arugamBayHeroSlider');
    const ellaHeroSlider = document.getElementById('ellaHeroSlider');
    const ellaAdventureHeroSlider = document.getElementById('ellaAdventureHeroSlider');
    const haputaleBalangodaHeroSlider = document.getElementById('haputaleBalangodaHeroSlider');
    const negomboHeroSlider = document.getElementById('negomboHeroSlider');
    const nuwaraEliyaHeroSlider = document.getElementById('nuwaraEliyaHeroSlider');

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

    if (day !== '01' && overview && quickFacts && dayPlans && stayPlan && mealPlan) {
        overview.textContent = detail.overview || detail.description;

        quickFacts.innerHTML = '';
        (detail.quickFacts || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            quickFacts.appendChild(li);
        });

        dayPlans.innerHTML = '';
        (detail.dayPlans || []).forEach((plan) => {
            const planBlock = document.createElement('div');
            planBlock.className = 'trip-plan';

            const heading = document.createElement('h3');
            heading.textContent = plan.title;
            planBlock.appendChild(heading);

            const list = document.createElement('ul');
            plan.items.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            planBlock.appendChild(list);
            dayPlans.appendChild(planBlock);
        });

        stayPlan.innerHTML = `<ul>${(detail.stayPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
        mealPlan.innerHTML = `<ul>${(detail.mealPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
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
    if (udawalaweHeroSlider) {
        udawalaweHeroSlider.classList.add('hidden');
    }
    if (yalaHeroSlider) {
        yalaHeroSlider.classList.add('hidden');
    }
    if (polonnaruwaHeroSlider) {
        polonnaruwaHeroSlider.classList.add('hidden');
    }
    if (habaranaHeroSlider) {
        habaranaHeroSlider.classList.add('hidden');
    }
    if (sigiriyaDambullaHeroSlider) {
        sigiriyaDambullaHeroSlider.classList.add('hidden');
    }
    if (kandyHeroSlider) {
        kandyHeroSlider.classList.add('hidden');
    }
    if (arugamBayHeroSlider) {
        arugamBayHeroSlider.classList.add('hidden');
    }
    if (ellaHeroSlider) {
        ellaHeroSlider.classList.add('hidden');
    }
    if (ellaAdventureHeroSlider) {
        ellaAdventureHeroSlider.classList.add('hidden');
    }
    if (haputaleBalangodaHeroSlider) {
        haputaleBalangodaHeroSlider.classList.add('hidden');
    }
    if (negomboHeroSlider) {
        negomboHeroSlider.classList.add('hidden');
    }
    if (nuwaraEliyaHeroSlider) {
        nuwaraEliyaHeroSlider.classList.add('hidden');
    }

    if (day === '01' && galleHeroSlider) {
        galleHeroSlider.classList.remove('hidden');
        initHeroSlider(galleHeroSlider);
    } else if (day === '02' && udawalaweHeroSlider) {
        udawalaweHeroSlider.classList.remove('hidden');
        initHeroSlider(udawalaweHeroSlider);
    } else if (day === '03' && yalaHeroSlider) {
        yalaHeroSlider.classList.remove('hidden');
        initHeroSlider(yalaHeroSlider);
    } else if (day === '05' && polonnaruwaHeroSlider) {
        polonnaruwaHeroSlider.classList.remove('hidden');
        initHeroSlider(polonnaruwaHeroSlider);
    } else if (day === '06' && habaranaHeroSlider) {
        habaranaHeroSlider.classList.remove('hidden');
        initHeroSlider(habaranaHeroSlider);
    } else if (day === '07' && sigiriyaDambullaHeroSlider) {
        sigiriyaDambullaHeroSlider.classList.remove('hidden');
        initHeroSlider(sigiriyaDambullaHeroSlider);
    } else if (day === '08' && anuradhapuraHeroSlider) {
        anuradhapuraHeroSlider.classList.remove('hidden');
        initHeroSlider(anuradhapuraHeroSlider);
    } else if (day === '09' && kandyHeroSlider) {
        kandyHeroSlider.classList.remove('hidden');
        initHeroSlider(kandyHeroSlider);
    } else if (day === '10' && nuwaraEliyaHeroSlider) {
        nuwaraEliyaHeroSlider.classList.remove('hidden');
        initHeroSlider(nuwaraEliyaHeroSlider);
    } else if (day === '04' && arugamBayHeroSlider) {
        arugamBayHeroSlider.classList.remove('hidden');
        initHeroSlider(arugamBayHeroSlider);
    } else if (day === '11' && ellaHeroSlider) {
        ellaHeroSlider.classList.remove('hidden');
        initHeroSlider(ellaHeroSlider);
    } else if (day === '12' && ellaAdventureHeroSlider) {
        ellaAdventureHeroSlider.classList.remove('hidden');
        initHeroSlider(ellaAdventureHeroSlider);
    } else if (day === '13' && haputaleBalangodaHeroSlider) {
        haputaleBalangodaHeroSlider.classList.remove('hidden');
        initHeroSlider(haputaleBalangodaHeroSlider);
    } else if (day === '14' && negomboHeroSlider) {
        negomboHeroSlider.classList.remove('hidden');
        initHeroSlider(negomboHeroSlider);
    }
});
