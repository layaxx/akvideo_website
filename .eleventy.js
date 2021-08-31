const fs = require("fs");
const matter = require("gray-matter");
const lunr = require("lunr");
const metagen = require("eleventy-plugin-metagen");
const Image = require("@11ty/eleventy-img");
const { parseHTML } = require("linkedom");

const IMAGE_OPTIONS = {
  urlPath: "/assets/img/",
  outputDir: "./_site/assets/img/",
};

function stringToHash(string) {
  var hash = 0;

  if (string.length == 0) return hash;

  for (i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash;
}

async function imageShortcode(src, alt, classes) {
  if (src && src.startsWith("/")) {
    src = "./src" + src;
  } else if (!src) {
    console.warn("ndsaoipö");
    return;
  }
  let metadata = await Image(src, IMAGE_OPTIONS);

  let imageAttributes = {
    alt,
    loading: "lazy",
    decoding: "async",
    class: classes,
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setDataDeepMerge(true);

  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js":
      "./assets/js/bootstrap.min.js",
    "./node_modules/lunr/lunr.min.js": "./assets/js/lunr.min.js",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/webfonts");
  eleventyConfig.addPassthroughCopy({
    "./src/assets/js/passthrough": "./assets/js",
  });

  eleventyConfig.setBrowserSyncConfig({
    files: "./_site/assets/css/**/*.css",
  });

  eleventyConfig.addWatchTarget("./src/assets/styles/");

  /* CUSTOM FILTERS */
  // 1. unstringify movie
  const fetchMovie = (slug) => {
    const projectLocation = "./src/projekte/";
    const fileExtension = ".md";
    const path = projectLocation + slug + fileExtension;
    if (fs.existsSync(path)) {
      const file = matter.read(path);
      return { ...file.data, slug };
    } else {
      console.error("invalid path to project: " + slug);
      return {};
    }
  };
  eleventyConfig.addFilter("makeMovie", fetchMovie);
  // 2. remove leading slash (used in navigation)
  eleventyConfig.addFilter("remove_leading_slash", function (string) {
    if (string.charAt(0) === "/") {
      return string.slice(1);
    }
    return string;
  });
  // 3. format timeline data properly
  eleventyConfig.addFilter("buildTimelineData", function (data) {
    const eras = data.eras.map((era) => {
      return {
        text: { headline: era.headline },
        start_date: { year: era.start_year },
        end_date: { year: era.end_year },
      };
    });
    const events = [
      ...data.films.map(({ headline, text, group, film }) => {
        const movie = fetchMovie(film);

        return {
          media: {
            url: movie.thumbnail,
            caption: `${movie.title} (${movie.category}, ${movie.year})`,
            link: "/projekte/" + movie.slug,
          },
          start_date: { year: movie.year },
          text: { headline, text },
          group,
        };
      }),
      ...data.events.map(({ year, media, caption, link, headline, text }) => {
        return {
          media: {
            url: media,
            caption,
            link,
          },
          start_date: { year },
          text: { headline, text },
        };
      }),
    ];
    return { events, eras };
  });
  eleventyConfig.addFilter("loadfile", function (path) {
    return fs.readFileSync(path);
  });

  /* COLLECTIONS */
  // returns projects in reverse chronological order, grouped by year
  eleventyConfig.addCollection("projects_ordered", function (collection) {
    return Object.entries(
      collection.getFilteredByTag("project").reduce(function (r, a) {
        r[a.data.year] = r[a.data.year] || [];
        r[a.data.year].push(a);
        return r;
      }, Object.create(null))
    ).reverse();
  });
  // returns sorted page data for use in sitemap
  eleventyConfig.addCollection("allSitemapSorted", function (collection) {
    const defaultCategory = "";
    return Object.entries(
      collection
        .getAll()
        .filter((item) => !item.data.sitemap.ignore && !item.data.nopage)
        .reduce(function (r, a) {
          r[a.data.sitemap.category || defaultCategory] =
            r[a.data.sitemap.category || defaultCategory] || [];
          r[a.data.sitemap.category || defaultCategory].push(a);
          return r;
        }, Object.create(null))
    ).map(([category, ...list]) => [
      category,
      ...list.sort((a, b) => a.url.localeCompare(b.url)),
    ]);
  });
  // returns index for search module
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

  /* PLUGINS */
  // 1: generate Metadata
  eleventyConfig.addPlugin(metagen);
  // 2: Images
  eleventyConfig.addLiquidShortcode("image", imageShortcode);

  eleventyConfig.addTransform("transform", (content, outputPath) => {
    // apply Image Plugin to Images in Markdown files
    // loosely based on https://gist.github.com/Alexs7zzh/d92ae991ad05ed585d072074ea527b5c
    if (outputPath && outputPath.endsWith(".html")) {
      let { document } = parseHTML(content);
      const hashes = [];

      [...document.querySelectorAll(".md-content img")]
        .filter((i) => !i.src.startsWith("http"))
        .forEach((i) => {
          const src = "./src" + i.getAttribute("src");
          Image(src, IMAGE_OPTIONS);
          const metadata = Image.statsSync(src, IMAGE_OPTIONS);
          let imageAttributes = {
            alt: i.getAttribute("alt") || "",
            loading: "lazy",
            decoding: "async",
            class: "img-fluid",
          };
          const container = document.createElement("div");
          container.className =
            "md-img " + stringToHash(i.parentElement.innerText);
          hashes.push(stringToHash(i.parentElement.innerText));

          container.innerHTML = Image.generateHTML(metadata, imageAttributes);
          i.parentElement.append(container);
          i.remove();
        });

      [...new Set(hashes)].forEach((hash) => {
        const container = document.createElement("div");
        container.className = "row mt-4";

        const parent = document.querySelector("." + hash).parentElement;
        [...document.querySelectorAll("." + hash)].forEach((elem) => {
          elem.className = "col-lg-6 col-md-12 mx-auto";
          container.append(elem);
        });
        parent.append(container);
      });

      return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
    }
    return content;
  });

  return {
    dir: {
      input: "src",
    },
  };
};
