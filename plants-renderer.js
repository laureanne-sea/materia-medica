/**
 * Plant Card Renderer
 * Dynamically renders plant cards from plants-data.json
 * Eliminates duplicate HTML code across pages
 */

(function() {
    'use strict';

    // System configuration
    const SYSTEM_CONFIG = {
        nervous: { label: 'Nervous System', class: 'nervous' },
        immune: { label: 'Immune System', class: 'immune' },
        digestive: { label: 'Digestive System', class: 'digestive' },
        respiratory: { label: 'Respiratory System', class: 'respiratory' },
        urinary: { label: 'Urinary System', class: 'urinary' },
        cardiovascular: { label: 'Cardiovascular System', class: 'cardiovascular' },
        endocrine: { label: 'Endocrine System', class: 'endocrine' },
        skin: { label: 'Skin System', class: 'skin' },
        'woman-reproductive': { label: 'Woman Reproductive System', class: 'woman-reproductive' },
        'male-reproductive': { label: 'Male Reproductive System', class: 'male-reproductive' }
    };

    /**
     * Escape HTML to prevent XSS attacks
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
     * Validate plant object structure
     */
    function isValidPlant(plant) {
        if (!plant || typeof plant !== 'object') return false;
        if (!plant.commonName || typeof plant.commonName !== 'string') return false;
        if (!plant.botanicalName || typeof plant.botanicalName !== 'string') return false;
        if (!plant.fileSlug || typeof plant.fileSlug !== 'string') return false;
        if (!Array.isArray(plant.systems)) return false;
        return true;
    }

    /**
     * Determine the base path for plant links
     * Returns 'plants/' for root pages, '' for plant pages
     */
    function getBasePath() {
        try {
            const path = window.location.pathname;
            if (typeof path !== 'string') {
                console.error('[PlantsRenderer] Invalid pathname type:', typeof path);
                return 'plants/';
            }
            return path.includes('/plants/') ? '' : 'plants/';
        } catch (error) {
            console.error('[PlantsRenderer] Error in getBasePath:', error);
            return 'plants/';
        }
    }

    /**
     * Create common names HTML (Danish and French)
     */
    function createCommonNamesHTML(plant) {
        try {
            if (!plant || (!plant.danishName && !plant.frenchName)) {
                return '';
            }

            const parts = [];
            if (plant.danishName && typeof plant.danishName === 'string') {
                parts.push(`<span class="lang-label">DA:</span> ${escapeHtml(plant.danishName)}`);
            }
            if (plant.frenchName && typeof plant.frenchName === 'string') {
                parts.push(`<span class="lang-label">FR:</span> ${escapeHtml(plant.frenchName)}`);
            }

            return parts.length > 0 ? `<p class="common-names">${parts.join(' · ')}</p>` : '';
        } catch (error) {
            console.error('[PlantsRenderer] Error in createCommonNamesHTML:', error);
            return '';
        }
    }

    /**
     * Create system badges HTML
     */
    function createSystemBadgesHTML(plant, useDiv = false) {
        try {
            if (!plant || !Array.isArray(plant.systems)) {
                console.warn('[PlantsRenderer] Invalid plant systems:', plant);
                return '';
            }

            const badges = plant.systems
                .map(systemId => {
                    if (typeof systemId !== 'string') {
                        console.warn('[PlantsRenderer] Invalid system ID type:', typeof systemId);
                        return '';
                    }
                    const system = SYSTEM_CONFIG[systemId];
                    if (!system) {
                        console.warn('[PlantsRenderer] Unknown system ID:', systemId);
                        return '';
                    }
                    // escapeHtml for system.class and system.label (defense in depth)
                    return `<span class="system-badge ${escapeHtml(system.class)}">${escapeHtml(system.label)}</span>`;
                })
                .filter(Boolean)
                .join(' ');

            if (!badges) return '';

            if (useDiv) {
                return `<div class="system-badges">${badges}</div>`;
            }
            return `<p>${badges}</p>`;
        } catch (error) {
            console.error('[PlantsRenderer] Error in createSystemBadgesHTML:', error);
            return '';
        }
    }

    /**
     * Create a single plant card HTML
     */
    function createPlantCardHTML(plant, options = {}) {
        try {
            // Validate plant object
            if (!isValidPlant(plant)) {
                console.error('[PlantsRenderer] Invalid plant object:', plant);
                return '';
            }

            const basePath = options.basePath || getBasePath();
            const useDiv = options.useDivForBadges || false;

            const commonNames = createCommonNamesHTML(plant);
            const systemBadges = createSystemBadgesHTML(plant, useDiv);

            // Escape all dynamic content
            const status = plant.status ? escapeHtml(plant.status) : '';
            const fileSlug = escapeHtml(plant.fileSlug);
            const commonName = escapeHtml(plant.commonName);
            const botanicalName = escapeHtml(plant.botanicalName);

            return `
            <div class="plant-card ${status}">
                <h3><a href="${basePath}${fileSlug}.html">${commonName}</a></h3>
                <p class="botanical-name">${botanicalName}</p>
                ${commonNames}
                ${systemBadges}
            </div>`;
        } catch (error) {
            console.error('[PlantsRenderer] Error in createPlantCardHTML:', error);
            return '';
        }
    }

    /**
     * Filter plants by system
     */
    function filterPlantsBySystem(plants, systemId) {
        try {
            if (!Array.isArray(plants)) {
                console.error('[PlantsRenderer] plants is not an array:', typeof plants);
                return [];
            }
            if (!systemId) return plants;

            return plants.filter(plant => {
                if (!plant || !Array.isArray(plant.systems)) {
                    console.warn('[PlantsRenderer] Invalid plant in filterPlantsBySystem:', plant);
                    return false;
                }
                return plant.systems.includes(systemId);
            });
        } catch (error) {
            console.error('[PlantsRenderer] Error in filterPlantsBySystem:', error);
            return [];
        }
    }

    /**
     * Sort plants alphabetically by common name
     */
    function sortPlants(plants) {
        try {
            if (!Array.isArray(plants)) {
                console.error('[PlantsRenderer] plants is not an array in sortPlants:', typeof plants);
                return [];
            }

            return [...plants].sort((a, b) => {
                const nameA = a?.commonName || '';
                const nameB = b?.commonName || '';
                return nameA.localeCompare(nameB);
            });
        } catch (error) {
            console.error('[PlantsRenderer] Error in sortPlants:', error);
            return plants;
        }
    }

    /**
     * Render plant cards into a container
     */
    function renderPlantCards(containerId, options = {}) {
        try {
            // Validate containerId
            if (!containerId || typeof containerId !== 'string') {
                console.error('[PlantsRenderer] Invalid containerId:', containerId);
                return;
            }

            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`[PlantsRenderer] Container with id "${escapeHtml(containerId)}" not found`);
                return;
            }

            // Get plants data from global variable (loaded from plants-data.js)
            if (typeof window.PLANTS_DATA === 'undefined') {
                console.error('[PlantsRenderer] PLANTS_DATA not loaded. Make sure plants-data.js is included before plants-renderer.js');
                container.innerHTML = '<p class="error" role="alert">Failed to load plant data. Please refresh the page.</p>';
                return;
            }

            if (!Array.isArray(window.PLANTS_DATA)) {
                console.error('[PlantsRenderer] PLANTS_DATA is not an array:', typeof window.PLANTS_DATA);
                container.innerHTML = '<p class="error" role="alert">Plant data is corrupted. Please contact support.</p>';
                return;
            }

            const plants = window.PLANTS_DATA;

            // Filter by system if specified
            let filteredPlants = filterPlantsBySystem(plants, options.system);

            // Sort alphabetically
            filteredPlants = sortPlants(filteredPlants);

            // Validate filtered plants
            const validPlants = filteredPlants.filter(plant => isValidPlant(plant));
            if (validPlants.length < filteredPlants.length) {
                console.warn('[PlantsRenderer] Filtered out invalid plants:', filteredPlants.length - validPlants.length);
            }

            if (validPlants.length === 0) {
                container.innerHTML = '<p class="info" role="status">No plants found for this category.</p>';
                return;
            }

            // Generate HTML
            const html = validPlants
                .map(plant => createPlantCardHTML(plant, options))
                .filter(Boolean)
                .join('\n            ');

            // Inject into container
            container.innerHTML = html;

            // Call callback if provided
            if (options.onComplete && typeof options.onComplete === 'function') {
                try {
                    options.onComplete(validPlants);
                } catch (callbackError) {
                    console.error('[PlantsRenderer] Error in onComplete callback:', callbackError);
                }
            }
        } catch (error) {
            console.error('[PlantsRenderer] Error rendering plant cards:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p class="error" role="alert">Failed to load plant data. Please refresh the page.</p>';
            }
        }
    }

    /**
     * Render plant cards for a specific system page
     */
    function renderSystemPage(systemId) {
        renderPlantCards('plant-list-container', {
            system: systemId,
            basePath: 'plants/',
            useDivForBadges: false
        });
    }

    /**
     * Render all plants for the index page
     */
    function renderIndexPage() {
        renderPlantCards('plant-list-container', {
            system: null,
            basePath: 'plants/',
            useDivForBadges: false
        });
    }

    // Expose public API
    window.PlantsRenderer = {
        renderPlantCards,
        renderSystemPage,
        renderIndexPage,
        SYSTEM_CONFIG
    };

})();
