const fs = require('fs');
const path = require('path');

const options = {
    html: {
        removeAttributeQuotes: false,
        removeOptionalTags: false
    }
};

var minify = require('minify');

var dirPath = path.resolve(path.dirname(__filename), '../dist/.');

minifyJS(dirPath);

function minifyJS(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css'))) {
            console.log('Minifying: ' + filePath);
            minify(filePath, options)
                .then((content) =>
                    fs.writeFile(filePath, content, function(err) {
                        if (err) throw err;
                    })
                )
                .catch(console.error);
        } else if (stat.isDirectory()) {
            minifyJS(filePath);
        }
    }
}