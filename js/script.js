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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
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

// Web3Forms AJAX handling to keep users on-site after submit
const initWeb3Forms = () => {
    const web3Forms = document.querySelectorAll(
        '#inquiryForm[action="https://api.web3forms.com/submit"], #contactForm[action="https://api.web3forms.com/submit"]'
    );

    if (web3Forms.length === 0) {
        return;
    }

    const setFormStatus = (form, isSuccess, message) => {
        let statusEl = form.querySelector('.form-submit-status');

        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.className = 'form-submit-status';
            statusEl.setAttribute('aria-live', 'polite');
            statusEl.style.marginTop = '1rem';
            statusEl.style.padding = '0.85rem 1rem';
            statusEl.style.borderRadius = '8px';
            statusEl.style.fontWeight = '600';
            statusEl.style.fontSize = '0.95rem';
            form.appendChild(statusEl);
        }

        statusEl.textContent = message;

        if (isSuccess) {
            statusEl.style.backgroundColor = '#e6f7ec';
            statusEl.style.border = '1px solid #1f9d55';
            statusEl.style.color = '#166534';
            return;
        }

        statusEl.style.backgroundColor = '#fde8e8';
        statusEl.style.border = '1px solid #e53e3e';
        statusEl.style.color = '#9b1c1c';
    };

    web3Forms.forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (form.id === 'inquiryForm') {
                const firstName = (form.querySelector('[name="firstName"]')?.value || '').trim();
                const lastName = (form.querySelector('[name="lastName"]')?.value || '').trim();
                const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
                const hiddenName = form.querySelector('[name="name"]');

                if (hiddenName) {
                    hiddenName.value = fullName || 'Inquiry Visitor';
                }
            }

            const submitButton = form.querySelector('button[type="submit"]');
            const previousText = submitButton ? submitButton.textContent : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'SENDING...';
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        Accept: 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error((data && data.message) || 'Form submission failed.');
                }

                setFormStatus(form, true, 'Thank you! Your message has been sent successfully.');
                form.reset();
            } catch (error) {
                setFormStatus(form, false, 'Submission failed. Please try again in a moment.');
                console.error('Web3Forms submission error:', error);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = previousText;
                }
            }
        });
    });
};

