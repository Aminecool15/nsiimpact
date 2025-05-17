document.addEventListener('DOMContentLoaded', function() {
    // Configuration des particules pour le thème noir avec jaune foncé
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#CC9900"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.2,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#CC9900",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.5
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }

    // Animation de comptage pour les statistiques
    animateCounters();

    // Effet de parallaxe sur le défilement
    window.addEventListener('scroll', function() {
        parallaxEffect();
        updateHeaderBackground();
    });

    // Animation du globe et points chauds
    animateGlobe();

    // Gestion des animations au défilement
    initScrollAnimations();

    // Gestion du formulaire de contact
    initContactForm();
});

// Animation des compteurs de statistiques
function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        const increment = target / 50;
        let current = 0;

        const updateCount = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.ceil(current);
                setTimeout(updateCount, 40);
            } else {
                stat.textContent = target;
            }
        };

        updateCount();
    });
}

// Effet de parallaxe au défilement
function parallaxEffect() {
    const scrollPosition = window.pageYOffset;

    // Parallaxe pour la section héros
    const heroContent = document.querySelector('.hero-content');
    const globeContainer = document.querySelector('.globe-container');

    if (heroContent && globeContainer) {
        heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
        globeContainer.style.transform = `translateY(${scrollPosition * 0.1}px)`;
    }
}

// Mise à jour de l'arrière-plan de l'en-tête au défilement
function updateHeaderBackground() {
    const header = document.querySelector('header');

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Animation du globe et des points chauds
function animateGlobe() {
    const hotspots = document.querySelectorAll('.hotspot');

    // Animation aléatoire des points chauds
    hotspots.forEach(hotspot => {
        setInterval(() => {
            const randomScale = Math.random() * 0.4 + 0.8;
            hotspot.style.transform = `translate(-50%, -50%) scale(${randomScale})`;

            setTimeout(() => {
                hotspot.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 500);
        }, Math.random() * 5000 + 3000);
    });
}

// Initialisation des animations au défilement
function initScrollAnimations() {
    // Animation des cartes de fonctionnalités
    const featureCards = document.querySelectorAll('.feature-card');

    // Animation des barres de données
    const dataBars = document.querySelectorAll('.data-bar');

    // Fonction pour vérifier si un élément est visible dans la fenêtre
    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
        );
    };

    // Fonction pour vérifier les éléments visibles au défilement
    const checkVisibility = () => {
        featureCards.forEach(card => {
            if (isElementInViewport(card)) {
                card.classList.add('fade-in');
            }
        });

        dataBars.forEach(bar => {
            if (isElementInViewport(bar)) {
                bar.classList.add('animated');
            }
        });
    };

    // Ajouter l'animation CSS pour fade-in
    const style = document.createElement('style');
    style.innerHTML = `
        .feature-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .feature-card.fade-in {
            opacity: 1;
            transform: translateY(0);
        }

        .data-bar {
            height: 0 !important;
            transition: height 1.5s ease-out;
        }

        .data-bar.animated {
            height: calc(var(--height) * 1%) !important;
        }
    `;
    document.head.appendChild(style);

    // Vérifier au chargement et au défilement
    window.addEventListener('scroll', checkVisibility);
    checkVisibility();
}

// Gestion du formulaire de contact
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Simuler l'envoi du formulaire
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Simuler une réponse réussie
                alert('Thank you for your message! We will get back to you soon.');

                // Réinitialiser le formulaire
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

// Navigation fluide pour les ancres
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
