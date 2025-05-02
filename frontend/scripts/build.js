const fs = require('fs-extra');
const path = require('path');

// Убедиться, что каталог dist существует
fs.ensureDirSync(path.join(__dirname, '../dist'));

// HTML-файлы
fs.copySync(
  path.join(__dirname, '../index.html'),
  path.join(__dirname, '../dist/index.html')
);
fs.copySync(
  path.join(__dirname, '../dashboard.html'),
  path.join(__dirname, '../dist/dashboard.html')
);

// JavaScript-файлы
fs.copySync(
  path.join(__dirname, '../script.js'),
  path.join(__dirname, '../dist/script.js')
);
fs.copySync(
  path.join(__dirname, '../dashboard.js'),
  path.join(__dirname, '../dist/dashboard.js')
);

// CSS-файл
fs.copySync(
  path.join(__dirname, '../style.css'),
  path.join(__dirname, '../dist/style.css')
);

