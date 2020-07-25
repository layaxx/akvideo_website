'use strict';
const fs = require('fs');
const path = require('path');
const sh = require('shelljs');
const { execFile } = require('child_process');
const cwebp = require('cwebp-bin');

module.exports = function renderAssets() {
    const sourcePath = path.resolve(path.dirname(__filename), '../src/assets');
    const destPath = path.resolve(path.dirname(__filename), '../dist/.');

    sh.cp('-R', sourcePath, destPath);

    convertToWebP(path.join(destPath, 'assets/img'));
};

function convertToWebP(dirPath) {
    console.log('### INFO: converting images in directory ' + dirPath);
    try {
        // Get the files as an array
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile() && (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'))) {
                var newFileName = file.split('.')[0];
                newFileName += '.webp';
                execFile(cwebp, [filePath, '-o', path.join(dirPath, newFileName)], (err) => {
                    if (err) {
                        throw err;
                    }
                });
            } else if (stat.isDirectory()) {
                convertToWebP(filePath);
            }
        }
    } catch (e) {
        console.error('Failed to convert images to WebP Format', e);
    }
}