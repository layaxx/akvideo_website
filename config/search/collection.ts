import lunr from "lunr"
import setupGermanLanguageSupport from "lunr-languages/lunr.de"
import setupStemmerSupport from "lunr-languages/lunr.stemmer.support"
import type { Collection } from "../../types/custom.ts"

setupStemmerSupport(lunr)
setupGermanLanguageSupport(lunr)

export async function makeSearchCollection(collection: Collection) {
	const data = await Promise.all(
		collection.getAll().map(async (page) => {
			if (page.data.sitemap.ignore) {
				console.trace("should not be indexed", page.url)
				return
			}

			const url = page.url
			const title = page.data.title
			const pageData = await page.template.read()

			if (!("content" in pageData) || typeof pageData.content !== "string") {
				console.error(
					"Error in Search Index Generation: pageData.content is not a string",
					pageData,
				)
				return
			}
			const value = {
				content: pageData.content
					.replace(/<[^>]+>/gim, " ") // remove html tags
					.replace(/{{[^}]+}}/gim, " ") // remove liquid interpolations
					.replace(/{%[^%]+%}/gim, " ") // remove liquid tags
					.replace(/\s\s+/gim, " "), // replace multiple whitespaces with a single whitespace
				url,
				title,
				ref: JSON.stringify({ url, title }),
			}

			return value
		}),
	)

	const idx = lunr(function () {
		this.field("content")
		this.field("title")
		this.field("url")
		this.ref("ref")

		const projects = data.filter((p) => p !== undefined)

		for (const project of projects) {
			this.add(project)
		}
	})

	return JSON.stringify(idx)
}
