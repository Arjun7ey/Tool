// src/polyfills.js

// Polyfill for global in browser environment
if (typeof global === 'undefined') {
    var global = window;
}
