const fs = require("fs");
const matter = require("gray-matter");
const lunr = require("lunr");

module.exports = function (eleventyConfig) {
  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js":
      "./assets/js/bootstrap.min.js",
    "./node_modules/lunr/lunr.min.js": "./assets/js/lunr.min.js",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/fontawesome");
  eleventyConfig.addPassthroughCopy("./src/assets/js");

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
      return { ...file.data, slug };
    } else {
      console.error("invalid path to project: " + slug);
      return {};
    }
  });
  // 2. remove leading slash (used in navigation)
  eleventyConfig.addFilter("remove_leading_slash", function (string) {
    if (string.charAt(0) === "/") {
      return string.slice(1);
    }
    return string;
  });
  // 3. technically not a filter. returns projects in reverse chronological order, grouped by year
  eleventyConfig.addCollection("projects_ordered", function (collection) {
    return Object.entries(
      collection.getFilteredByTag("project").reduce(function (r, a) {
        r[a.data.year] = r[a.data.year] || [];
        r[a.data.year].push(a);
        return r;
      }, Object.create(null))
    ).reverse();
  });
  eleventyConfig.addCollection("search_data", function (collection) {
    const data = collection.getAll().map((p) => {
      return {
        content: p.template.frontMatter.content
          .replace(/<[^>]+>/gim, "") // remove html tags
          .replace(/{{[^}]+}}/gim, "") // remove liquid interpolations
          .replace(/{%[^%]+%}/gim, "") // remove liquid tags
          .replace(/\s\s+/gim, " ") // replace multiple whitespaces with a single whitespace
          .replace(/\\./, ""), // remove escape sequences
        url: p.url,
        title: p.data.title,
      };
    });

    const idx = lunr(function () {
      this.field("content");
      this.field("title");
      this.field("url");
      this.ref("url");

      data.forEach((project) => this.add(project), this);
    });

    return JSON.stringify(idx);
  });

  return {
    dir: {
      input: "src",
    },
  };
};
