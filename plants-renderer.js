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
        hormonal: { label: 'Hormonal System', class: 'hormonal' }
    };

    /**
     * Determine the base path for plant links
     * Returns 'plants/' for root pages, '' for plant pages
     */
    function getBasePath() {
        const path = window.location.pathname;
        return path.includes('/plants/') ? '' : 'plants/';
    }

    /**
     * Create common names HTML (Danish and French)
     */
    function createCommonNamesHTML(plant) {
        if (!plant.danishName && !plant.frenchName) {
            return '';
        }

        const parts = [];
        if (plant.danishName) {
            parts.push(`<span class="lang-label">DA:</span> ${plant.danishName}`);
        }
        if (plant.frenchName) {
            parts.push(`<span class="lang-label">FR:</span> ${plant.frenchName}`);
        }

        return `<p class="common-names">${parts.join(' · ')}</p>`;
    }

    /**
     * Create system badges HTML
     */
    function createSystemBadgesHTML(plant, useDiv = false) {
        const badges = plant.systems.map(systemId => {
            const system = SYSTEM_CONFIG[systemId];
            if (!system) return '';
            return `<span class="system-badge ${system.class}">${system.label}</span>`;
        }).join(' ');

        if (useDiv) {
            return `<div class="system-badges">${badges}</div>`;
        }
        return `<p>${badges}</p>`;
    }

    /**
     * Create a single plant card HTML
     */
    function createPlantCardHTML(plant, options = {}) {
        const basePath = options.basePath || getBasePath();
        const useDiv = options.useDivForBadges || false;

        const commonNames = createCommonNamesHTML(plant);
        const systemBadges = createSystemBadgesHTML(plant, useDiv);

        return `
            <div class="plant-card ${plant.status}">
                <h3><a href="${basePath}${plant.fileSlug}.html">${plant.commonName}</a></h3>
                <p class="botanical-name">${plant.botanicalName}</p>
                ${commonNames}
                ${systemBadges}
            </div>`;
    }

    /**
     * Filter plants by system
     */
    function filterPlantsBySystem(plants, systemId) {
        if (!systemId) return plants;
        return plants.filter(plant => plant.systems.includes(systemId));
    }

    /**
     * Sort plants alphabetically by common name
     */
    function sortPlants(plants) {
        return [...plants].sort((a, b) =>
            a.commonName.localeCompare(b.commonName)
        );
    }

    /**
     * Render plant cards into a container
     */
    function renderPlantCards(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // Get plants data from global variable (loaded from plants-data.js)
        if (typeof window.PLANTS_DATA === 'undefined') {
            console.error('PLANTS_DATA not loaded. Make sure plants-data.js is included before plants-renderer.js');
            container.innerHTML = '<p class="error">Failed to load plant data. Please refresh the page.</p>';
            return;
        }

        try {
            const plants = window.PLANTS_DATA;

            // Filter by system if specified
            let filteredPlants = filterPlantsBySystem(plants, options.system);

            // Sort alphabetically
            filteredPlants = sortPlants(filteredPlants);

            // Generate HTML
            const html = filteredPlants.map(plant =>
                createPlantCardHTML(plant, options)
            ).join('\n            ');

            // Inject into container
            container.innerHTML = html;

            // Call callback if provided
            if (options.onComplete) {
                options.onComplete(filteredPlants);
            }
        } catch (error) {
            console.error('Error rendering plant cards:', error);
            container.innerHTML = '<p class="error">Failed to load plant data. Please refresh the page.</p>';
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
