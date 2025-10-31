/**
 * Search and Filter Functionality
 * Enables searching plants by name and filtering by properties
 */

(function() {
    'use strict';

    let allPlants = [];
    let currentFilters = {
        searchText: '',
        properties: []
    };

    /**
     * Initialize search and filter functionality
     */
    function init() {
        // Store all plants data
        if (typeof window.PLANTS_DATA === 'undefined') {
            console.error('PLANTS_DATA not loaded');
            return;
        }
        allPlants = window.PLANTS_DATA;

        // Set up event listeners
        setupSearchInput();
        setupPropertyFilters();
    }

    /**
     * Set up search input listener
     */
    function setupSearchInput() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        // Debounce search to avoid excessive filtering
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentFilters.searchText = e.target.value.toLowerCase().trim();
                applyFilters();
            }, 300);
        });
    }

    /**
     * Set up property filter listeners
     */
    function setupPropertyFilters() {
        const propertySelect = document.getElementById('property-filter');
        if (!propertySelect) return;

        propertySelect.addEventListener('change', function(e) {
            const selectedProperty = e.target.value;
            if (selectedProperty && !currentFilters.properties.includes(selectedProperty)) {
                addPropertyFilter(selectedProperty);
                e.target.value = ''; // Reset select
            }
        });
    }

    /**
     * Add a property to active filters
     */
    function addPropertyFilter(property) {
        currentFilters.properties.push(property);
        updateActiveFiltersDisplay();
        applyFilters();
    }

    /**
     * Remove a property from active filters
     */
    function removePropertyFilter(property) {
        currentFilters.properties = currentFilters.properties.filter(p => p !== property);
        updateActiveFiltersDisplay();
        applyFilters();
    }

    /**
     * Clear all filters
     */
    function clearAllFilters() {
        currentFilters.searchText = '';
        currentFilters.properties = [];

        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        updateActiveFiltersDisplay();
        applyFilters();
    }

    /**
     * Update the display of active property filters
     */
    function updateActiveFiltersDisplay() {
        const container = document.getElementById('active-filters');
        if (!container) return;

        if (currentFilters.properties.length === 0) {
            container.innerHTML = '';
            return;
        }

        const filterTags = currentFilters.properties.map(prop => `
            <span class="filter-tag">
                ${prop}
                <button class="remove-filter" data-property="${prop}" aria-label="Remove ${prop} filter">×</button>
            </span>
        `).join('');

        container.innerHTML = `
            <div class="active-filters-wrapper">
                ${filterTags}
                <button class="clear-all-filters" id="clear-filters-btn">Clear All</button>
            </div>
        `;

        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                removePropertyFilter(this.dataset.property);
            });
        });

        // Add event listener to clear all button
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearAllFilters);
        }
    }

    /**
     * Filter plants based on current filters
     */
    function filterPlants(plants) {
        let filtered = [...plants];

        // Apply search text filter (searches common name, botanical name, and danish/french names)
        if (currentFilters.searchText) {
            filtered = filtered.filter(plant => {
                const searchText = currentFilters.searchText;
                return (
                    plant.commonName.toLowerCase().includes(searchText) ||
                    plant.botanicalName.toLowerCase().includes(searchText) ||
                    (plant.danishName && plant.danishName.toLowerCase().includes(searchText)) ||
                    (plant.frenchName && plant.frenchName.toLowerCase().includes(searchText))
                );
            });
        }

        // Apply property filters (plant must have ALL selected properties)
        if (currentFilters.properties.length > 0) {
            filtered = filtered.filter(plant => {
                if (!plant.properties || plant.properties.length === 0) return false;

                return currentFilters.properties.every(filterProp =>
                    plant.properties.some(plantProp => plantProp === filterProp)
                );
            });
        }

        return filtered;
    }

    /**
     * Apply current filters and re-render plants
     */
    function applyFilters() {
        const filtered = filterPlants(allPlants);
        renderFilteredPlants(filtered);
        updateResultsCount(filtered.length);
    }

    /**
     * Render filtered plants
     */
    function renderFilteredPlants(plants) {
        const container = document.getElementById('plant-list-container');
        if (!container) return;

        if (plants.length === 0) {
            container.innerHTML = '<p class="no-results">No plants found matching your criteria.</p>';
            return;
        }

        // Sort alphabetically
        const sorted = [...plants].sort((a, b) =>
            a.commonName.localeCompare(b.commonName)
        );

        // Use existing renderer to create cards
        const html = sorted.map(plant => {
            const basePath = 'plants/';
            const commonNames = createCommonNamesHTML(plant);
            const systemBadges = createSystemBadgesHTML(plant);

            return `
                <div class="plant-card ${plant.status}">
                    <h3><a href="${basePath}${plant.fileSlug}.html">${plant.commonName}</a></h3>
                    <p class="botanical-name">${plant.botanicalName}</p>
                    ${commonNames}
                    ${systemBadges}
                </div>`;
        }).join('\n');

        container.innerHTML = html;
    }

    /**
     * Update the results count display
     */
    function updateResultsCount(count) {
        const countElement = document.getElementById('results-count');
        if (!countElement) return;

        const total = allPlants.length;
        if (count === total) {
            countElement.textContent = `Showing all ${total} plants`;
        } else {
            countElement.textContent = `Showing ${count} of ${total} plants`;
        }
    }

    /**
     * Helper function to create common names HTML
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
     * Helper function to create system badges HTML
     */
    function createSystemBadgesHTML(plant) {
        const SYSTEM_CONFIG = window.PlantsRenderer.SYSTEM_CONFIG;
        const badges = plant.systems.map(systemId => {
            const system = SYSTEM_CONFIG[systemId];
            if (!system) return '';
            return `<span class="system-badge ${system.class}">${system.label}</span>`;
        }).join(' ');

        return `<p>${badges}</p>`;
    }

    /**
     * Populate property dropdown with all available properties
     */
    function populatePropertyDropdown() {
        const select = document.getElementById('property-filter');
        if (!select) return;

        // Get all unique properties from plants
        const allProperties = new Set();
        allPlants.forEach(plant => {
            if (plant.properties) {
                plant.properties.forEach(prop => allProperties.add(prop));
            }
        });

        // Sort properties alphabetically
        const sortedProperties = Array.from(allProperties).sort();

        // Create options
        const options = sortedProperties.map(prop =>
            `<option value="${prop}">${prop}</option>`
        ).join('');

        select.innerHTML = `<option value="">Select a property...</option>${options}`;
    }

    // Expose public API
    window.SearchFilter = {
        init,
        clearAllFilters,
        populatePropertyDropdown
    };

})();
