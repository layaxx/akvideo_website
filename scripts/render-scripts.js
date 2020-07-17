'use strict';
const fs = require('fs');
const packageJSON = require('../package.json');
const path = require('path');
const sh = require('shelljs');

module.exports = function renderScripts() {
    const sourcePath = path.resolve(path.dirname(__filename), '../src/js/scripts.js');
    const destPath = path.resolve(path.dirname(__filename), '../dist/js/scripts.js');

    const sourcePath2 = path.resolve(path.dirname(__filename), '../src/js/bootstrap-toc.min.js');
    const destPath2 = path.resolve(path.dirname(__filename), '../dist/js/bootstrap-toc.min.js');

    const sourcePath3 = path.resolve(path.dirname(__filename), '../src/js/loadxml.js');
    const destPath3 = path.resolve(path.dirname(__filename), '../dist/js/loadxml.js');

    const copyright = `/*!
    * Start Bootstrap - ${packageJSON.title} v${packageJSON.version} (${packageJSON.homepage})
    * Copyright 2013-${new Date().getFullYear()} ${packageJSON.author}
    * Licensed under ${packageJSON.license} (https://github.com/BlackrockDigital/${packageJSON.name}/blob/master/LICENSE)
    */
    `
    const scriptsJS = fs.readFileSync(sourcePath);
    const destPathDirname = path.dirname(destPath);

    const TOC = fs.readFileSync(sourcePath2)

    if (!sh.test('-e', destPathDirname)) {
        sh.mkdir('-p', destPathDirname);
    }

    fs.writeFileSync(destPath, copyright + scriptsJS);
    fs.writeFileSync(destPath2, TOC);
    fs.writeFileSync(destPath3, fs.readFileSync(sourcePath3));
};