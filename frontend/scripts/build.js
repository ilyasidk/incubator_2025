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

console.log('Build complete! Files copied to dist/'); 