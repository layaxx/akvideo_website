import Image from "@11ty/eleventy-img"
import { parseHTML } from "linkedom"
import { stringToHash } from "./utils.ts"

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

	// You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
	return Image.generateHTML(metadata, imageAttributes)
}

function makeImage(image: HTMLImageElement, document: Document) {
	const newSource = `./src${image.getAttribute("src")}`
	Image(newSource, IMAGE_OPTIONS)
	const metadata = Image.statsSync(newSource, IMAGE_OPTIONS)

	const imageAttributes = {
		alt: image.getAttribute("alt") || "",
		loading: "lazy",
		decoding: "async",
		class: "img-fluid",
	}
	const container = document.createElement("div")
	container.className = "md-img "

	const figure = document.createElement("figure")
	figure.innerHTML = Image.generateHTML(metadata, imageAttributes)

	if (image.getAttribute("title")) {
		const caption = document.createElement("figcaption")
		caption.textContent = image.getAttribute("title")
		caption.classList.add("fst-italic")
		figure.append(caption)
	}

	container.appendChild(figure)

	if (image.parentElement?.textContent !== "") {
		image.parentElement?.append(container)
	} else {
		image.parentElement.outerHTML = container.outerHTML
	}

	image.remove()
}

export function transformImages(content: unknown, outputPath: string) {
	// apply Image Plugin to Images in Markdown files
	// loosely based on https://gist.github.com/Alexs7zzh/d92ae991ad05ed585d072074ea527b5c
	if (!outputPath?.endsWith(".html")) {
		return content
	}

	const { document } = parseHTML(content)

	for (const image of document.querySelectorAll<HTMLImageElement>(
		".md-content img",
	)) {
		if (!image.getAttribute("src")?.startsWith("http")) {
			makeImage(image, document)
		}
	}

	let currentHash = ""

	const hashes = new Set<string>()

	for (const elem of document.querySelectorAll(".md-content > *")) {
		if (elem.tagName === "P") {
			currentHash = stringToHash(elem.textContent ?? "")
			hashes.add(currentHash)
		} else if (elem.tagName === "DIV" && elem.classList.contains("md-img")) {
			elem.classList.add(currentHash)
		}
	}

	for (const hash of hashes) {
		handleImageRow(hash, document)
	}

	return `<!DOCTYPE html>${document.documentElement.outerHTML}`
}

function handleImageRow(hash: string, document: Document) {
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

	const elements = document.querySelectorAll(`.${hash}`)

	for (const elem of elements) {
		elem.className = "col-lg-6 col-md-12 mx-auto"
		container.append(elem)
	}
}
