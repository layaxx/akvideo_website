import Image from "@11ty/eleventy-img"

export const IMAGE_OPTIONS = {
	urlPath: "/assets/img/",
	outputDir: "./_site/assets/img/",
}

export async function imageShortcode(
	src: string,
	alt: string,
	classes: string,
) {
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

	return Image.generateHTML(metadata, imageAttributes)
}
