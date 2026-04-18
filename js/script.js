const splashStorageKey = 'ceylonToursSplashSeen';
const shouldShowSplash = (() => {
    try {
        return !sessionStorage.getItem(splashStorageKey);
    } catch (_error) {
        return true;
    }
})();

const initSplashScreen = () => {
    const splashScreen = document.querySelector('.splash-screen');

    if (!splashScreen) {
        return;
    }

    if (!shouldShowSplash) {
        splashScreen.remove();
        return;
    }

    try {
        sessionStorage.setItem(splashStorageKey, '1');
    } catch (_error) {
        // Ignore storage failures.
    }

    document.body.style.overflow = 'hidden';

    const hideSplash = () => {
        if (splashScreen.classList.contains('is-hidden')) {
            return;
        }

        splashScreen.classList.add('is-hidden');
        document.body.style.overflow = '';

        window.setTimeout(() => {
            try {
                if (splashScreen && splashScreen.parentNode) {
                    splashScreen.remove();
                }
            } catch (_error) {
                // Ignore removal errors.
            }
        }, 500);
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        window.setTimeout(hideSplash, 1400);
    } else {
        window.addEventListener('load', () => {
            window.setTimeout(hideSplash, 1400);
        }, { once: true });
    }

    // Failsafe: force remove splash after 3 seconds if still present
    window.setTimeout(() => {
        const splash = document.querySelector('.splash-screen');
        if (splash && splash.parentNode) {
            splash.remove();
            document.body.style.overflow = '';
        }
    }, 3000);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplashScreen, { once: true });
} else {
    initSplashScreen();
}

