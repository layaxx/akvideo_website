import type { Collection } from "../types/custom.ts"

export function makeSitemapCollection(collection: Collection) {
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
}
