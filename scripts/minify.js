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

function minifyJS(dirPathParam) {
	let flag = false;
	const files = fs.readdirSync(dirPathParam);
	for (const file of files) {
		const filePath = path.join(dirPathParam, file);
		const stat = fs.statSync(filePath);
		if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css'))) {
			flag = true;
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
	if (flag) console.log('### INFO: minified files in directory: ' + dirPathParam);
}
