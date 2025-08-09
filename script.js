document.addEventListener('DOMContentLoaded', function () {
    // --- TOUCH INTERACTION FOR GALLERY CARDS (IMPROVED) ---
    function handleTouchInteractions() {
        const galleryCards = document.querySelectorAll('.gallery-card, .gallery-card-goals');
        
        galleryCards.forEach(card => {
            // Handle touch events (mobile)
            card.addEventListener('touchend', function(e) {
                e.preventDefault(); // Prevent ghost clicks and default behaviors
                handleCardToggle(card, galleryCards, e);
            });
            
            // Handle click events (desktop and fallback)
            card.addEventListener('click', function(e) {
                // Only handle click if it's not a touch device or if touch events didn't fire
                if (!('ontouchstart' in window) || e.pointerType === 'mouse') {
                    e.preventDefault();
                    handleCardToggle(card, galleryCards, e);
                }
            });
        });

        // Close overlay when clicking/touching outside (improved)
        ['touchend', 'click'].forEach(eventType => {
            document.addEventListener(eventType, function(e) {
                if (!e.target.closest('.gallery-card') && !e.target.closest('.gallery-card-goals')) {
                    galleryCards.forEach(card => {
                        card.classList.remove('active');
                    });
                }
            });
        });
    }

    // Improved card toggle function
    function handleCardToggle(card, allCards, event) {
        // Remove active class from all other cards
        allCards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.classList.remove('active');
            }
        });
        
        // Toggle active class on clicked/tapped card
        card.classList.toggle('active');
    }

    // Initialize touch interactions
    handleTouchInteractions();

    // --- SLIDESHOW CODE ---
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        const images = [
            'assets/img_1.jpeg',
            'assets/img_2.jpg',
            'assets/img_3.jpeg',
            'assets/img_4.jpg',
            'assets/img_5.jpg',
        ];

        const rotationInterval = 5000; // 5 seconds
        let currentImageIndex = 0;
        let loadedImages = [];

        // Create two image layers for smooth crossfading
        const layer1 = document.createElement('div');
        const layer2 = document.createElement('div');

        layer1.className = 'hero-image-layer';
        layer2.className = 'hero-image-layer';

        // Insert layers at the beginning of hero section
        heroSection.insertBefore(layer1, heroSection.firstChild);
        heroSection.insertBefore(layer2, heroSection.firstChild);

        let activeLayer = layer1;
        let inactiveLayer = layer2;

        // Preload all images
        function preloadImages() {
            return Promise.all(
                images.map((src, index) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            console.log(`Image ${index + 1} loaded: ${src}`);
                            resolve(src);
                        };
                        img.onerror = () => {
                            console.warn(`Failed to load: ${src}`);
                            resolve(null);
                        };
                        img.src = src;
                    });
                })
            );
        }

        function transitionToNextImage() {
            // Find next valid image
            let nextIndex = (currentImageIndex + 1) % images.length;
            let attempts = 0;

            while (!loadedImages[nextIndex] && attempts < images.length) {
                nextIndex = (nextIndex + 1) % images.length;
                attempts++;
            }

            if (!loadedImages[nextIndex]) return;

            currentImageIndex = nextIndex;

            // Set new image on inactive layer and start its animation
            inactiveLayer.style.backgroundImage = `url(${loadedImages[currentImageIndex]})`;
            inactiveLayer.classList.add('ken-burns', 'active');

            // Fade out active layer (but keep its animation running)
            activeLayer.classList.remove('active');

            // Wait for the fade transition to complete (1.5s) before cleaning up
            setTimeout(() => {
                // Now it's safe to remove the animation from the old layer
                activeLayer.classList.remove('ken-burns');
                // Swap layer references
                [activeLayer, inactiveLayer] = [inactiveLayer, activeLayer];
            }, 1500); // Match the CSS transition duration exactly
        }

        // Initialize slideshow
        preloadImages().then(results => {
            loadedImages = results;
            const validImages = results.filter(Boolean);

            if (validImages.length > 0) {
                // Set first image
                activeLayer.style.backgroundImage = `url(${validImages[0]})`;
                activeLayer.classList.add('active', 'ken-burns');

                // Start slideshow if multiple images
                if (validImages.length > 1) {
                    setInterval(transitionToNextImage, rotationInterval);
                }
            }
        });
    }

    // --- HAMBURGER MENU ---
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('is-open');
            mainNav.classList.toggle('is-open');
        });

        // Close menu when clicking on a nav link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('is-open');
                mainNav.classList.remove('is-open');
            });
        });
    }
    // --- AUTOFOCUS THANKYOU MESSAGE ---
    const thankYouMessage = document.getElementById('thankyou-message');
    if (thankYouMessage) {
        thankYouMessage.focus();
    }
});