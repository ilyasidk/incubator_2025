const fs = require('fs-extra');
const path = require('path');

// Ensure the dist directory exists
fs.ensureDirSync(path.join(__dirname, '../dist'));

// HTML files
fs.copySync(
  path.join(__dirname, '../index.html'),
  path.join(__dirname, '../dist/index.html')
);
fs.copySync(
  path.join(__dirname, '../dashboard.html'),
  path.join(__dirname, '../dist/dashboard.html')
);

// JavaScript files
fs.copySync(
  path.join(__dirname, '../script.js'),
  path.join(__dirname, '../dist/script.js')
);
fs.copySync(
  path.join(__dirname, '../dashboard.js'),
  path.join(__dirname, '../dist/dashboard.js')
);

// CSS file
fs.copySync(
  path.join(__dirname, '../style.css'),
  path.join(__dirname, '../dist/style.css')
);

// src directory
fs.copySync(
  path.join(__dirname, '../src'),
  path.join(__dirname, '../dist/src'),
  { filter: (src) => !src.endsWith('.css') || src.endsWith('generator.js') }
);

console.log('Build complete! Files copied to dist/'); 