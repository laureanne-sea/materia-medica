/**
 * Shared Navigation Component
 * Automatically injects navigation into all pages
 */

(function() {
    'use strict';

    // Navigation structure - single source of truth
    const NAV_ITEMS = [
        { href: 'index.html', label: 'All Plants', id: 'all' },
        { href: 'nervous-system.html', label: 'Nervous System', id: 'nervous' },
        { href: 'immune-system.html', label: 'Immune System', id: 'immune' },
        { href: 'digestive-system.html', label: 'Digestive System', id: 'digestive' },
        { href: 'respiratory-system.html', label: 'Respiratory System', id: 'respiratory' },
        { href: 'urinary-system.html', label: 'Urinary System', id: 'urinary' },
        { href: 'cardiovascular-system.html', label: 'Cardiovascular System', id: 'cardiovascular' },
        { href: 'skin-system.html', label: 'Skin System', id: 'skin' },
        { href: 'woman-reproductive-system.html', label: 'Woman Reproductive', id: 'woman-reproductive' },
        { href: 'male-reproductive-system.html', label: 'Male Reproductive', id: 'male-reproductive' }
    ];

    /**
     * Determine the base path for navigation links
     * Returns '../' for plant pages, '' for root pages
     */
    function getBasePath() {
        const path = window.location.pathname;
        return path.includes('/plants/') ? '../' : '';
    }

    /**
     * Determine which nav item should be active
     */
    function getActiveNavId() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        // Check for exact matches
        for (const item of NAV_ITEMS) {
            if (filename === item.href) {
                return item.id;
            }
        }

        // Default to 'all' for plant detail pages
        if (path.includes('/plants/')) {
            return null; // No active state on plant pages
        }

        return 'all';
    }

    /**
     * Create navigation HTML
     */
    function createNavigation() {
        const basePath = getBasePath();
        const activeId = getActiveNavId();

        const navHtml = NAV_ITEMS.map(item => {
            const href = basePath + item.href;
            const activeClass = activeId === item.id ? ' class="active"' : '';
            return `<a href="${href}"${activeClass}>${item.label}</a>`;
        }).join('\n                ');

        return `<nav class="system-nav" aria-label="Body systems navigation">
                ${navHtml}
            </nav>`;
    }

    /**
     * Inject navigation into the page
     */
    function injectNavigation() {
        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
            placeholder.outerHTML = createNavigation();
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavigation);
    } else {
        injectNavigation();
    }

})();
