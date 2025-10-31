/**
 * Shared Navigation Component
 * Automatically injects navigation into all pages
 */

(function() {
    'use strict';

    // Navigation structure - single source of truth
    const NAV_ITEMS = [
        { href: 'index.html', label: 'All Plants', id: 'all' },
        { href: 'property-statistics.html', label: 'Properties', id: 'properties' },
        { href: 'nervous-system.html', label: 'Nervous System', id: 'nervous' },
        { href: 'immune-system.html', label: 'Immune System', id: 'immune' },
        { href: 'digestive-system.html', label: 'Digestive System', id: 'digestive' },
        { href: 'respiratory-system.html', label: 'Respiratory System', id: 'respiratory' },
        { href: 'urinary-system.html', label: 'Urinary System', id: 'urinary' },
        { href: 'cardiovascular-system.html', label: 'Cardiovascular System', id: 'cardiovascular' },
        { href: 'endocrine-system.html', label: 'Endocrine System', id: 'endocrine' },
        { href: 'skin-system.html', label: 'Skin System', id: 'skin' },
        { href: 'woman-reproductive-system.html', label: 'Woman Reproductive', id: 'woman-reproductive' },
        { href: 'male-reproductive-system.html', label: 'Male Reproductive', id: 'male-reproductive' }
    ];

    /**
     * Determine the base path for navigation links
     * Returns '../' for plant pages, '' for root pages
     */
    function getBasePath() {
        try {
            const path = window.location.pathname;
            if (typeof path !== 'string') {
                console.error('[Navigation] Invalid pathname type:', typeof path);
                return '';
            }
            return path.includes('/plants/') ? '../' : '';
        } catch (error) {
            console.error('[Navigation] Error in getBasePath:', error);
            return '';
        }
    }

    /**
     * Determine which nav item should be active
     */
    function getActiveNavId() {
        try {
            const path = window.location.pathname;
            if (typeof path !== 'string') {
                console.error('[Navigation] Invalid pathname type in getActiveNavId:', typeof path);
                return 'all';
            }

            const filename = path.split('/').pop();
            if (!filename) {
                console.warn('[Navigation] Could not extract filename from path:', path);
                return 'all';
            }

            // Check for exact matches
            for (const item of NAV_ITEMS) {
                if (!item || !item.href || !item.id) {
                    console.warn('[Navigation] Invalid nav item:', item);
                    continue;
                }
                if (filename === item.href) {
                    return item.id;
                }
            }

            // Default to 'all' for plant detail pages
            if (path.includes('/plants/')) {
                return null; // No active state on plant pages
            }

            return 'all';
        } catch (error) {
            console.error('[Navigation] Error in getActiveNavId:', error);
            return 'all';
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Create navigation HTML
     */
    function createNavigation() {
        try {
            const basePath = getBasePath();
            const activeId = getActiveNavId();

            if (!Array.isArray(NAV_ITEMS) || NAV_ITEMS.length === 0) {
                console.error('[Navigation] Invalid NAV_ITEMS configuration');
                return '<nav class="system-nav" aria-label="Body systems navigation"><p>Navigation unavailable</p></nav>';
            }

            const navHtml = NAV_ITEMS.map(item => {
                if (!item || !item.href || !item.label) {
                    console.warn('[Navigation] Skipping invalid nav item:', item);
                    return '';
                }
                const href = escapeHtml(basePath + item.href);
                const label = escapeHtml(item.label);
                const activeClass = activeId === item.id ? ' class="active"' : '';
                return `<a href="${href}"${activeClass}>${label}</a>`;
            }).filter(Boolean).join('\n                ');

            return `<nav class="system-nav" aria-label="Body systems navigation">
                ${navHtml}
            </nav>`;
        } catch (error) {
            console.error('[Navigation] Error in createNavigation:', error);
            return '<nav class="system-nav" aria-label="Body systems navigation"><p>Navigation error</p></nav>';
        }
    }

    /**
     * Inject navigation into the page
     */
    function injectNavigation() {
        try {
            const placeholder = document.getElementById('nav-placeholder');
            if (!placeholder) {
                console.error('[Navigation] nav-placeholder element not found');
                return;
            }

            const navHtml = createNavigation();
            if (!navHtml || typeof navHtml !== 'string') {
                console.error('[Navigation] Invalid navigation HTML generated');
                placeholder.innerHTML = '<p style="color: red; text-align: center;">Navigation failed to load</p>';
                return;
            }

            placeholder.outerHTML = navHtml;
        } catch (error) {
            console.error('[Navigation] Error in injectNavigation:', error);
            const placeholder = document.getElementById('nav-placeholder');
            if (placeholder) {
                placeholder.innerHTML = '<p style="color: red; text-align: center;">Navigation error occurred</p>';
            }
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavigation);
    } else {
        injectNavigation();
    }

})();
