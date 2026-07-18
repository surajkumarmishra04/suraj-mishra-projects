/**
 * ==================================================
 * BBDU STUDY HUB - NAVIGATION SYSTEM
 * Description: Modular, scalable, and future-proof 
 * navigation system using Vanilla JavaScript.
 * Handles History API, Breadcrumbs, and routing.
 * ==================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==================================================
       1. NAVIGATION STATE & CONFIGURATION
       ================================================== */
    
    // Application State
    let navState = {
        course: null,
        year: null,
        semester: null,
        resource: null,
        isNavigating: false // Prevents multiple rapid clicks
    };

    // Configuration for scalable routing
    const CONFIG = {
        comingSoonCourses: ['bca', 'mca', 'mba', 'mtech', 'btech-it'],
        activeCourses: ['btech-cse-ai'],
        baseUrl: window.location.origin + window.location.pathname
    };

    /* ==================================================
       2. CORE NAVIGATION FUNCTIONS
       ================================================== */

    /**
     * Navigate to Home (Reset State)
     */
    const goToHome = () => {
        if (navState.isNavigating) return;
        updateState({ course: null, year: null, semester: null, resource: null });
        executeNavigation('home');
    };

    /**
     * Navigate to a specific Course
     * @param {string} courseId - ID of the course (e.g., 'btech-cse-ai')
     */
    const goToCourse = (courseId) => {
        if (navState.isNavigating) return;
        
        if (CONFIG.comingSoonCourses.includes(courseId)) {
            handleComingSoon(courseId);
            return;
        }

        updateState({ course: courseId, year: null, semester: null, resource: null });
        executeNavigation('course', courseId);
    };

    /**
     * Navigate to a specific Year
     * @param {string} yearId - ID of the year (e.g., 'first-year')
     */
    const goToYear = (yearId) => {
        if (navState.isNavigating) return;
        updateState({ year: yearId, semester: null, resource: null });
        executeNavigation('year', yearId);
    };

    /**
     * Navigate to a specific Semester
     * @param {string} semesterId - ID of the semester (e.g., 'semester-1')
     */
    const goToSemester = (semesterId) => {
        if (navState.isNavigating) return;
        updateState({ semester: semesterId, resource: null });
        executeNavigation('semester', semesterId);
    };

    /* --- RESOURCE NAVIGATION ALIASES --- */

    const goToNotes = () => goToResource('notes');
    const goToQuestionPapers = () => goToResource('question-papers');
    const goToAssignments = () => goToResource('assignments');
    const goToSyllabus = () => goToResource('syllabus');

    /**
     * Navigate to a specific Resource Type
     * @param {string} resourceId - ID of the resource
     */
    const goToResource = (resourceId) => {
        if (navState.isNavigating) return;
        updateState({ resource: resourceId });
        executeNavigation('resource', resourceId);
    };

    /* ==================================================
       3. NAVIGATION EXECUTION & HISTORY API
       ================================================== */

    /**
     * Safely update the internal navigation state
     * @param {Object} newState - Partial state object to merge
     */
    const updateState = (newState) => {
        navState = { ...navState, ...newState };
    };

    /**
     * Executes the actual routing logic, updates History API, 
     * and dispatches events for the UI (script.js) to handle animations.
     * @param {string} level - Level of navigation (home, course, year, etc.)
     * @param {string} id - Specific target ID
     * @param {boolean} pushHistory - Whether to push to browser history
     */
    const executeNavigation = (level, id = null, pushHistory = true) => {
        navState.isNavigating = true;

        // Build mock URL for future support (e.g., /btech-cse-ai/first-year)
        const newUrl = buildUrl();

        if (pushHistory) {
            window.history.pushState(navState, '', newUrl);
        }

        // Generate and update breadcrumbs
        updateBreadcrumbs();

        // Highlight active navigation items
        updateActiveStates(level, id);

        // Dispatch Custom Event so script.js can handle animations & UI changes
        // Keeps navigation logic strictly decoupled from CSS/DOM animations
        const navEvent = new CustomEvent('bbduNavigated', {
            detail: { level, id, state: navState }
        });
        document.dispatchEvent(navEvent);

        // Reset navigation lock after smooth transition allowance
        setTimeout(() => {
            navState.isNavigating = false;
        }, 300);
    };

    /**
     * Construct future-proof URLs based on current state
     * @returns {string} - Constructed URL path
     */
    const buildUrl = () => {
        let path = CONFIG.baseUrl;
        if (navState.course) path += `?course=${navState.course}`;
        if (navState.year) path += `&year=${navState.year}`;
        if (navState.semester) path += `&semester=${navState.semester}`;
        if (navState.resource) path += `&resource=${navState.resource}`;
        return path;
    };

    /**
     * Handle Browser Back/Forward Buttons
     */
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            navState = event.state;
            const currentLevel = navState.resource ? 'resource' 
                               : navState.semester ? 'semester' 
                               : navState.year ? 'year' 
                               : navState.course ? 'course' 
                               : 'home';
            executeNavigation(currentLevel, navState[currentLevel], false);
        } else {
            goToHome();
        }
    });

    /* ==================================================
       4. EVENT DELEGATION & CLICK HANDLING
       ================================================== */

    /**
     * Bind all navigation events using Event Delegation.
     * Expects HTML elements to have data attributes like:
     * data-nav-type="course" data-nav-target="btech-cse-ai"
     */
    const bindNavigationEvents = () => {
        document.addEventListener('click', (e) => {
            // Find closest navigation element if clicking an inner child (like an icon)
            const navElement = e.target.closest('[data-nav-type]');
            
            if (!navElement) return;

            e.preventDefault();
            const type = navElement.getAttribute('data-nav-type');
            const target = navElement.getAttribute('data-nav-target');

            handleNavigationAction(type, target);
        });

        // Accessibility: Trigger click on Enter or Space for keyboard users
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const navElement = document.activeElement.closest('[data-nav-type]');
                if (navElement) {
                    e.preventDefault();
                    navElement.click();
                }
            }
        });
    };

    /**
     * Route clicks to appropriate navigation functions
     * @param {string} type - Type of navigation (home, course, year, etc.)
     * @param {string} target - ID of the target
     */
    const handleNavigationAction = (type, target) => {
        switch (type) {
            case 'home':
                goToHome();
                break;
            case 'course':
                goToCourse(target);
                break;
            case 'year':
                goToYear(target);
                break;
            case 'semester':
                goToSemester(target);
                break;
            case 'resource':
                // Route to specific resource aliases for modularity
                if (target === 'notes') goToNotes();
                else if (target === 'question-papers') goToQuestionPapers();
                else if (target === 'assignments') goToAssignments();
                else if (target === 'syllabus') goToSyllabus();
                else goToResource(target);
                break;
            default:
                console.warn(`BBDU Navigation Error: Unknown nav type '${type}'`);
                handlePageNotFound();
        }
    };

    /* ==================================================
       5. BREADCRUMB MANAGEMENT
       ================================================== */

    /**
     * Generate Breadcrumbs based on the current state.
     * Keeps code ready for rendering into a breadcrumb container.
     */
    const updateBreadcrumbs = () => {
        const breadcrumbContainer = document.querySelector('#breadcrumb-container');
        if (!breadcrumbContainer) return;

        let trail = [{ name: 'Home', type: 'home', target: null }];

        if (navState.course) trail.push({ name: formatName(navState.course), type: 'course', target: navState.course });
        if (navState.year) trail.push({ name: formatName(navState.year), type: 'year', target: navState.year });
        if (navState.semester) trail.push({ name: formatName(navState.semester), type: 'semester', target: navState.semester });
        if (navState.resource) trail.push({ name: formatName(navState.resource), type: 'resource', target: navState.resource });

        renderBreadcrumbs(breadcrumbContainer, trail);
    };

    /**
     * Render the breadcrumb HTML array safely
     * @param {HTMLElement} container - Container to inject HTML
     * @param {Array} trail - Array of breadcrumb objects
     */
    const renderBreadcrumbs = (container, trail) => {
        container.innerHTML = trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            if (isLast) {
                return `<span class="breadcrumb-current" aria-current="page">${item.name}</span>`;
            }
            return `<a href="#" class="breadcrumb-link" data-nav-type="${item.type}" data-nav-target="${item.target}">${item.name}</a><span class="breadcrumb-separator"> > </span>`;
        }).join('');
    };

    /**
     * Format raw ID strings into readable names (e.g., 'btech-cse-ai' -> 'B.Tech CSE (AI)')
     */
    const formatName = (str) => {
        if (!str) return '';
        const specificNames = {
            'btech-cse-ai': 'B.Tech CSE (AI)',
            'first-year': 'First Year',
            'semester-1': 'Semester 1',
            'question-papers': 'Question Papers'
        };
        return specificNames[str] || str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    /* ==================================================
       6. UI STATE MANAGEMENT & ERROR HANDLING
       ================================================== */

    /**
     * Manage active classes on navigation links and menus
     */
    const updateActiveStates = (level, targetId) => {
        // Remove active class from all nav elements
        document.querySelectorAll('[data-nav-type]').forEach(el => {
            el.classList.remove('active', 'nav-active');
            el.setAttribute('aria-selected', 'false');
        });

        // Add active class to current targets
        if (targetId) {
            document.querySelectorAll(`[data-nav-target="${targetId}"]`).forEach(el => {
                el.classList.add('active');
                el.setAttribute('aria-selected', 'true');
            });
        }
    };

    /**
     * Handle Clicks on "Coming Soon" Courses
     * @param {string} courseId - ID of the requested coming soon course
     */
    const handleComingSoon = (courseId) => {
        // Dispatch event for UI (e.g., to show a custom toast/tooltip via script.js)
        const event = new CustomEvent('bbduComingSoonClicked', { detail: { courseId } });
        document.dispatchEvent(event);
        console.info(`Navigation prevented: ${courseId} is marked as Coming Soon.`);
    };

    /**
     * Fallback handling for missing pages / 404 simulation
     */
    const handlePageNotFound = () => {
        console.error("Navigation Target Not Found.");
        const event = new CustomEvent('bbduPageNotFound');
        document.dispatchEvent(event);
    };

    /* ==================================================
       7. INITIALIZATION
       ================================================== */

    const initNavigationSystem = () => {
        bindNavigationEvents();
        
        // Initial state load based on URL parameters (Future proofing for direct links)
        const params = new URLSearchParams(window.location.search);
        if (params.has('course')) {
            updateState({
                course: params.get('course'),
                year: params.get('year'),
                semester: params.get('semester'),
                resource: params.get('resource')
            });
            executeNavigation('load', null, false);
        } else {
            // Push initial state to history
            window.history.replaceState(navState, '', window.location.href);
        }
    };

    // Run Initialization
    initNavigationSystem();

});