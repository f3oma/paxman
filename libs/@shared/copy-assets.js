const fs = require('fs-extra');
const path = require('path');

const srcAssetsPath = path.join(__dirname, 'src', 'assets');
const destAssetsPath = path.join(__dirname, 'dist', 'assets');

fs.copySync(srcAssetsPath, destAssetsPath, {
  overwrite: true,
});

console.log('Assets copied to dist folder');