import metagen from "eleventy-plugin-metagen"
import { fetchMovie } from "./config/fetchMovie.ts"
import { imageShortcode, transformImages } from "./config/image.ts"
import { makeSearchCollection } from "./config/search/collection.ts"
import { makeSitemapCollection } from "./config/sitemap.ts"
import type history from "./src/_data/history/index.json"
import type UserConfig from "./types/@11ty/eleventy/UserConfig.d.ts"
import type { Collection } from "./types/custom.ts"

// biome-ignore lint/style/noDefaultExport: needs to be default export for 11ty
export default function (eleventyConfig: UserConfig) {
	eleventyConfig.setDataDeepMerge(true)

	eleventyConfig.setLiquidOptions({
		dynamicPartials: false,
	})

	eleventyConfig // Copy Static Files to /_Site
		.addPassthroughCopy({
			"./src/admin/config.yml": "./admin/config.yml",
			"./node_modules/bootstrap/dist/js/bootstrap.min.js":
				"./assets/js/bootstrap.min.js",
			"./node_modules/lunr/lunr.min.js": "./assets/js/lunr.min.js",
		})

	// Copy Image Folder to /_site
	eleventyConfig.addPassthroughCopy("./src/assets/img")
	eleventyConfig.addPassthroughCopy("./src/assets/webfonts")
	eleventyConfig.addPassthroughCopy({
		"./src/assets/js/passthrough": "./assets/js",
	})

	eleventyConfig.addWatchTarget("./src/assets/styles/")
	eleventyConfig.addWatchTarget("./config/")
	// eleventyConfig.addTemplateFormats("11ty.ts,11ty.tsx");

	/* CUSTOM FILTERS */
	// 1. unstringify movie
	eleventyConfig.addFilter("makeMovie", fetchMovie)
	// 2. remove leading slash (used in navigation)
	eleventyConfig.addFilter("remove_leading_slash", (input: string) => {
		if (input.charAt(0) === "/") {
			return input.slice(1)
		}
		return input
	})
	// 3. format timeline data properly
	eleventyConfig.addFilter(
		"buildTimelineData",
		(data: typeof history.timeline) => {
			const eras = data.eras.map((era) => {
				return {
					text: { headline: era.headline },
					start_date: { year: era.start_year },
					end_date: { year: era.end_year },
				}
			})
			const events = [
				...data.films.map(({ headline, text, group, film }) => {
					const movie = fetchMovie(film)

					if (!movie) {
						console.error("invalid path to project", film)
						return null
					}

					return {
						media: {
							url: movie.thumbnail,
							caption: `${movie.title} (${movie.category}, ${movie.year})`,
							link: `/projekte/${movie.slug}`,
						},
						start_date: { year: movie.year },
						text: { headline, text },
						group,
					}
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
					}
				}),
			]
			return JSON.stringify({ events, eras })
		},
	)

	/* COLLECTIONS */
	// returns projects in reverse chronological order, grouped by year
	eleventyConfig.addCollection("projects_ordered", (collection: Collection) =>
		Object.entries(
			collection.getFilteredByTag("project").reduce((r, a) => {
				r[a.data.year] = r[a.data.year] || []
				r[a.data.year].push(a)
				return r
			}, Object.create(null)),
		).reverse(),
	)
	// returns sorted page data for use in sitemap
	eleventyConfig.addCollection("allSitemapSorted", makeSitemapCollection)
	// returns index for search module
	eleventyConfig.addCollection("search_data", makeSearchCollection)

	/* PLUGINS */
	// 1: generate Metadata
	eleventyConfig.addPlugin(metagen)
	// 2: Images
	eleventyConfig.addLiquidShortcode("image", imageShortcode)
	// 3: Image from Markdown Files
	eleventyConfig.addTransform("transformImages", transformImages)

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
	}
}
