import Image from "@11ty/eleventy-img"
import type MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token.mjs"
import { IMAGE_OPTIONS } from "./image.ts"

const IMAGE_ROW_CONTAINER = "11ty-img-container" as const

const figureRowDefinition: MarkdownIt.Core.RuleCore = (state) => {
	let nesting = 0
	for (let idx = state.tokens.length - 1; idx >= 0; idx--) {
		nesting += state.tokens[idx].nesting
		if (!(state.tokens[idx].type === "inline" && nesting === -1)) {
			continue
		}

		const token = state.tokens[idx]
		if (
			token.children?.at(0)?.type !== "image" ||
			state.tokens[idx + 1].type !== "paragraph_close" ||
			state.tokens[idx - 1].type !== "paragraph_open"
		) {
			continue
		}

		state.tokens[idx + 1] = new Token(IMAGE_ROW_CONTAINER, "", -1)
		state.tokens[idx - 1] = new Token(IMAGE_ROW_CONTAINER, "", 1)

		const img = token.children[0]

		const myToken = new Token("11ty-img", "11ty-img", 0)
		myToken.block = true
		myToken.meta = { caption: img.attrGet("title"), img }

		state.tokens[idx] = myToken
	}

	state.tokens = state.tokens.filter(
		(token, idx, array) =>
			!(
				token.type === IMAGE_ROW_CONTAINER &&
				(array[idx + 1]?.type === IMAGE_ROW_CONTAINER ||
					array[idx - 1]?.type === IMAGE_ROW_CONTAINER)
			),
	)
}

const imageContainerRenderer: MarkdownIt.Renderer.RenderRule = (
	tokens,
	idx,
) => {
	return tokens[idx].nesting === 1 ? "<div class='row mt-4'>" : "</div>"
}

export function markdownImageParser(md: MarkdownIt) {
	md.core.ruler.push("figure", figureRowDefinition)

	md.renderer.rules["11ty-img"] = (tokens, idx, _options, env, _self) => {
		const caption = tokens[idx].meta.caption
			? md.renderInline(tokens[idx].meta.caption, env)
			: undefined

		const originalSrc = tokens[idx].meta.img.attrGet("src")
		const attrs = {
			alt: tokens[idx].meta.img.attrGet("alt") || "",
			title: tokens[idx].meta.img.attrGet("title") || "",
			loading: "lazy",
			decoding: "async",
			class: "img-fluid",
		}

		const src = originalSrc.startsWith("/")
			? `./src${originalSrc}`
			: originalSrc

		const options = IMAGE_OPTIONS
		Image(src, options)

		const metadata = Image.statsSync(src, options)
		const imageMarkup = Image.generateHTML(metadata, attrs, {
			whitespaceMode: "inline",
		})

		return `<figure class='col-lg-6 mx-auto col-md-12'>${imageMarkup}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`
	}

	md.renderer.rules[IMAGE_ROW_CONTAINER] = imageContainerRenderer
}
