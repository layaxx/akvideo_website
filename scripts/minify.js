const fs = require("fs");
const path = require("path");
var UglifyJS = require("uglify-js");
var minify = require("html-minifier").minify;
const { pd: prettyData } = require("pretty-data");

const startingDir = "./_site/";

const minifyDirectory = async (directory) => {
  try {
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      const newPath = path.join(directory, file);

      const stat = await fs.promises.stat(newPath);

      if (
        stat.isFile() &&
        !newPath.includes(".min.") &&
        (newPath.endsWith(".js") ||
          newPath.endsWith(".html") ||
          newPath.endsWith(".xml"))
      ) {
        const contents = fs.readFileSync(newPath, "utf8");
        if (newPath.endsWith(".js")) {
          fs.writeFileSync(newPath, UglifyJS.minify(contents).code);
          console.log("minified: " + newPath);
        } else if (newPath.endsWith(".html")) {
          fs.writeFileSync(
            newPath,
            minify(contents, {
              collapseBooleanAttributes: true,
              collapseWhitespace: true,
              decodeEntities: true,
              html5: true,
              minifyCSS: true,
              minifyJS: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeEmptyElements: false,
              sortAttributes: true,
              sortClassName: true,
              useShortDoctype: true,
            })
          );
          console.log("minified: " + newPath);
        } else if (newPath.endsWith(".xml")) {
          fs.writeFileSync(newPath, prettyData.xmlmin(contents));
          console.log("minified: " + newPath);
        }
      } else if (stat.isDirectory()) {
        minifyDirectory(newPath);
      }
    }
  } catch (e) {
    console.error("Error during minification", e);
  }
};

minifyDirectory(startingDir);