initWeb3Forms();

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
    const navLinks = document.querySelectorAll('.nav-link, .nav-dropdown-link');
    
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
        description: 'Travel to the historic city of Polonnaruwa, known for its rich cultural heritage and ancient religious sites. Stay overnight while exploring some of Sri Lanka\'s most important historical landmarks.',
        overview: 'Visit the sacred Polonnaruwa Vatadage, a beautifully preserved circular structure with religious significance. Continue to Gal Vihara, famous for its impressive rock-carved Buddha statues. You will also see Parakrama Samudra, a vast ancient reservoir that showcases the advanced engineering of early Sri Lankan civilization. In the evening, enjoy a wildlife experience at either Minneriya National Park or Kaudulla National Park, where you may witness large gatherings of elephants and other wildlife in their natural habitat.',
        quickFacts: ['1 Night in Polonnaruwa', 'Polonnaruwa Vatadage (Sacred Circular Structure)', 'Gal Vihara (Rock-Carved Buddha Statues)', 'Parakrama Samudra (Ancient Reservoir)', 'Minneriya or Kaudulla Wildlife Safari', 'Breakfast, Lunch & Dinner at Selected 5-Star Rated Hotels'],
        dayPlans: [
            {
                title: 'Day 6 | Polonnaruwa Heritage Sites and Wildlife Safari',
                items: [
                    'Travel to Polonnaruwa and visit the sacred Polonnaruwa Vatadage, a beautifully preserved circular structure with profound religious significance.',
                    'Continue to Gal Vihara to witness the impressive rock-carved Buddha statues carved into the natural rock face.',
                    'Visit Parakrama Samudra, a vast ancient reservoir that showcases the advanced engineering and hydraulic technology of early Sri Lankan civilization.',
                    'In the evening, take a wildlife safari in Minneriya or Kaudulla National Park where you may witness large gatherings of elephants and other wildlife in their natural habitat.'
                ]
            }
        ],
        stayPlan: [
            '1 night stay in the Polonnaruwa area with access to heritage sites',
            'Comfortable overnight base in a selected 5-star rated hotel'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Polonnaruwa Vatadage', 'Gal Vihara', 'Rock-Carved Buddha Statues', 'Parakrama Samudra', 'Minneriya National Park', 'Kaudulla National Park', 'Elephant Gatherings', 'Ancient Engineering'],
        photoText: 'Temporary placeholder: upload Day 5 Polonnaruwa photos later.',
        videoText: 'Temporary placeholder: upload Day 5 Polonnaruwa videos later.'
    },
    '06': {
        title: 'Habarana (1 Night)',
        description: 'Travel to the peaceful area of Habarana and enjoy a relaxing stay surrounded by nature, lakes, and village life.',
        overview: 'Spend one night in Habarana with a traditional village experience that includes local farming activities, interaction with villagers, a village walk, traditional cooking, and a relaxing boat ride on a quiet lake. Breakfast, lunch, and dinner are served at selected 5-star rated hotels.',
        quickFacts: ['1 Night in Habarana', 'Traditional Village Experience', 'Lake Boat Ride', 'Selected 5-Star Rated Hotel Meals'],
        dayPlans: [
            {
                title: 'Village Experience and Lake Time',
                items: [
                    'Take part in a traditional village walk and see local farming activities.',
                    'Interact with villagers and enjoy the simple rural lifestyle of Sri Lanka.',
                    'Enjoy a calm boat ride on a quiet lake before returning to the hotel.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Habarana at a selected 5-star rated hotel',
            'Relaxing nature-based stay with easy access to the cultural triangle'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Habarana Village', 'Lake Ride', 'Rural Life', '5-Star Hotel Meals'],
        galleryTitle: 'Day 6 Gallery | Habarana Village Life',
        galleryItems: [
            { src: 'assets/images/habarana/pexels-buddh-sharan-sahu-2109761-13436699.webp', alt: 'Calm lakeside views in Habarana', caption: 'Calm lakeside views around Habarana' },
            { src: 'assets/images/habarana/pexels-dana-cruz-364767400-14697225.webp', alt: 'Traditional village life in Habarana', caption: 'Traditional village life in Habarana' },
            { src: 'assets/images/habarana/pexels-inguaribile-viaggiatore-8806145-7015742.webp', alt: 'Local farming scenes in Habarana', caption: 'Local farming and rural scenery' },
            { src: 'assets/images/habarana/pexels-ralfsziigurs-20321536.webp', alt: 'Quiet nature moments in Habarana', caption: 'Quiet nature moments in the Habarana area' },
            { src: 'assets/images/habarana/pexels-renjith-tomy-pkm-138432405-11466145.webp', alt: 'Village boat ride in Habarana', caption: 'Village boat ride through peaceful waters' },
            { src: 'assets/images/habarana/sheila-c-FQi-RnPG92M-unsplash.webp', alt: 'Sunset over Habarana landscape', caption: 'Sunset over Habarana\'s calm landscape' }
        ],
        photoText: 'Temporary placeholder: upload Day 6 Habarana photos later.',
        videoText: 'Temporary placeholder: upload Day 6 Habarana videos later.'
    },
    '07': {
        title: 'Sigiriya & Dambulla',
        description: 'After breakfast, visit the famous Sigiriya Rock Fortress and continue to the historic Dambulla Cave Temple.',
        overview: 'Climb Sigiriya Rock Fortress for stunning views of the surrounding landscape while passing ancient frescoes and gardens. Continue to Dambulla Cave Temple, a historic complex built inside natural caves with impressive Buddha statues and wall paintings. Enjoy all meals at selected 5-star rated hotels.',
        quickFacts: ['Sigiriya Rock Fortress', 'Dambulla Cave Temple', 'Ancient Frescoes', 'Selected 5-Star Rated Hotel Meals'],
        dayPlans: [
            {
                title: 'Sigiriya Rock Fortress',
                items: [
                    'Visit Sigiriya Rock Fortress for the main climb and sweeping views.',
                    'Pass ancient frescoes and beautiful gardens along the way.'
                ]
            },
            {
                title: 'Dambulla Cave Temple',
                items: [
                    'Continue to Dambulla Cave Temple for painted caves and religious history.',
                    'See Buddha statues and wall paintings inside the natural caves.'
                ]
            }
        ],
        stayPlan: [
            'Second night in the Habarana area at a selected 5-star rated hotel',
            'Ideal base for the cultural triangle route'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Sigiriya Rock Fortress', 'Dambulla Cave Temple', 'Ancient Frescoes', 'Cultural Triangle'],
        galleryTitle: 'Day 7 Gallery | Sigiriya and Dambulla',
        galleryItems: [
            { src: 'assets/images/sigiriya-dambulla/agnieszka-stankiewicz-bkfBxbI7a1g-unsplash.webp', alt: 'Sigiriya Rock Fortress rising above the plains', caption: 'Sigiriya Rock Fortress above the plains' },
            { src: 'assets/images/sigiriya-dambulla/filiz-elaerts-TSNwuN9IdOk-unsplash.webp', alt: 'Ancient path and gardens at Sigiriya', caption: 'Ancient pathways and gardens at Sigiriya' },
            { src: 'assets/images/sigiriya-dambulla/Gemini_Generated_Image_8lee3p8lee3p8lee.webp', alt: 'Sigiriya sunrise views', caption: 'Sigiriya views at sunrise' },
            { src: 'assets/images/sigiriya-dambulla/matt-dany-1ul4-hqm48M-unsplash.webp', alt: 'Gardens and heritage surroundings at Sigiriya', caption: 'Gardens and heritage surroundings' },
            { src: 'assets/images/sigiriya-dambulla/pexels-harsha-samaranayake-303340503-13391116.webp', alt: 'Dambulla Cave Temple interior', caption: 'Dambulla Cave Temple interior' },
            { src: 'assets/images/sigiriya-dambulla/pexels-kseniya-buraya-124360874-10610942.webp', alt: 'Buddha statues and cave paintings in Dambulla', caption: 'Buddha statues and cave paintings' }
        ],
        photoText: 'Temporary placeholder: upload Day 7 Sigiriya photos later.',
        videoText: 'Temporary placeholder: upload Day 7 Sigiriya videos later.'
    },
    '08': {
        title: 'Anuradhapura Sacred City',
        description: 'Travel to Anuradhapura, one of Sri Lanka’s most important spiritual and historical cities.',
        overview: 'Visit sacred places including Ruwanwelisaya, Jaya Sri Maha Bodhi, Thuparamaya, Jetavanaramaya, and Abhayagiri Monastery. You will also visit Tissa Wewa, a peaceful lake that adds to the beauty of the area. This day offers a deep cultural and spiritual experience, with opportunities to learn about Sri Lanka’s rich history. All meals are provided at selected 5-star rated hotels.',
        quickFacts: ['1 Night in Anuradhapura', 'Ruwanwelisaya', 'Jaya Sri Maha Bodhi', 'Selected 5-Star Rated Hotel Meals'],
        dayPlans: [
            {
                title: 'Sacred Monuments',
                items: [
                    'See Ruwanwelisaya and Jaya Sri Maha Bodhi, the key pilgrimage stops in the city.',
                    'Continue to Thuparamaya and Jethawanaramaya for more sacred heritage.'
                ]
            },
            {
                title: 'Ancient City Circuit',
                items: [
                    'Visit Abhayagiriya and Tissa Wewa to round out the heritage circuit.',
                    'Return to the hotel for the night.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Anuradhapura at a selected 5-star rated hotel',
            'Comfortable stay for a full sacred city program'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Ruwanwelisaya', 'Jaya Sri Maha Bodhi', 'Thuparamaya', 'Jetavanaramaya', 'Abhayagiri Monastery', 'Tissa Wewa'],
        galleryTitle: 'Day 8 Gallery | Anuradhapura Sacred City',
        galleryItems: [
            { src: 'assets/images/anuradhapura/anuradhapura1.webp', alt: 'Ruwanwelisaya sacred stupa', caption: 'Ruwanwelisaya sacred stupa' },
            { src: 'assets/images/anuradhapura/anuradhapura2.webp', alt: 'Jaya Sri Maha Bodhi pilgrimage site', caption: 'Jaya Sri Maha Bodhi pilgrimage site' },
            { src: 'assets/images/anuradhapura/Gemini_Generated_Image_2jewxq2jewxq2jew.webp', alt: 'Thuparamaya and ancient ruins', caption: 'Thuparamaya and ancient ruins' },
            { src: 'assets/images/anuradhapura/anuradhapura-whatsapp.webp', alt: 'Tissa Wewa lakeside views', caption: 'Peaceful views of Tissa Wewa' },
            { src: 'assets/images/anuradhapura/anuradhapura1.webp', alt: 'Jetavanaramaya monument view', caption: 'Jetavanaramaya monument view' },
            { src: 'assets/images/anuradhapura/anuradhapura2.webp', alt: 'Abhayagiri monastery atmosphere', caption: 'Abhayagiri monastery atmosphere' }
        ],
        photoText: 'Temporary placeholder: upload Day 8 Anuradhapura photos later.',
        videoText: 'Temporary placeholder: upload Day 8 Anuradhapura videos later.'
    },
    '09': {
        title: 'Kandy (1 Night)',
        description: 'Continue your journey to Kandy, a beautiful city surrounded by mountains and greenery.',
        overview: 'Visit the sacred Temple of the Sacred Tooth Relic, an important religious site visited by people from around the world. Then explore the lush Royal Botanic Gardens, Peradeniya, home to a wide variety of plants, trees, and orchids. Breakfast and lunch will be served at selected 5-star rated hotels.',
        quickFacts: ['1 Night in Kandy', 'Temple of the Sacred Tooth Relic', 'Royal Botanic Gardens, Peradeniya', 'Breakfast and Lunch at Selected 5-Star Rated Hotels'],
        dayPlans: [
            {
                title: 'Temple of the Sacred Tooth Relic',
                items: [
                    'Visit the Temple of the Sacred Tooth Relic, one of the country’s most important religious sites.',
                    'Take in the atmosphere around the lake and city center.'
                ]
            },
            {
                title: 'Royal Botanic Gardens, Peradeniya',
                items: [
                    'Continue to Royal Botanic Gardens, Peradeniya for a relaxed scenic walk.',
                    'Spend the evening in Kandy before overnight stay.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Kandy at a selected 5-star rated hotel',
            'Central base for temple and garden sightseeing'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at own arrangement'
        ],
        highlights: ['Temple of the Sacred Tooth Relic', 'Royal Botanic Gardens, Peradeniya', 'Kandy Lake', 'Mountain City Views'],
        galleryTitle: 'Day 9 Gallery | Kandy Temple and Gardens',
        galleryItems: [
            { src: 'assets/images/kandy/kandy-2.webp', alt: 'Kandy lake and city views', caption: 'Kandy lake and city views' },
            { src: 'assets/images/kandy/Kandy-04.webp', alt: 'Temple of the Sacred Tooth Relic', caption: 'Temple of the Sacred Tooth Relic' },
            { src: 'assets/images/kandy/kandy5.webp', alt: 'Royal Botanic Gardens in Peradeniya', caption: 'Royal Botanic Gardens in Peradeniya' },
            { src: 'assets/images/kandy/Visit-Ramboda-Falls-2.webp', alt: 'Hill-country waterfall views near Kandy', caption: 'Hill-country waterfall views' },
            { src: 'assets/images/kandy/Gemini_Generated_Image_lm2rlilm2rlilm2r.webp', alt: 'Cultural city views in Kandy', caption: 'Cultural city views in Kandy' },
            { src: 'assets/images/kandy/Gemini_Generated_Image_5oohdx5oohdx5ooh.webp', alt: 'Green mountain scenery around Kandy', caption: 'Green mountain scenery around Kandy' }
        ],
        photoText: 'Temporary placeholder: upload Day 9 Kandy photos later.',
        videoText: 'Temporary placeholder: upload Day 9 Kandy videos later.'
    },
    '10': {
        title: 'Nuwara Eliya (1 Night)',
        description: 'Travel to Nuwara Eliya, often called “Little England” because of its cool climate and scenic beauty.',
        overview: 'Visit Horton Plains National Park for nature walks through open grasslands and misty forests. Later, relax at Gregory Lake and take in the peaceful surroundings, with views of tea plantations such as Sandathenna. All meals are provided at selected 5-star rated hotels.',
        quickFacts: ['1 Night in Nuwara Eliya', 'Horton Plains National Park', 'Gregory Lake', 'Selected 5-Star Rated Hotel Meals'],
        dayPlans: [
            {
                title: 'Horton Plains National Park',
                items: [
                    'Explore Horton Plains National Park for open highland scenery and nature walks.',
                    'Continue to Gregory Lake and Sandathenna for a softer-paced afternoon.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Nuwara Eliya at a selected 5-star rated hotel',
            'Cool-climate stay in Sri Lanka’s tea country'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Horton Plains National Park', 'Gregory Lake', 'Sandathenna', 'Tea-Country Views'],
        galleryTitle: 'Day 10 Gallery | Nuwara Eliya Highlands',
        galleryItems: [
            { src: 'assets/images/nuwara-eliya/Gemini_Generated_Image_52rvji52rvji52rv.webp', alt: 'Nuwara Eliya tea country scenery', caption: 'Nuwara Eliya tea country scenery' },
            { src: 'assets/images/nuwara-eliya/Gemini_Generated_Image_6m05cv6m05cv6m05.webp', alt: 'Cool-climate hills around Nuwara Eliya', caption: 'Cool-climate hills around Nuwara Eliya' },
            { src: 'assets/images/nuwara-eliya/Gemini_Generated_Image_fcotqxfcotqxfcot.webp', alt: 'Gregory Lake waterfront views', caption: 'Gregory Lake waterfront views' },
            { src: 'assets/images/nuwara-eliya/Gemini_Generated_Image_lqj0oblqj0oblqj0.webp', alt: 'Misty highland scenery', caption: 'Misty highland scenery' },
            { src: 'assets/images/nuwara-eliya/Gemini_Generated_Image_uhe9rxuhe9rxuhe9.webp', alt: 'Open grasslands at Horton Plains', caption: 'Open grasslands at Horton Plains' },
            { src: 'assets/images/nuwara-eliya/pexels-thilina-alagiyawanna-3266092-36847129.webp', alt: 'Tea estates in Sandathenna', caption: 'Tea estates in Sandathenna' }
        ],
        photoText: 'Temporary placeholder: upload Day 10 Nuwara Eliya photos later.',
        videoText: 'Temporary placeholder: upload Day 10 Nuwara Eliya videos later.'
    },
    '11': {
        title: 'Ella (1 Night)',
        description: 'Arrive in Ella, a small and scenic town known for its natural beauty and relaxed atmosphere.',
        overview: 'Visit the famous Nine Arch Bridge, a beautiful railway bridge surrounded by greenery. You can also enjoy a short hike to Little Adam’s Peak for panoramic views. Meals will be served at selected 5-star rated hotels.',
        quickFacts: ['1 Night in Ella', 'Nine Arch Bridge', "Little Adam's Peak", 'Selected 5-Star Rated Hotel Meals'],
        dayPlans: [
            {
                title: 'Classic Ella Sights',
                items: [
                    'Visit Nine Arch Bridge and enjoy the lush scenery around the bridge.',
                    'Take a short hike to Little Adam’s Peak for panoramic views.'
                ]
            }
        ],
        stayPlan: [
            '1 night in Ella at a selected 5-star rated hotel or boutique stay',
            'A scenic hill-country base for the second Ella day'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Nine Arch Bridge', "Little Adam's Peak", 'Ella Rock', 'Hill-Country Views'],
        galleryTitle: 'Day 11 Gallery | Ella Scenic Views',
        galleryItems: [
            { src: 'assets/images/ella/ella1.webp', alt: 'Ella town and hill views', caption: 'Ella town and hill views' },
            { src: 'assets/images/ella/ella3.webp', alt: 'Nine Arch Bridge in Ella', caption: 'Nine Arch Bridge in Ella' },
            { src: 'assets/images/ella/Gemini_Generated_Image_1f27zh1f27zh1f27.webp', alt: 'Little Adam\'s Peak trail', caption: 'Little Adam\'s Peak trail' },
            { src: 'assets/images/ella/Gemini_Generated_Image_420c9a420c9a420c.webp', alt: 'Scenic railway views in Ella', caption: 'Scenic railway views in Ella' },
            { src: 'assets/images/ella/Gemini_Generated_Image_6f5ukr6f5ukr6f5u.webp', alt: 'Green hills around Ella valley', caption: 'Green hills around the valley' },
            { src: 'assets/images/ella/Gemini_Generated_Image_8fpcxn8fpcxn8fpc.webp', alt: 'Relaxed Ella evening atmosphere', caption: 'Relaxed Ella evening atmosphere' }
        ],
        photoText: 'Temporary placeholder: upload Day 11 Ella photos later.',
        videoText: 'Temporary placeholder: upload Day 11 Ella videos later.'
    },
    '12': {
        title: 'Ella Adventure (1 Night)',
        description: 'Spend an active day exploring more of Ella’s attractions.',
        overview: 'Hike to Ella Rock for breathtaking views, and visit Ravana Cave and Ravana Falls, both linked to local legends. For adventure lovers, enjoy activities at Flying Ravana Adventure Park. You may also visit Dunhinda Falls, one of the most beautiful waterfalls in Sri Lanka. All meals are provided at selected 5-star rated hotels.',
        quickFacts: ['Ella Rock', 'Ravana Cave', 'Ravana Falls', 'Flying Ravana Adventure Park'],
        dayPlans: [
            {
                title: 'Adventure and Waterfalls',
                items: [
                    'Hike to Ella Rock for breathtaking views.',
                    'Visit Ravana Cave and Ravana Falls, then enjoy activities at Flying Ravana Adventure Park.'
                ]
            }
        ],
        stayPlan: [
            'Second night in Ella at a selected 5-star rated hotel or boutique stay',
            'Perfect for a two-day hill-country stop'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Ella Rock', 'Ravana Cave', 'Ravana Falls', 'Flying Ravana Adventure Park'],
        galleryTitle: 'Day 12 Gallery | Ella Adventure and Waterfalls',
        galleryItems: [
            { src: 'assets/images/ella-adventure/alladd3.webp', alt: 'Adventure views near Ella Rock', caption: 'Adventure views near Ella Rock' },
            { src: 'assets/images/ella-adventure/Gemini_Generated_Image_f31msdf31msdf31m.webp', alt: 'Ravana Falls and rocky scenery', caption: 'Ravana Falls and rocky scenery' },
            { src: 'assets/images/ella-adventure/Gemini_Generated_Image_lkuasblkuasblkua.webp', alt: 'Flying Ravana zip-line activity', caption: 'Flying Ravana zip-line activity' },
            { src: 'assets/images/ella-adventure/Gemini_Generated_Image_v4ll7pv4ll7pv4ll.webp', alt: 'Ravana Cave heritage stop', caption: 'Ravana Cave heritage stop' },
            { src: 'assets/images/ella-adventure/Gemini_Generated_Image_zex8fyzex8fyzex8.webp', alt: 'Waterfall adventure views', caption: 'Waterfall adventure views' },
            { src: 'assets/images/ella/Gemini_Generated_Image_420c9a420c9a420c.webp', alt: 'Scenic ridge views in Ella', caption: 'Scenic ridge views in Ella' }
        ],
        photoText: 'Temporary placeholder: upload Day 12 Ella photos later.',
        videoText: 'Temporary placeholder: upload Day 12 Ella videos later.'
    },
    '13': {
        title: 'Haputale & Balangoda (1 Night)',
        description: 'Enjoy a scenic journey through the hill country, passing through Haputale and Balangoda.',
        overview: 'These areas are known for their breathtaking viewpoints, rolling hills, and cool climate. Take time to relax, enjoy the views, and experience the peaceful surroundings before your overnight stay in Balangoda. Meals are provided at selected 5-star rated hotels.',
        quickFacts: ['1 Night in Balangoda', 'Haputale Views', 'Scenic Hill Country Drive', 'Selected 5-Star Rated Hotel Meals'],
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
            '1 night in Balangoda at a selected 5-star rated hotel',
            'A quiet stop before the final transfer to Negombo'
        ],
        mealPlan: [
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: at selected 5-star rated hotels',
            'Dinner: at selected 5-star rated hotels'
        ],
        highlights: ['Haputale', 'Balangoda', 'Scenic Viewpoints', 'Hill-Country Drive'],
        galleryTitle: 'Day 13 Gallery | Haputale and Balangoda Views',
        galleryItems: [
            { src: 'assets/images/haputale-balangoda/balango4.webp', alt: 'Hill-country views around Balangoda', caption: 'Hill-country views around Balangoda' },
            { src: 'assets/images/haputale-balangoda/blango2.webp', alt: 'Balangoda mountain scenery', caption: 'Balangoda mountain scenery' },
            { src: 'assets/images/haputale-balangoda/Gemini_Generated_Image_28ev2s28ev2s28ev.webp', alt: 'Haputale viewpoint landscape', caption: 'Haputale viewpoint landscape' },
            { src: 'assets/images/haputale-balangoda/Gemini_Generated_Image_jsukdfjsukdfjsuk.webp', alt: 'Rolling hills in the hill country', caption: 'Rolling hills in the hill country' },
            { src: 'assets/images/haputale-balangoda/Gemini_Generated_Image_m3y6o3m3y6o3m3y6.webp', alt: 'Cool climate tea-country scenery', caption: 'Cool climate tea-country scenery' },
            { src: 'assets/images/haputale-balangoda/Gemini_Generated_Image_sxd7u9sxd7u9sxd7.webp', alt: 'Peaceful route through Haputale', caption: 'Peaceful route through Haputale' }
        ],
        photoText: 'Temporary placeholder: upload Day 13 Balangoda photos later.',
        videoText: 'Temporary placeholder: upload Day 13 Balangoda videos later.'
    },
    '14': {
        title: 'Negombo (Departure)',
        description: 'Travel to Negombo, a coastal town close to the airport.',
        overview: 'Spend your final moments relaxing before departure, enjoying the beachside atmosphere and reflecting on your journey through Sri Lanka.',
        quickFacts: ['Final Transfer Day', 'Negombo', 'Airport Access', 'Breakfast at Selected 5-Star Rated Hotels'],
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
            'Breakfast: at selected 5-star rated hotels',
            'Lunch: as per departure time',
            'Dinner: not included unless staying on'
        ],
        highlights: ['Negombo', 'Airport Transfer', 'Final Departure Day'],
        galleryTitle: 'Day 14 Gallery | Negombo Departure',
        galleryItems: [
            { src: 'assets/images/negombo-end-of-tour/florian-wehde-szpz0b1Q6IE-unsplash.webp', alt: 'Negombo beach at departure time', caption: 'Negombo beach at departure time' },
            { src: 'assets/images/negombo-end-of-tour/Gemini_Generated_Image_lsows6lsows6lsow.webp', alt: 'Coastal calm near the airport', caption: 'Coastal calm near the airport' },
            { src: 'assets/images/negombo-end-of-tour/Gemini_Generated_Image_pb4lwdpb4lwdpb4l.webp', alt: 'Lagoon-side sunset in Negombo', caption: 'Lagoon-side sunset in Negombo' },
            { src: 'assets/images/negombo-end-of-tour/negambo1.webp', alt: 'Relaxed beachfront views in Negombo', caption: 'Relaxed beachfront views in Negombo' },
            { src: 'assets/images/negombo-end-of-tour/recal-media-ueBIGLmiI5A-unsplash.webp', alt: 'Fishing boats and harbor life', caption: 'Fishing boats and harbor life' },
            { src: 'assets/images/negombo-end-of-tour/sheila-c-F_lmtD0buXE-unsplash.webp', alt: 'Final seaside moment in Negombo', caption: 'Final seaside moment in Negombo' }
        ],
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
    const gallerySection = document.getElementById('tripGallerySection');
    const galleryTitle = document.getElementById('tripGalleryTitle');
    const galleryGrid = document.getElementById('tripGalleryGrid');
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

        if (gallerySection && galleryTitle && galleryGrid) {
            const galleryItems = detail.galleryItems || [];

            if (galleryItems.length > 0) {
                gallerySection.classList.remove('hidden');
                galleryTitle.textContent = detail.galleryTitle || 'Gallery';
                galleryGrid.innerHTML = '';

                galleryItems.forEach((item) => {
                    const figure = document.createElement('figure');
                    figure.className = 'galle-gallery-item';

                    const image = document.createElement('img');
                    image.src = item.src;
                    image.alt = item.alt;

                    const caption = document.createElement('figcaption');
                    caption.textContent = item.caption;

                    figure.appendChild(image);
                    figure.appendChild(caption);
                    galleryGrid.appendChild(figure);
                });
            } else {
                gallerySection.classList.add('hidden');
                galleryGrid.innerHTML = '';
            }
        }
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
