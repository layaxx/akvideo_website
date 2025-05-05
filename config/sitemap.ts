import type { Collection } from "../types/custom.ts"

export function makeSitemapCollection(collection: Collection) {
	const defaultCategory = "Hauptseiten"

	const relevantPages = collection
		.getAll()
		.filter((item) => !(item.data.sitemap.ignore || item.data.nopage))

	const map = new Map<string, string[]>()

	for (const page of relevantPages) {
		const category = page.data.sitemap.category || defaultCategory
		if (map.has(category)) {
			map.get(category)?.push(page.url)
		} else {
			map.set(category, [page.url])
		}
	}

	const returnValue: [string, string[]][] = []
	for (const [category, entries] of map.entries()) {
		returnValue.push([category, entries.sort()])
	}

	return returnValue
}
