/**
 * Search and Filter Functionality
 * Enables searching plants by name and filtering by properties
 */

(function() {
    'use strict';

    let allPlants = [];
    let currentFilters = {
        searchText: '',
        properties: [],
        family: ''
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
     * Display error message to user
     */
    function showError(message) {
        const container = document.getElementById('plant-list-container');
        if (container) {
            container.innerHTML = '<div class="error-message" role="alert" style="color: red; text-align: center; padding: 20px;">' + escapeHtml(message) + '</div>';
        }
    }

    /**
     * Display info message to user
     */
    function showInfo(message) {
        const container = document.getElementById('plant-list-container');
        if (container) {
            container.innerHTML = '<div class="info-message" role="status" style="color: var(--color-placeholder); text-align: center; padding: 20px;">' + escapeHtml(message) + '</div>';
        }
    }

    /**
     * Initialize search and filter functionality
     */
    function init() {
        // Store all plants data with validation
        if (typeof window.PLANTS_DATA === 'undefined') {
            console.error('[SearchFilter] PLANTS_DATA not loaded');
            showError('Plant database failed to load. Please refresh the page.');
            return;
        }

        if (!Array.isArray(window.PLANTS_DATA)) {
            console.error('[SearchFilter] PLANTS_DATA is not an array');
            showError('Plant database is corrupted. Please contact support.');
            return;
        }

        if (window.PLANTS_DATA.length === 0) {
            console.warn('[SearchFilter] PLANTS_DATA is empty');
            showInfo('No plants available in the database.');
            return;
        }

        allPlants = window.PLANTS_DATA;

        // Validate data structure
        const invalidPlants = allPlants.filter(plant =>
            !plant.commonName || !plant.botanicalName || !plant.systems
        );

        if (invalidPlants.length > 0) {
            console.error('[SearchFilter] Found invalid plant entries:', invalidPlants);
        }

        // Set up event listeners
        setupSearchInput();
        setupPropertyFilters();
        setupFamilyFilter();
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
        currentFilters.family = '';

        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        const familySelect = document.getElementById('family-filter');
        if (familySelect) familySelect.value = '';

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

        const filterTags = currentFilters.properties.map(prop => {
            const escapedProp = escapeHtml(prop);
            return `
                <span class="filter-tag">
                    ${escapedProp}
                    <button class="remove-filter" data-property="${escapedProp}" aria-label="Remove ${escapedProp} filter">×</button>
                </span>
            `;
        }).join('');

        container.innerHTML = `
            <div class="active-filters-wrapper">
                ${filterTags}
                <button class="clear-all-filters" id="clear-filters-btn">Clear All</button>
            </div>
        `;

        // Use event delegation instead of individual listeners
        setupFilterTagListeners();
    }

    /**
     * Setup event listeners for filter tags using event delegation
     */
    function setupFilterTagListeners() {
        const container = document.getElementById('active-filters');
        if (!container) return;

        // Remove old listener if exists
        if (container._filterClickHandler) {
            container.removeEventListener('click', container._filterClickHandler);
        }

        // Add single delegated listener
        container._filterClickHandler = function(e) {
            if (e.target.classList.contains('remove-filter')) {
                const property = e.target.dataset.property;
                if (property) {
                    removePropertyFilter(property);
                }
            } else if (e.target.classList.contains('clear-all-filters') || e.target.id === 'clear-filters-btn') {
                clearAllFilters();
            }
        };

        container.addEventListener('click', container._filterClickHandler);
    }

    /**
     * Set up family filter listener
     */
    function setupFamilyFilter() {
        const familySelect = document.getElementById('family-filter');
        if (!familySelect) return;

        familySelect.addEventListener('change', function(e) {
            currentFilters.family = e.target.value;
            applyFilters();
        });
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

        // Apply family filter
        if (currentFilters.family) {
            filtered = filtered.filter(plant => {
                return plant.family && plant.family === currentFilters.family;
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

        // Use existing renderer to create cards with sanitization
        const html = sorted.map(plant => {
            const basePath = 'plants/';
            const commonNames = createCommonNamesHTML(plant);
            const systemBadges = createSystemBadgesHTML(plant);

            return `
                <div class="plant-card ${escapeHtml(plant.status || '')}">
                    <h3><a href="${basePath}${escapeHtml(plant.fileSlug)}.html">${escapeHtml(plant.commonName)}</a></h3>
                    <p class="botanical-name">${escapeHtml(plant.botanicalName)}</p>
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
     * Helper function to create common names HTML with sanitization
     */
    function createCommonNamesHTML(plant) {
        if (!plant.danishName && !plant.frenchName) {
            return '';
        }

        const parts = [];
        if (plant.danishName) {
            parts.push(`<span class="lang-label">DA:</span> ${escapeHtml(plant.danishName)}`);
        }
        if (plant.frenchName) {
            parts.push(`<span class="lang-label">FR:</span> ${escapeHtml(plant.frenchName)}`);
        }

        return `<p class="common-names">${parts.join(' · ')}</p>`;
    }

    /**
     * Helper function to create system badges HTML with sanitization
     */
    function createSystemBadgesHTML(plant) {
        if (!plant.systems || !Array.isArray(plant.systems)) {
            return '<p></p>';
        }

        const SYSTEM_CONFIG = window.PlantsRenderer ? window.PlantsRenderer.SYSTEM_CONFIG : null;
        if (!SYSTEM_CONFIG) {
            console.warn('[SearchFilter] SYSTEM_CONFIG not available');
            return '<p></p>';
        }

        const badges = plant.systems.map(systemId => {
            const system = SYSTEM_CONFIG[escapeHtml(systemId)];
            if (!system) return '';
            return `<span class="system-badge ${escapeHtml(system.class)}">${escapeHtml(system.label)}</span>`;
        }).join(' ');

        return `<p>${badges}</p>`;
    }

    /**
     * Populate property dropdown with all available properties (with validation and sanitization)
     */
    function populatePropertyDropdown() {
        const select = document.getElementById('property-filter');
        if (!select) return;

        // Get all unique properties from plants with validation
        const allProperties = new Set();
        allPlants.forEach(plant => {
            if (plant.properties && Array.isArray(plant.properties)) {
                plant.properties.forEach(prop => {
                    if (typeof prop === 'string' && prop.trim().length > 0 && prop.length < 200) {
                        allProperties.add(prop.trim());
                    }
                });
            }
        });

        // Sort properties alphabetically
        const sortedProperties = Array.from(allProperties).sort();

        // Create options with sanitization
        const options = sortedProperties.map(prop => {
            const escaped = escapeHtml(prop);
            return `<option value="${escaped}">${escaped}</option>`;
        }).join('');

        select.innerHTML = `<option value="">Select a property...</option>${options}`;
    }

    /**
     * Populate family dropdown with all available botanical families (with validation and sanitization)
     */
    function populateFamilyDropdown() {
        const select = document.getElementById('family-filter');
        if (!select) return;

        // Get all unique families from plants with validation
        const allFamilies = new Set();
        allPlants.forEach(plant => {
            if (plant.family && typeof plant.family === 'string') {
                const family = plant.family.trim();
                if (family.length > 0 && family.length < 200) {
                    allFamilies.add(family);
                }
            }
        });

        // Sort families alphabetically
        const sortedFamilies = Array.from(allFamilies).sort();

        // Create options with sanitization
        const options = sortedFamilies.map(family => {
            const escaped = escapeHtml(family);
            return `<option value="${escaped}">${escaped}</option>`;
        }).join('');

        select.innerHTML = `<option value="">Select a family...</option>${options}`;
    }

    // Expose public API
    window.SearchFilter = {
        init,
        clearAllFilters,
        populatePropertyDropdown,
        populateFamilyDropdown
    };

})();
