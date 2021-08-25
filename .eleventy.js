const fs = require("fs");
const matter = require("gray-matter");

module.exports = function (eleventyConfig) {
  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js":
      "./assets/js/bootstrap.min.js",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/assets/img");

  // Copy favicon to /_site
  eleventyConfig.addPassthroughCopy("./src/favicon.ico");

  eleventyConfig.setBrowserSyncConfig({
    files: "./_site/assets/css/**/*.css",
  });

  eleventyConfig.addWatchTarget("./src/assets/styles/");

  // custom filters:
  // 1. unstringify movie
  eleventyConfig.addFilter("makeMovie", function (slug) {
    const projectLocation = "./src/projects/";
    const fileExtension = ".md";
    const path = projectLocation + slug + fileExtension;
    if (fs.existsSync(path)) {
      const file = matter.read(path);
      return { ...file.data };
    } else {
      console.error("invalid path to project: " + slug);
      return {};
    }
  });

  return {
    dir: {
      input: "src",
    },
  };
};
