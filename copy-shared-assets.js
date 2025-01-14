const fs = require('fs-extra');
const path = require('path');
const { workspaceRoot } = require('@nx/js');

// Define the source and destination directories
const srcDir = path.resolve(__dirname, 'libs/@shared/src/assets'); // Path to assets in @shared
const destDir = path.resolve(__dirname, 'dist/libs/@shared/src/assets'); // Path to app's assets folder

// Merge the source into the destination directory
fs.copySync(srcDir, destDir, { overwrite: true }, (err) => {
  if (err) {
    console.error('Error copying assets:', err);
  } else {
    console.log('Assets successfully merged into the destination folder.');
  }
});