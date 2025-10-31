/**
 * Test Setup File
 * Loads utilities and sets up global environment for testing
 */

import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a minimal DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Load utils.js into the global scope
const utilsPath = join(__dirname, '..', 'utils.js');
const utilsCode = readFileSync(utilsPath, 'utf-8');

// Execute utils.js in the window context
const script = new dom.window.Function(utilsCode);
script();

// Make Utils available globally for tests
global.Utils = dom.window.Utils;
