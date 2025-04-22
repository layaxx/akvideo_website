const fs = require("fs/promises");
const path = require("path");
var UglifyJS = require("uglify-js");
var minify = require("html-minifier").minify;
const { pd: prettyData } = require("pretty-data");

const minifyDirectory = async (directory) => {
  const files = await fs.readdir(directory);

  await Promise.all(
    files.map(async (file) => {
      const newPath = path.join(directory, file);

      const stat = await fs.stat(newPath);

      if (stat.isFile() && !newPath.includes(".min.") && ["js", "html", "xml"].includes(newPath.split(".").at(-1))) {
        const contents = await fs.readFile(newPath, "utf8");

        if (newPath.endsWith(".js")) {
          await fs.writeFile(newPath, UglifyJS.minify(contents).code);
          console.log("minified: " + newPath);
        } else if (newPath.endsWith(".html")) {
          await fs.writeFile(
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
          await fs.writeFile(newPath, prettyData.xmlmin(contents));
          console.log("minified: " + newPath);
        }
      } else if (stat.isDirectory()) {
        await minifyDirectory(newPath);
      }
    })
  );
};

minifyDirectory("./_site/");
