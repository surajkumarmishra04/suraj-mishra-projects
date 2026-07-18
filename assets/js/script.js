/**
 * ==================================================
 * BBDU STUDY HUB - PRODUCTION JAVASCRIPT
 * Description: Core interactive functionalities, animations, 
 * performance optimized, and modular architecture.
 * ==================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==================================================
       1. UTILITY & HELPER FUNCTIONS
       ================================================== */
    
    /**
     * Select a single element safely
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (optional)
     */
    const select = (selector, parent = document) => parent.querySelector(selector);
    
    /**
     * Select multiple elements safely
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (optional)
     */
    const selectAll = (selector, parent = document) => parent.querySelectorAll(selector);

    /**
     * Debounce function to limit execution rate of a function
     */
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /**
     * Throttle function to limit execution rate of a function (useful for scroll)
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /* ==================================================
       2. PAGE LOADER MANAGEMENT
       ================================================== */
    
    const initLoader = () => {
        // Create loader elements dynamically to avoid HTML clutter
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: var(--bg-color, #0B1120); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        `;

        const spinner = document.createElement('div');
        spinner.className = 'c-loader'; // Reusing components.css class if available
        spinner.style.cssText = `
            width: 50px; height: 50px; border: 3px solid rgba(37, 99, 235, 0.2);
            border-top-color: #2563EB; border-radius: 50%;
            animation: loader-spin 1s linear infinite;
        `;
        
        // Add fallback animation keyframes if CSS is delayed
        if (!document.getElementById('loader-style')) {
            const style = document.createElement('style');
            style.id = 'loader-style';
            style.textContent = `@keyframes loader-spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        loader.appendChild(spinner);
        document.body.appendChild(loader);

        // Hide loader on window load
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(() => loader.remove(), 500); // Cleanup DOM
            }, 300); // Small delay for smooth effect
        });
    };

    /* ==================================================
       3. THEME MANAGEMENT (DARK / LIGHT MODE)
       ================================================== */
    
    const initThemeToggle = () => {
        const themeBtn = select('#theme-toggle-btn');
        if (!themeBtn) return;

        const body = document.body;
        const THEME_KEY = 'bbdu_study_hub_theme';

        // Check local storage or system preference
        const savedTheme = localStorage.getItem(THEME_KEY);
        const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

        if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
            body.classList.add('theme-light');
        } else {
            body.classList.remove('theme-light');
        }

        // Toggle function
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('theme-light');
            
            // Add click animation class
            themeBtn.style.transform = 'scale(0.8)';
            setTimeout(() => themeBtn.style.transform = 'scale(1)', 150);

            // Save preference
            if (body.classList.contains('theme-light')) {
                localStorage.setItem(THEME_KEY, 'light');
            } else {
                localStorage.setItem(THEME_KEY, 'dark');
            }
        });
    };

    /* ==================================================
       4. HEADER & SCROLL MANAGEMENT
       ================================================== */
    
    const initHeaderScroll = () => {
        const header = select('#main-header');
        if (!header) return;

        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
                header.style.boxShadow = 'var(--shadow-soft, 0 10px 30px rgba(0,0,0,0.1))';
                header.style.padding = '0.5rem 0';
            } else {
                header.classList.remove('scrolled');
                header.style.boxShadow = 'none';
                header.style.padding = '1rem 0'; // Reset padding based on CSS structure
            }
        };

        window.addEventListener('scroll', throttle(handleScroll, 50));
    };

    /* ==================================================
       5. SMOOTH SCROLLING & ACTIVE NAVIGATION
       ================================================== */
    
    const initNavigation = () => {
        const navLinks = selectAll('.nav-link');
        const sections = selectAll('section[id]');

        // Smooth Scroll
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = select(targetId);
                    if (targetSection) {
                        const headerOffset = select('#main-header')?.offsetHeight || 80;
                        const elementPosition = targetSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });

        // Active Link Highlighting on Scroll
        const highlightActiveLink = () => {
            const scrollY = window.pageYOffset;
            const headerOffset = select('#main-header')?.offsetHeight || 80;

            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - headerOffset - 50;
                const sectionId = current.getAttribute('id');

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        };

        window.addEventListener('scroll', throttle(highlightActiveLink, 100));
    };

    /* ==================================================
       6. BACK TO TOP BUTTON
       ================================================== */
    
    const initBackToTop = () => {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.className = 'c-scroll-top'; // Component CSS class
        backToTopBtn.setAttribute('aria-label', 'Scroll to top');
        
        // Fallback styling if component class isn't loaded
        backToTopBtn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; width: 45px; height: 45px;
            background: var(--primary, #2563EB); color: #FFF; border: none; border-radius: 50%;
            cursor: pointer; opacity: 0; visibility: hidden; transition: 0.3s; z-index: 99;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); font-size: 1.2rem;
        `;
        document.body.appendChild(backToTopBtn);

        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
                backToTopBtn.style.transform = 'translateY(0)';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
                backToTopBtn.style.transform = 'translateY(10px)';
            }
        };

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', throttle(toggleVisibility, 100));
    };

    /* ==================================================
       7. BUTTON RIPPLE EFFECT
       ================================================== */
    
    const initRippleEffect = () => {
        const buttons = selectAll('.btn, .c-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute; background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%; pointer-events: none;
                    width: 100px; height: 100px; margin-top: -50px; margin-left: -50px;
                    left: ${x}px; top: ${y}px; animation: ripple-anim 0.6s linear;
                `;

                // Add keyframes if not exists
                if (!document.getElementById('ripple-style')) {
                    const style = document.createElement('style');
                    style.id = 'ripple-style';
                    style.textContent = `
                        @keyframes ripple-anim {
                            0% { transform: scale(0); opacity: 1; }
                            100% { transform: scale(3); opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    };

    /* ==================================================
       8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
       ================================================== */
    
    const initScrollReveal = () => {
        const animatedElements = selectAll('.feature-card, .benefit-card, .upcoming-course-card, .section-header');
        
        // Initial state
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    };

    /* ==================================================
       9. COURSE & COMING SOON INTERACTIONS
       ================================================== */
    
    const initCourseInteractions = () => {
        // Main CTA Interaction
        const mainCtas = selectAll('#btn-open-cse, #btn-explore-cta');
        mainCtas.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = select(btn.getAttribute('href'));
                if (target) {
                    const headerOffset = select('#main-header')?.offsetHeight || 80;
                    window.scrollTo({
                        top: target.offsetTop - headerOffset,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Coming Soon Prevention
        const comingSoonCards = selectAll('.upcoming-course-card');
        comingSoonCards.forEach(card => {
            card.style.cursor = 'not-allowed';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                showTooltip(e, 'This course will be available soon.');
            });
        });
    };

    /* ==================================================
       10. TOOLTIPS
       ================================================== */
    
    const showTooltip = (event, message) => {
        // Remove existing tooltip if any
        let existingTooltip = select('.custom-tooltip');
        if (existingTooltip) existingTooltip.remove();

        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = message;
        
        tooltip.style.cssText = `
            position: fixed; background: #1E293B; color: #FFF;
            padding: 8px 16px; border-radius: 8px; font-size: 0.85rem;
            z-index: 1000; pointer-events: none; opacity: 0;
            transform: translateY(10px); transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-weight: 500;
        `;

        document.body.appendChild(tooltip);

        // Position Tooltip
        const x = event.clientX;
        const y = event.clientY;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - 40}px`; // Slightly above cursor

        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });

        // Remove after delay
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    };

    /* ==================================================
       11. COUNTER ANIMATIONS (FUTURE READY)
       ================================================== */
    
    const initCounters = () => {
        const counters = selectAll('.counter'); // Apply this class to any number in HTML later
        if (!counters.length) return;

        const observerOptions = { threshold: 0.5 };
        
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const countTo = parseInt(target.getAttribute('data-count')) || 0;
                    let currentCount = 0;
                    const duration = 2000; // 2 seconds
                    const increment = Math.ceil(countTo / (duration / 16)); // 60fps

                    const updateCounter = () => {
                        currentCount += increment;
                        if (currentCount < countTo) {
                            target.innerText = currentCount;
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.innerText = countTo;
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => counterObserver.observe(counter));
    };

    /* ==================================================
       12. CUSTOM CURSOR (DESKTOP ONLY)
       ================================================== */
    
    const initCustomCursor = () => {
        // Only initialize on non-touch fine pointer devices
        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768) return;

        const cursor = document.createElement('div');
        cursor.style.cssText = `
            position: fixed; width: 20px; height: 20px; border: 2px solid var(--primary, #2563EB);
            border-radius: 50%; pointer-events: none; z-index: 10000;
            transform: translate(-50%, -50%); transition: width 0.2s, height 0.2s, background 0.2s;
            mix-blend-mode: difference; display: none;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.display = 'block';
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        // Hover effects on interactive elements
        const interactables = selectAll('a, button, .upcoming-course-card, .feature-card, .theme-icon');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.background = 'rgba(37, 99, 235, 0.2)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.background = 'transparent';
            });
        });
    };

    /* ==================================================
       13. ACCESSIBILITY & KEYBOARD SUPPORT
       ================================================== */
    
    const initAccessibility = () => {
        // Outline removal on mouse interact, restore on keyboard interact
        document.body.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });
        
        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });

        // Add dynamic CSS for focus states
        if (!document.getElementById('a11y-style')) {
            const style = document.createElement('style');
            style.id = 'a11y-style';
            style.textContent = `
                body:not(.using-mouse) a:focus, 
                body:not(.using-mouse) button:focus {
                    outline: 3px solid var(--primary, #2563EB);
                    outline-offset: 3px;
                }
                body.using-mouse a:focus, 
                body.using-mouse button:focus {
                    outline: none;
                }
            `;
            document.head.appendChild(style);
        }
    };

    /* ==================================================
       14. INITIALIZE ALL MODULES
       ================================================== */
    
    const initAll = () => {
        try {
            initLoader();
            initThemeToggle();
            initHeaderScroll();
            initNavigation();
            initBackToTop();
            initRippleEffect();
            initScrollReveal();
            initCourseInteractions();
            initCounters();
            initCustomCursor();
            initAccessibility();
        } catch (error) {
            console.error('BBDU Study Hub Initialization Error:', error);
        }
    };

    // Run initializer
    initAll();

});