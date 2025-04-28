import fs from "node:fs";
import matter from "gray-matter";
import lunr from "lunr";
import metagen from "eleventy-plugin-metagen";
import Image from "@11ty/eleventy-img";
import { parseHTML } from "linkedom";
import history from "./src/_data/history/index.json";
import { z } from "zod";
import UserConfig from "./types/@11ty/eleventy/UserConfig";

const movieSchema = z.object({ slug: z.string(), tags: z.string(), title: z.string(), nopage: z.boolean(), year: z.union([z.string(), z.number()]), category: z.string(), thumbnail: z.string(), contact: z.boolean() });

type Movie = z.infer<typeof movieSchema>;
type Collection = {
  getAll: () => Array<{ url: string; data: { title: string; sitemap: { ignore: boolean; category?: string }; nopage?: boolean }; template: { read: () => Promise<{ content: string }> } }>;
  getFilteredByTag: (tag: string) => Array<{ data: { year: number } }>;
};

const IMAGE_OPTIONS = {
  urlPath: "/assets/img/",
  outputDir: "./_site/assets/img/",
};

function stringToHash(input: string): string {
  var hash = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return "h-" + hash;
}

async function imageShortcode(src: string, alt: string, classes: string) {
  if (src && src.startsWith("/")) {
    src = "./src" + src;
  } else if (!src) {
    console.warn("No Source");
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

export default function (eleventyConfig: UserConfig) {
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
  });

  eleventyConfig // Copy Static Files to /_Site
    .addPassthroughCopy({
      "./src/admin/config.yml": "./admin/config.yml",
      "./node_modules/bootstrap/dist/js/bootstrap.min.js": "./assets/js/bootstrap.min.js",
      "./node_modules/lunr/lunr.min.js": "./assets/js/lunr.min.js",
    });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/webfonts");
  eleventyConfig.addPassthroughCopy({
    "./src/assets/js/passthrough": "./assets/js",
  });

  eleventyConfig.addWatchTarget("./src/assets/styles/");
  // eleventyConfig.addTemplateFormats("11ty.ts,11ty.tsx");

  /* CUSTOM FILTERS */
  // 1. unstringify movie
  const fetchMovie = (slug: string): Movie | null => {
    const projectLocation = "./src/projekte/";
    const fileExtension = ".md";
    const path = projectLocation + slug + fileExtension;
    console.log("fetching movie: " + slug);
    if (fs.existsSync(path)) {
      const file = matter.read(path);
      const movie = { ...file.data, slug };
      return movieSchema.parse(movie);
    } else {
      console.error("invalid path to project: " + slug);
      return null;
    }
  };
  eleventyConfig.addFilter("makeMovie", fetchMovie);
  // 2. remove leading slash (used in navigation)
  eleventyConfig.addFilter("remove_leading_slash", function (input: string) {
    if (input.charAt(0) === "/") {
      return input.slice(1);
    }
    return input;
  });
  // 3. format timeline data properly
  eleventyConfig.addFilter("buildTimelineData", function (data: typeof history.timeline) {
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

        if (!movie) {
          console.error("invalid path to project: " + film);
          return null;
        }

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
    return JSON.stringify({ events, eras });
  });
  eleventyConfig.addFilter("loadfile", function (path: string) {
    return fs.readFileSync(path);
  });

  /* COLLECTIONS */
  // returns projects in reverse chronological order, grouped by year
  eleventyConfig.addCollection("projects_ordered", function (collection: Collection) {
    return Object.entries(
      collection.getFilteredByTag("project").reduce(function (r, a) {
        r[a.data.year] = r[a.data.year] || [];
        r[a.data.year].push(a);
        return r;
      }, Object.create(null))
    ).reverse();
  });
  // returns sorted page data for use in sitemap
  eleventyConfig.addCollection("allSitemapSorted", function (collection: Collection) {
    const defaultCategory = "";
    // FIXME: this is a bit of a mess
    return Object.entries(
      collection
        .getAll()
        .filter((item) => !item.data.sitemap.ignore && !item.data.nopage)
        .reduce(function (r, a) {
          r[a.data.sitemap.category || defaultCategory] = r[a.data.sitemap.category || defaultCategory] || [];
          r[a.data.sitemap.category || defaultCategory].push(a);
          return r;
        }, Object.create(null))
    ).map(([category, ...list]) => [
      category,
      ...list.sort((a, b) => (typeof a == "object" && a && "url" in a && typeof a.url === "string" ? a.url.localeCompare(typeof b === "object" && b && "url" in b && typeof b.url === "string" ? b.url : "undefined") : 0)), // FIXME: what even is this
    ]);
  });
  // returns index for search module
  eleventyConfig.addCollection("search_data", function (collection: Collection) {
    const data = collection.getAll().map(async (p) => {
      const url = p.url;
      const title = p.data.title;
      const pageData = await p.template.read();
      if (!("content" in pageData) || typeof pageData.content !== "string") {
        return;
      }
      return {
        content: pageData.content
          .replace(/<[^>]+>/gim, "") // remove html tags
          .replace(/{{[^}]+}}/gim, "") // remove liquid interpolations
          .replace(/{%[^%]+%}/gim, "") // remove liquid tags
          .replace(/\s\s+/gim, " ") // replace multiple whitespaces with a single whitespace
          .replace(/\\./, ""), // remove escape sequences
        url,
        title,
        ref: JSON.stringify({ url, title }),
      };
    });

    const idx = lunr(function () {
      this.field("content");
      this.field("title");
      this.field("url");
      this.ref("ref");

      data.forEach((project) => this.add(project), this);
    });

    return JSON.stringify(idx);
  });

  /* PLUGINS */
  // 1: generate Metadata
  eleventyConfig.addPlugin(metagen);
  // 2: Images
  eleventyConfig.addLiquidShortcode("image", imageShortcode);

  eleventyConfig.addTransform("transform", (content: unknown, outputPath: string) => {
    // apply Image Plugin to Images in Markdown files
    // loosely based on https://gist.github.com/Alexs7zzh/d92ae991ad05ed585d072074ea527b5c
    if (outputPath && outputPath.endsWith(".html")) {
      let { document } = parseHTML(content);
      const hashes: string[] = [];

      [...document.querySelectorAll(".md-content img")]
        .filter((i) => "src" in i && typeof i.src === "string" && !i.src.startsWith("http"))
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
          container.className = "md-img ";

          const figure = document.createElement("figure");
          figure.innerHTML = Image.generateHTML(metadata, imageAttributes);

          if (i.getAttribute("title")) {
            const caption = document.createElement("figcaption");
            caption.textContent = i.getAttribute("title");
            caption.classList.add("fst-italic");
            figure.append(caption);
          }

          container.appendChild(figure);

          if (i.parentElement === null) {
            console.error("Image has no parent element");
            return;
          }

          if (i.parentElement.textContent !== "") {
            i.parentElement.append(container);
          } else {
            i.parentElement.outerHTML = container.outerHTML;
          }

          i.remove();
        });

      let currentHash: string;
      [...document.querySelectorAll(".md-content > *")].forEach((elem) => {
        if (elem.tagName === "P") {
          currentHash = stringToHash(elem.textContent ?? "");
          hashes.push(currentHash);
        } else if (elem.tagName === "DIV" && elem.className === "md-img") {
          elem.className = elem.className + " " + currentHash;
        }
      });
      [...new Set(hashes)].forEach((hash) => {
        const container = document.createElement("div");
        container.className = "row mt-4";
        const first = document.querySelector("." + hash);
        if (first) {
          const clone = first.cloneNode(true);
          if ("className" in clone) {
            clone.className = "col-lg-6 col-md-12 mx-auto";
          } else {
            console.error("clone has no className property");
            return;
          }
          container.append(clone);
          first.replaceWith(container);
        }
        [...document.querySelectorAll("." + hash)].forEach((elem) => {
          elem.className = "col-lg-6 col-md-12 mx-auto";
          container.append(elem);
        });
      });

      return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
    }
    return content;
  });

  /*   eleventyConfig.addExtension(["11ty.jsx", "11ty.ts", "11ty.tsx"], {
    key: "11ty.js",
    compile: function () {
      return async function (data) {
        let content = await this.defaultRenderer(data);
        return renderToStaticMarkup(content);
      };
    },
  });
 */
  return {
    dir: {
      input: "src",
    },
  };
}
