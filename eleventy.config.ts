import fs from "node:fs"
import Image from "@11ty/eleventy-img"
import metagen from "eleventy-plugin-metagen"
import matter from "gray-matter"
import { parseHTML } from "linkedom"
import lunr from "lunr"
import { z } from "zod"
import type history from "./src/_data/history/index.json"
import type UserConfig from "./types/@11ty/eleventy/UserConfig.d.ts"

const movieSchema = z.object({
	slug: z.string(),
	tags: z.string(),
	title: z.string(),
	nopage: z.boolean(),
	year: z.union([z.string(), z.number()]),
	category: z.string(),
	thumbnail: z.string(),
	contact: z.boolean(),
})

type Movie = z.infer<typeof movieSchema>
type Collection = {
	getAll: () => Array<{
		url: string
		data: {
			title: string
			sitemap: { ignore: boolean; category?: string }
			nopage?: boolean
		}
		template: { read: () => Promise<{ content: string }> }
	}>
	getFilteredByTag: (tag: string) => Array<{ data: { year: number } }>
}

const IMAGE_OPTIONS = {
	urlPath: "/assets/img/",
	outputDir: "./_site/assets/img/",
}

function stringToHash(input: string): string {
	let hash = 0

	for (let i = 0; i < input.length; i++) {
		const char = input.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash &= hash
	}

	return `h-${hash}`
}

async function imageShortcode(src: string, alt: string, classes: string) {
	if (!src) {
		console.error("No Source")
		return
	}

	const metadata = await Image(
		src.startsWith("/") ? `./src${src}` : src,
		IMAGE_OPTIONS,
	)

	const imageAttributes = {
		alt,
		loading: "lazy",
		decoding: "async",
		class: classes,
	}

	// You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
	return Image.generateHTML(metadata, imageAttributes)
}

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
	// eleventyConfig.addTemplateFormats("11ty.ts,11ty.tsx");

	/* CUSTOM FILTERS */
	// 1. unstringify movie
	const fetchMovie = (slug: string): Movie | null => {
		const projectLocation = "./src/projekte/"
		const fileExtension = ".md"
		const path = projectLocation + slug + fileExtension
		console.log(`fetching movie: ${slug}`)
		if (fs.existsSync(path)) {
			const file = matter.read(path)
			const movie = { ...file.data, slug }
			return movieSchema.parse(movie)
		}
		console.error(`invalid path to project: ${slug}`)
		return null
	}
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
	eleventyConfig.addFilter("loadfile", (path: string) => fs.readFileSync(path))

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
	eleventyConfig.addCollection("allSitemapSorted", (collection: Collection) => {
		const defaultCategory = ""
		// FIXME: this is a bit of a mess
		return Object.entries(
			collection
				.getAll()
				.filter((item) => !(item.data.sitemap.ignore || item.data.nopage))
				.reduce((r, a) => {
					r[a.data.sitemap.category || defaultCategory] =
						r[a.data.sitemap.category || defaultCategory] || []
					r[a.data.sitemap.category || defaultCategory].push(a)
					return r
				}, Object.create(null)),
		).map(([category, ...list]) => [
			category,
			...list.sort((a, b) =>
				typeof a === "object" && a && "url" in a && typeof a.url === "string"
					? a.url.localeCompare(
							typeof b === "object" &&
								b &&
								"url" in b &&
								typeof b.url === "string"
								? b.url
								: "undefined",
						)
					: 0,
			), // FIXME: what even is this
		])
	})
	// returns index for search module
	eleventyConfig.addCollection("search_data", (collection: Collection) => {
		const data = collection.getAll().map(async (p) => {
			const url = p.url
			const title = p.data.title
			const pageData = await p.template.read()
			if (!("content" in pageData) || typeof pageData.content !== "string") {
				return
			}
			return {
				content: pageData.content
					.replace(/<[^>]+>/gim, "") // remove html tags
					.replace(/{{[^}]+}}/gim, "") // remove liquid interpolations
					.replace(/{%[^%]+%}/gim, "") // remove liquid tags
					.replace(/\s\s+/gim, " "), // replace multiple whitespaces with a single whitespace
				url,
				title,
				ref: JSON.stringify({ url, title }),
			}
		})

		const idx = lunr(function () {
			this.field("content")
			this.field("title")
			this.field("url")
			this.ref("ref")

			for (const project of data) {
				this.add(project)
			}
		})

		return JSON.stringify(idx)
	})

	/* PLUGINS */
	// 1: generate Metadata
	eleventyConfig.addPlugin(metagen)
	// 2: Images
	eleventyConfig.addLiquidShortcode("image", imageShortcode)

	eleventyConfig.addTransform(
		"transform",
		(content: unknown, outputPath: string) => {
			// apply Image Plugin to Images in Markdown files
			// loosely based on https://gist.github.com/Alexs7zzh/d92ae991ad05ed585d072074ea527b5c
			// biome-ignore lint/complexity/useOptionalChain: <explanation>
			if (outputPath && outputPath.endsWith(".html")) {
				const { document } = parseHTML(content)
				const hashes: string[] = []

				const imagesToBeTransformed = [
					...document.querySelectorAll(".md-content img"),
				].filter(
					(i) =>
						"src" in i &&
						typeof i.src === "string" &&
						!i.src.startsWith("http"),
				)

				for (const i of imagesToBeTransformed) {
					const src = `./src${i.getAttribute("src")}`
					Image(src, IMAGE_OPTIONS)
					const metadata = Image.statsSync(src, IMAGE_OPTIONS)

					const imageAttributes = {
						alt: i.getAttribute("alt") || "",
						loading: "lazy",
						decoding: "async",
						class: "img-fluid",
					}
					const container = document.createElement("div")
					container.className = "md-img "

					const figure = document.createElement("figure")
					figure.innerHTML = Image.generateHTML(metadata, imageAttributes)

					if (i.getAttribute("title")) {
						const caption = document.createElement("figcaption")
						caption.textContent = i.getAttribute("title")
						caption.classList.add("fst-italic")
						figure.append(caption)
					}

					container.appendChild(figure)

					if (i.parentElement === null) {
						console.error("Image has no parent element")
						return
					}

					if (i.parentElement.textContent !== "") {
						i.parentElement.append(container)
					} else {
						i.parentElement.outerHTML = container.outerHTML
					}

					i.remove()
				}

				let currentHash = ""
				const markdownContentChildren = [
					...document.querySelectorAll(".md-content > *"),
				]
				for (const elem of markdownContentChildren) {
					if (elem.tagName === "P") {
						currentHash = stringToHash(elem.textContent ?? "")
						hashes.push(currentHash)
					} else if (elem.tagName === "DIV" && elem.className === "md-img") {
						elem.className = `${elem.className} ${currentHash}`
					}
				}

				const hashSet = [...new Set(hashes)]

				for (const hash of hashSet) {
					const container = document.createElement("div")
					container.className = "row mt-4"
					const first = document.querySelector(`.${hash}`)
					if (first) {
						const clone = first.cloneNode(true)
						if ("className" in clone) {
							clone.className = "col-lg-6 col-md-12 mx-auto"
						} else {
							console.error("clone has no className property")
							return
						}
						container.append(clone)
						first.replaceWith(container)
					}

					const elements = [...document.querySelectorAll(`.${hash}`)]

					for (const elem of elements) {
						elem.className = "col-lg-6 col-md-12 mx-auto"
						container.append(elem)
					}
				}

				return `<!DOCTYPE html>${document.documentElement.outerHTML}`
			}
			return content
		},
	)

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
