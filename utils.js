/**
 * Shared Utility Functions
 * Common utilities used across multiple JavaScript files
 */

(function() {
    'use strict';

    /**
     * Escape HTML to prevent XSS attacks
     * @param {*} unsafe - The string to escape
     * @returns {string} - The escaped string
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
     * Log error with timestamp and namespace
     * @param {string} namespace - The namespace/module name (e.g., 'SearchFilter')
     * @param {string} message - The error message
     * @param {*} data - Optional data to log
     */
    function logError(namespace, message, data) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [${namespace}] ${message}`, data !== undefined ? data : '');
    }

    /**
     * Log warning with timestamp and namespace
     * @param {string} namespace - The namespace/module name
     * @param {string} message - The warning message
     * @param {*} data - Optional data to log
     */
    function logWarn(namespace, message, data) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [${namespace}] ${message}`, data !== undefined ? data : '');
    }

    /**
     * Log info with timestamp and namespace
     * @param {string} namespace - The namespace/module name
     * @param {string} message - The info message
     * @param {*} data - Optional data to log
     */
    function logInfo(namespace, message, data) {
        const timestamp = new Date().toISOString();
        console.info(`[${timestamp}] [${namespace}] ${message}`, data !== undefined ? data : '');
    }

    /**
     * Validate that a value is a non-empty string
     * @param {*} value - The value to validate
     * @returns {boolean} - True if valid string
     */
    function isValidString(value) {
        return typeof value === 'string' && value.length > 0;
    }

    /**
     * Validate that a value is a non-empty array
     * @param {*} value - The value to validate
     * @returns {boolean} - True if valid array
     */
    function isValidArray(value) {
        return Array.isArray(value) && value.length > 0;
    }

    /**
     * Safely get a property from an object with a default value
     * @param {Object} obj - The object to get property from
     * @param {string} key - The property key
     * @param {*} defaultValue - The default value if property doesn't exist
     * @returns {*} - The property value or default
     */
    function safeGet(obj, key, defaultValue = '') {
        if (!obj || typeof obj !== 'object') return defaultValue;
        return obj[key] !== undefined ? obj[key] : defaultValue;
    }

    /**
     * Debounce function execution
     * @param {Function} func - The function to debounce
     * @param {number} wait - The wait time in milliseconds
     * @returns {Function} - The debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Expose public API
    window.Utils = {
        escapeHtml,
        logError,
        logWarn,
        logInfo,
        isValidString,
        isValidArray,
        safeGet,
        debounce
    };

})();