const initToursRouteMap = () => {
    const routeMapElement = document.getElementById('tourRouteMap');
    if (!routeMapElement || typeof L === 'undefined') {
        return;
    }

    const orsApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjcyOTcwM2E3ODJiMTRhMWNhYjJiZjhjN2Q4NjY2ODZhIiwiaCI6Im11cm11cjY0In0=';
    const routeStops = [
        { day: 'DAY 01', name: 'Galle', lat: 6.0535, lng: 80.2210 },
        { day: 'DAY 02', name: 'Udawalawe', lat: 6.4746, lng: 80.8883 },
        { day: 'DAY 03', name: 'Yala', lat: 6.3723, lng: 81.5185 },
        { day: 'DAY 04', name: 'Arugam Bay', lat: 6.8404, lng: 81.8368 },
        { day: 'DAY 05', name: 'Polonnaruwa', lat: 7.9403, lng: 81.0188 },
        { day: 'DAY 06', name: 'Habarana', lat: 8.0343, lng: 80.7505 },
        { day: 'DAY 07', name: 'Sigiriya & Dambulla', lat: 7.9160, lng: 80.7060 },
        { day: 'DAY 08', name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
        { day: 'DAY 09', name: 'Kandy', lat: 7.2906, lng: 80.6337 },
        { day: 'DAY 10', name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891 },
        { day: 'DAY 11', name: 'Ella', lat: 6.8667, lng: 81.0466 },
        { day: 'DAY 12', name: 'Ella Adventure', lat: 6.8667, lng: 81.0466 },
        { day: 'DAY 13', name: 'Haputale & Balangoda', lat: 6.6615, lng: 80.6933 },
        { day: 'DAY 14', name: 'Negombo', lat: 7.2083, lng: 79.8358 }
    ];

    const map = L.map(routeMapElement, {
        zoomControl: true,
        scrollWheelZoom: false
    }).setView([7.4, 80.7], 7);

    map.attributionControl.setPrefix(false);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const weatherCache = {};
    const weatherCodeMap = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    const getWeatherContent = async (stop) => {
        const cacheKey = `${stop.lat},${stop.lng}`;
        if (weatherCache[cacheKey]) {
            return weatherCache[cacheKey];
        }

        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${stop.lat}&longitude=${stop.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
            const response = await fetch(weatherUrl);

            if (!response.ok) {
                throw new Error(`Weather request failed with ${response.status}`);
            }

            const data = await response.json();
            const current = data && data.current;

            if (!current) {
                throw new Error('No current weather payload');
            }

            const weatherDescription = weatherCodeMap[current.weather_code] || 'Unknown conditions';
            const weatherMarkup = [
                `<strong>${stop.day}</strong><br>${stop.name}`,
                '<br><br><strong>Weather now</strong>',
                `<br>${weatherDescription}`,
                `<br>Temperature: ${Math.round(current.temperature_2m)}°C`,
                `<br>Feels like: ${Math.round(current.apparent_temperature)}°C`,
                `<br>Humidity: ${current.relative_humidity_2m}%`,
                `<br>Wind: ${Math.round(current.wind_speed_10m)} km/h`
            ].join('');

            weatherCache[cacheKey] = weatherMarkup;
            return weatherMarkup;
        } catch (_error) {
            return `<strong>${stop.day}</strong><br>${stop.name}<br><br><strong>Weather now</strong><br>Weather unavailable right now.`;
        }
    };

    const bounds = L.latLngBounds(routeStops.map((stop) => [stop.lat, stop.lng]));
    map.fitBounds(bounds.pad(0.12));

    routeStops.forEach((stop, index) => {
        const marker = L.marker([stop.lat, stop.lng], {
            icon: L.divIcon({
                className: 'tour-route-stop-marker',
                html: `${index + 1}`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -10]
            })
        }).addTo(map);

        marker.bindPopup(`<div class="tour-route-popup"><strong>${stop.day}</strong><br>${stop.name}<br><br><strong>Weather now</strong><br>Loading...</div>`);

        marker.on('popupopen', async () => {
            const weatherMarkup = await getWeatherContent(stop);
            marker.setPopupContent(`<div class="tour-route-popup">${weatherMarkup}</div>`);
            marker.getPopup().update();
        });
    });

    const fallbackPolyline = L.polyline(routeStops.map((stop) => [stop.lat, stop.lng]), {
        color: '#0f4e92',
        weight: 3,
        opacity: 0.55,
        dashArray: '7 7',
        lineJoin: 'round'
    });

    const drawRoute = async () => {
        const routingStops = routeStops.filter((stop, index, stops) => {
            if (index === 0) {
                return true;
            }

            const previousStop = stops[index - 1];
            return stop.lat !== previousStop.lat || stop.lng !== previousStop.lng;
        });

        const coordinates = routingStops.map((stop) => [stop.lng, stop.lat]);
        const drawGeoJsonRoute = (geoJson) => {
            const routeLayer = L.geoJSON(geoJson, {
                style: {
                    color: '#087fd8',
                    weight: 5,
                    opacity: 0.85
                }
            }).addTo(map);

            const routeBounds = routeLayer.getBounds();
            if (routeBounds.isValid()) {
                map.fitBounds(routeBounds.pad(0.1));
            }
        };

        try {
            const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': orsApiKey
                },
                body: JSON.stringify({
                    coordinates
                })
            });

            if (!response.ok) {
                throw new Error(`OpenRouteService request failed with ${response.status}`);
            }

            const geoJson = await response.json();
            drawGeoJsonRoute(geoJson);
            return;
        } catch (_error) {
            // Try a second road-routing provider before falling back to straight segments.
        }

        try {
            const osrmCoordinates = coordinates.map((point) => `${point[0]},${point[1]}`).join(';');
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmCoordinates}?overview=full&geometries=geojson`;
            const response = await fetch(osrmUrl);

            if (!response.ok) {
                throw new Error(`OSRM request failed with ${response.status}`);
            }

            const osrmData = await response.json();
            const routeGeometry = osrmData && osrmData.routes && osrmData.routes[0] && osrmData.routes[0].geometry;

            if (!routeGeometry || !routeGeometry.coordinates || routeGeometry.coordinates.length === 0) {
                throw new Error('OSRM returned no route geometry');
            }

            drawGeoJsonRoute({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: routeGeometry
                    }
                ]
            });
        } catch (_error) {
            fallbackPolyline.addTo(map);
        }
    };

    drawRoute();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToursRouteMap, { once: true });
} else {
    initToursRouteMap();
}

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

    const showHeroVideo = () => {
        heroVideo.classList.add('is-ready');
    };

    heroVideo.addEventListener('loadeddata', showHeroVideo, { once: true });
    heroVideo.addEventListener('canplay', showHeroVideo, { once: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tuneHeroVideo);
    } else {
        tuneHeroVideo();
    }

    if (heroVideo.readyState >= 2) {
        showHeroVideo();
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

    const syncAccordionHeights = () => {
        accordions.forEach((acc) => {
            const panel = acc.nextElementSibling;
            if (!panel) return;

            if (acc.classList.contains('active')) {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                panel.style.maxHeight = null;
            }
        });
    };

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

    syncAccordionHeights();
    window.addEventListener('resize', syncAccordionHeights);
});

const tripDetailsData = {
    '01': {
        title: 'Day 1 & Day 2 - Galle Stay (2 Nights)',
        description: 'Spend two relaxing nights in the coastal city of Galle, staying in a luxury 5-star villa with a calm and comfortable atmosphere.',
        overview: 'This short stay in Galle offers a perfect mix of beach time, nature, and local experiences in a relaxing coastal setting. You stay two nights in a luxury 5-star villa, with breakfast served at the villa each day and lunch and dinner enjoyed at selected local restaurants.',
        quickFacts: ['2 Nights in Galle', 'Luxury 5-Star Villa', 'Beach + Nature + Local Experiences', 'Breakfast at Villa', 'Lunch & Dinner at Selected Local Restaurants'],
        dayPlans: [
            {
                title: 'Day 1 | Galle Fort, Beach Relaxation, and Peace Pagoda',
                items: [
                    'Explore beautiful Galle Fort, known for charming streets, sea views, and lively surroundings.',
                    'Enjoy time at Unawatuna Beach or Jungle Beach to relax, swim, or try snorkeling in clear waters.',
                    'Visit the peaceful Japanese Peace Pagoda, a perfect place for quiet moments and scenic coastal views.',
                    'Return to your luxury villa for a calm and comfortable overnight stay.'
                ]
            },
            {
                title: 'Day 2 | Turtle Hatchery, Koggala Lake, and Stick Fishing',
                items: [
                    'Start with breakfast at the villa before visiting the Habaraduwa Turtle Hatchery to see and learn about sea turtles.',
                    'Take a relaxing boat ride on Koggala Lake, surrounded by mangroves and small islands.',
                    'See traditional Sri Lankan stick fishing, a unique and interesting local activity.',
                    'Enjoy lunch and dinner at selected local restaurants to experience authentic coastal flavors.'
                ]
            }
        ],
        stayPlan: [
            '2 nights in a luxury 5-star villa in Galle',
            'Calm and comfortable atmosphere with quality service',
            'Great for couples, families, and private small groups'
        ],
        mealPlan: [
            'Breakfast: served at the villa each day',
            'Lunch: at selected local restaurants',
            'Dinner: at selected local restaurants'
        ],
        highlights: ['Galle Fort', 'Unawatuna Beach', 'Jungle Beach', 'Japanese Peace Pagoda', 'Habaraduwa Turtle Hatchery', 'Koggala Lake', 'Traditional Stick Fishing'],
        photoText: 'Temporary placeholder: upload Day 1 Galle photos later.',
        videoText: 'Temporary placeholder: upload Day 1 Galle videos later.'
    },
    '02': {
        title: 'Day 2 - Udawalawe (1 Night)',
        description: 'Travel to Udawalawe for an exciting wildlife experience and a peaceful one-night stay close to nature in a comfortable villa near the national park.',
        overview: 'Start your day early with a morning safari at Udawalawe National Park, one of the best places in Sri Lanka to see wild elephants in their natural habitat. The park is also home to buffalo, deer, crocodiles, and many bird species, offering a true safari adventure. After the safari, return to your villa near the park for a relaxing breakfast and lunch surrounded by nature, then enjoy a calm afternoon at leisure before dinner at a selected local restaurant.',
        quickFacts: ['1 Night in Udawalawe', 'Morning Safari Adventure', 'Comfortable Villa Stay Near the Park', 'Wildlife: Elephants, Deer, Buffalo, Birds', 'Breakfast & Lunch at Villa | Dinner Out'],
        dayPlans: [
            {
                title: 'Day 2 | Safari, Nature, and Relaxed Evening',
                items: [
                    'Leave early for a morning safari in Udawalawe National Park to see wild elephants and other wildlife in natural surroundings.',
                    'After safari, return to the villa and enjoy a peaceful breakfast and lunch close to nature.',
                    'Spend the afternoon at leisure in the calm environment near the park.',
                    'In the evening, head out for dinner at a selected local restaurant.'
                ]
            }
        ],
        stayPlan: [
            '1 night in a comfortable villa near Udawalawe National Park',
            'Peaceful nature stay ideal for safari timing and relaxation'
        ],
        mealPlan: [
            'Breakfast: at the villa',
            'Lunch: at the villa',
            'Dinner: at a selected local restaurant'
        ],
        highlights: ['Udawalawe National Park', 'Morning Safari', 'Wild Elephants', 'Buffalo, Deer, Crocodiles, and Birds', 'Calm Villa Stay in Nature'],
        photoText: 'Temporary placeholder: upload Day 2 Udawalawe photos later.',
        videoText: 'Temporary placeholder: upload Day 2 Udawalawe videos later.'
    },
    '03': {
        title: 'Day 3 - Yala (1 Night)',
        description: 'Continue your journey to Yala for an exciting wildlife experience, with one night in an eco-friendly villa close to the park and surrounded by nature.',
        overview: 'Visit Yala National Park, one of the best places in the world to spot leopards. Enjoy a thrilling safari where you may see leopards, elephants, crocodiles, and a wide variety of birds in their natural environment. After the safari, relax at your eco-stay near the park, enjoying the peaceful atmosphere and natural surroundings.',
        quickFacts: ['1 Night in Yala', 'Yala National Park Safari', 'Leopard, Elephant, Crocodile & Bird Sightings', 'Eco-Friendly Villa Near the Park', 'All Meals at the Villa'],
        dayPlans: [
            {
                title: 'Day 3 | Yala Safari and Eco-Stay',
                items: [
                    'Continue to Yala for an exciting wildlife-focused day and overnight nature stay.',
                    'Explore Yala National Park on safari, one of the best places in the world to spot leopards.',
                    'Look for elephants, crocodiles, and a wide variety of birds in their natural habitat.',
                    'After safari, return to your eco-friendly villa near the park and unwind in peaceful surroundings.'
                ]
            }
        ],
        stayPlan: [
            '1 night in an eco-friendly villa near Yala National Park',
            'Nature-focused stay with a calm and comfortable atmosphere'
        ],
        mealPlan: [
            'Breakfast: at the villa',
            'Lunch: at the villa',
            'Dinner: at the villa'
        ],
        highlights: ['Yala National Park', 'Leopard Spotting Safari', 'Elephants and Crocodiles', 'Rich Birdlife', 'Eco-Friendly Villa Stay'],
        photoText: 'Temporary placeholder: upload Day 3 Yala photos later.',
        videoText: 'Temporary placeholder: upload Day 3 Yala videos later.'
    },
    '04': {
        title: 'Day 4 - Arugam Bay (1 Night)',
        description: 'Travel to Arugam Bay, a famous coastal destination known for its relaxed vibe and great surfing spots, with an overnight stay in comfortable beachside cabanas.',
        overview: 'Spend your day experiencing the best of Arugam Bay, with a strong focus on surfing. Whether you are a beginner or experienced, the waves here offer an exciting and fun experience. You will also enjoy a peaceful lagoon experience where you can explore calm waters, spot birds, and take in the natural beauty of the surroundings.',
        quickFacts: ['1 Night in Arugam Bay', 'Beachside Cabanas', 'Surfing for All Levels', 'Peaceful Lagoon Experience', 'Meals at Selected 5-Star Rated Hotels'],
        dayPlans: [
            {
                title: 'Day 4 | Surf, Lagoon, and Coastal Relaxation',
                items: [
                    'Travel to Arugam Bay and settle into your beachside cabana stay.',
                    'Enjoy surfing at Arugam Bay, with waves suitable for both beginners and experienced surfers.',
                    'Take a peaceful lagoon experience through calm waters with opportunities for bird watching.',
                    'Relax in the tropical coastal atmosphere before your overnight stay.'
                ]
            }
        ],
        stayPlan: [
            '1 night in comfortable beachside cabanas in Arugam Bay',
            'Relaxed coastal stay with easy access to the beach and surf points'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Arugam Bay', 'Surfing Experience', 'Lagoon and Birdlife', 'Beachside Cabana Stay', 'Tropical East Coast Atmosphere'],
        photoText: 'Temporary placeholder: upload Day 4 Arugam Bay photos later.',
        videoText: 'Temporary placeholder: upload Day 4 Arugam Bay videos later.'
    },
    '05': {
        title: 'Day 6 - Polonnaruwa (1 Night)',
        description: 'Travel to the historic city of Polonnaruwa, known for rich cultural heritage and ancient religious landmarks, with an overnight stay and evening wildlife experience.',
        overview: 'Visit sacred Polonnaruwa Vatadage, continue to Gal Vihara with its impressive rock-carved Buddha statues, and enjoy views of Parakrama Samudra, a vast ancient reservoir showcasing advanced early Sri Lankan engineering. In the evening, experience wildlife at Minneriya National Park or Kaudulla National Park, where large elephant gatherings are often seen.',
        quickFacts: ['1 Night in Polonnaruwa', 'Polonnaruwa Vatadage', 'Gal Vihara', 'Parakrama Samudra', 'Minneriya or Kaudulla Wildlife Safari', 'Meals at Selected 5-Star Rated Hotels'],
        dayPlans: [
            {
                title: 'Day 6 | Heritage Monuments and Wildlife Safari',
                items: [
                    'Travel to Polonnaruwa and begin with the sacred Vatadage, a beautifully preserved circular monument.',
                    'Continue to Gal Vihara to see the famous rock-carved Buddha statues.',
                    'Visit Parakrama Samudra and enjoy the scale of this historic ancient reservoir.',
                    'In the evening, take a wildlife safari in Minneriya or Kaudulla National Park for possible elephant gatherings and other wildlife sightings.'
                ]
            }
        ],
        stayPlan: [
            '1 night stay in the Polonnaruwa area with convenient access to heritage sites',
            'Comfortable overnight base before continuing the journey'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Polonnaruwa Vatadage', 'Gal Vihara', 'Parakrama Samudra', 'Minneriya National Park', 'Kaudulla National Park', 'Elephant Gatherings'],
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
    const udawalaweTourDetails = document.getElementById('udawalaweTourDetails');
    const yalaTourDetails = document.getElementById('yalaTourDetails');
    const polonnaruwaTourDetails = document.getElementById('polonnaruwaTourDetails');
    const arugamBayTourDetails = document.getElementById('arugamBayTourDetails');
    const galleTourOverview = document.getElementById('galleTourOverview');
    const galleQuickFacts = document.getElementById('galleQuickFacts');
    const galleDayPlans = document.querySelectorAll('[data-galle-day-plan]');
    const galleStayPlan = document.getElementById('galleStayPlan');
    const galleMealPlan = document.getElementById('galleMealPlan');
    const udawalaweTourOverview = document.getElementById('udawalaweTourOverview');
    const udawalaweQuickFacts = document.getElementById('udawalaweQuickFacts');
    const udawalaweDayPlan = document.getElementById('udawalaweDayPlan');
    const udawalaweStayPlan = document.getElementById('udawalaweStayPlan');
    const udawalaweMealPlan = document.getElementById('udawalaweMealPlan');
    const yalaTourOverview = document.getElementById('yalaTourOverview');
    const yalaQuickFacts = document.getElementById('yalaQuickFacts');
    const yalaDayPlan = document.getElementById('yalaDayPlan');
    const yalaStayPlan = document.getElementById('yalaStayPlan');
    const yalaMealPlan = document.getElementById('yalaMealPlan');
    const polonnaruwaTourOverview = document.getElementById('polonnaruwaTourOverview');
    const polonnaruwaQuickFacts = document.getElementById('polonnaruwaQuickFacts');
    const polonnaruwaDayPlan = document.getElementById('polonnaruwaDayPlan');
    const polonnaruwaStayPlan = document.getElementById('polonnaruwaStayPlan');
    const polonnaruwaMealPlan = document.getElementById('polonnaruwaMealPlan');
    const arugamBayTourOverview = document.getElementById('arugamBayTourOverview');
    const arugamBayQuickFacts = document.getElementById('arugamBayQuickFacts');
    const arugamBayDayPlan = document.getElementById('arugamBayDayPlan');
    const arugamBayStayPlan = document.getElementById('arugamBayStayPlan');
    const arugamBayMealPlan = document.getElementById('arugamBayMealPlan');
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

    if (genericTripDetails && galleTourDetails && udawalaweTourDetails && yalaTourDetails && polonnaruwaTourDetails && arugamBayTourDetails) {
        if (day === '01') {
            genericTripDetails.classList.add('hidden');
            galleTourDetails.classList.remove('hidden');
            udawalaweTourDetails.classList.add('hidden');
            yalaTourDetails.classList.add('hidden');
            polonnaruwaTourDetails.classList.add('hidden');
            arugamBayTourDetails.classList.add('hidden');
        } else if (day === '02') {
            genericTripDetails.classList.add('hidden');
            galleTourDetails.classList.add('hidden');
            udawalaweTourDetails.classList.remove('hidden');
            yalaTourDetails.classList.add('hidden');
            polonnaruwaTourDetails.classList.add('hidden');
            arugamBayTourDetails.classList.add('hidden');
        } else if (day === '03') {
            genericTripDetails.classList.add('hidden');
            galleTourDetails.classList.add('hidden');
            udawalaweTourDetails.classList.add('hidden');
            yalaTourDetails.classList.remove('hidden');
            polonnaruwaTourDetails.classList.add('hidden');
            arugamBayTourDetails.classList.add('hidden');
        } else if (day === '05') {
            genericTripDetails.classList.add('hidden');
            galleTourDetails.classList.add('hidden');
            udawalaweTourDetails.classList.add('hidden');
            yalaTourDetails.classList.add('hidden');
            polonnaruwaTourDetails.classList.remove('hidden');
            arugamBayTourDetails.classList.add('hidden');
        } else if (day === '04') {
            genericTripDetails.classList.add('hidden');
            galleTourDetails.classList.add('hidden');
            udawalaweTourDetails.classList.add('hidden');
            yalaTourDetails.classList.add('hidden');
            polonnaruwaTourDetails.classList.add('hidden');
            arugamBayTourDetails.classList.remove('hidden');
        } else {
            genericTripDetails.classList.remove('hidden');
            galleTourDetails.classList.add('hidden');
            udawalaweTourDetails.classList.add('hidden');
            yalaTourDetails.classList.add('hidden');
            polonnaruwaTourDetails.classList.add('hidden');
            arugamBayTourDetails.classList.add('hidden');
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

    if (day === '02' && udawalaweTourOverview && udawalaweQuickFacts && udawalaweDayPlan && udawalaweStayPlan && udawalaweMealPlan) {
        udawalaweTourOverview.textContent = detail.overview || detail.description;

        udawalaweQuickFacts.innerHTML = '';
        (detail.quickFacts || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            udawalaweQuickFacts.appendChild(li);
        });

        const firstPlan = (detail.dayPlans && detail.dayPlans[0]) || null;
        if (firstPlan) {
            udawalaweDayPlan.innerHTML = `
                <h3>${firstPlan.title}</h3>
                <ul>${firstPlan.items.map((item) => `<li>${item}</li>`).join('')}</ul>
            `;
        } else {
            udawalaweDayPlan.innerHTML = '';
        }

        udawalaweStayPlan.innerHTML = `<ul>${(detail.stayPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
        udawalaweMealPlan.innerHTML = `<ul>${(detail.mealPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
    }

    if (day === '03' && yalaTourOverview && yalaQuickFacts && yalaDayPlan && yalaStayPlan && yalaMealPlan) {
        yalaTourOverview.textContent = detail.overview || detail.description;

        yalaQuickFacts.innerHTML = '';
        (detail.quickFacts || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            yalaQuickFacts.appendChild(li);
        });

        const firstPlan = (detail.dayPlans && detail.dayPlans[0]) || null;
        if (firstPlan) {
            yalaDayPlan.innerHTML = `
                <h3>${firstPlan.title}</h3>
                <ul>${firstPlan.items.map((item) => `<li>${item}</li>`).join('')}</ul>
            `;
        } else {
            yalaDayPlan.innerHTML = '';
        }

        yalaStayPlan.innerHTML = `<ul>${(detail.stayPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
        yalaMealPlan.innerHTML = `<ul>${(detail.mealPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
    }

    if (day === '04' && arugamBayTourOverview && arugamBayQuickFacts && arugamBayDayPlan && arugamBayStayPlan && arugamBayMealPlan) {
        arugamBayTourOverview.textContent = detail.overview || detail.description;

        arugamBayQuickFacts.innerHTML = '';
        (detail.quickFacts || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            arugamBayQuickFacts.appendChild(li);
        });

        const firstPlan = (detail.dayPlans && detail.dayPlans[0]) || null;
        if (firstPlan) {
            arugamBayDayPlan.innerHTML = `
                <h3>${firstPlan.title}</h3>
                <ul>${firstPlan.items.map((item) => `<li>${item}</li>`).join('')}</ul>
            `;
        } else {
            arugamBayDayPlan.innerHTML = '';
        }

        arugamBayStayPlan.innerHTML = `<ul>${(detail.stayPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
        arugamBayMealPlan.innerHTML = `<ul>${(detail.mealPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
    }

    if (day === '05' && polonnaruwaTourOverview && polonnaruwaQuickFacts && polonnaruwaDayPlan && polonnaruwaStayPlan && polonnaruwaMealPlan) {
        polonnaruwaTourOverview.textContent = detail.overview || detail.description;

        polonnaruwaQuickFacts.innerHTML = '';
        (detail.quickFacts || []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            polonnaruwaQuickFacts.appendChild(li);
        });

        const firstPlan = (detail.dayPlans && detail.dayPlans[0]) || null;
        if (firstPlan) {
            polonnaruwaDayPlan.innerHTML = `
                <h3>${firstPlan.title}</h3>
                <ul>${firstPlan.items.map((item) => `<li>${item}</li>`).join('')}</ul>
            `;
        } else {
            polonnaruwaDayPlan.innerHTML = '';
        }

        polonnaruwaStayPlan.innerHTML = `<ul>${(detail.stayPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
        polonnaruwaMealPlan.innerHTML = `<ul>${(detail.mealPlan || []).map((item) => `<li>${item}</li>`).join('')}</ul>`;
    }

    if (day !== '01' && day !== '02' && day !== '03' && day !== '04' && day !== '05' && overview && quickFacts && dayPlans && stayPlan && mealPlan) {
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
