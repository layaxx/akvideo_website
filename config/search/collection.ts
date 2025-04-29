import lunr from "lunr"
import type { Collection } from "../../types/custom.ts"

export function makeSearchCollection(collection: Collection) {
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
}
