import fs from "node:fs"
import matter from "gray-matter"
import z from "zod"

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

export function fetchMovie(slug: string): Movie | null {
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
