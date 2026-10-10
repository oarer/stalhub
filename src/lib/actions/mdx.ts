'use server'

import { serialize } from 'next-mdx-remote/serialize'
import remarkBreaks from 'remark-breaks'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import { remarkCalloutContainers, remarkCallouts } from '@/lib/remark/callouts'

const HTML_TAGS = new Set([
	'a',
	'abbr',
	'address',
	'area',
	'article',
	'aside',
	'audio',
	'b',
	'bdi',
	'bdo',
	'blockquote',
	'br',
	'button',
	'caption',
	'cite',
	'code',
	'col',
	'colgroup',
	'data',
	'dd',
	'del',
	'details',
	'dfn',
	'dialog',
	'div',
	'dl',
	'dt',
	'em',
	'figcaption',
	'figure',
	'footer',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hr',
	'i',
	'img',
	'ins',
	'kbd',
	'label',
	'legend',
	'li',
	'main',
	'mark',
	'meter',
	'nav',
	'noscript',
	'ol',
	'optgroup',
	'option',
	'output',
	'p',
	'picture',
	'pre',
	'progress',
	'q',
	'rp',
	'rt',
	'ruby',
	's',
	'samp',
	'section',
	'small',
	'source',
	'span',
	'strong',
	'sub',
	'summary',
	'sup',
	'table',
	'tbody',
	'td',
	'tfoot',
	'th',
	'thead',
	'time',
	'tr',
	'u',
	'ul',
	'var',
	'wbr',
])

const ALLOWED_MDX_COMPONENTS = new Set(['Gallery', 'QuestMap', 'Callout'])

const ALLOWED_JSON_PROPS: Record<string, Set<string>> = {
	Gallery: new Set(['images']),
	QuestMap: new Set(['markers', 'mapId', 'mapName']),
	Callout: new Set(['type', 'title']),
}

function findMatchingBrace(source: string, start: number): number {
	let depth = 0
	let quote: string | null = null
	let escaped = false

	for (let i = start; i < source.length; i++) {
		const ch = source[i]

		if (quote) {
			if (escaped) {
				escaped = false
			} else if (ch === '\\') {
				escaped = true
			} else if (ch === quote) {
				quote = null
			}
			continue
		}

		if (ch === '"' || ch === "'" || ch === '`') {
			quote = ch
		} else if (ch === '{') {
			depth++
		} else if (ch === '}') {
			depth--
			if (depth === 0) return i
		}
	}

	return -1
}

function findTagEnd(source: string, start: number): number {
	let braceDepth = 0
	let quote: string | null = null
	let escaped = false

	for (let i = start; i < source.length; i++) {
		const ch = source[i]

		if (quote) {
			if (escaped) {
				escaped = false
			} else if (ch === '\\') {
				escaped = true
			} else if (ch === quote) {
				quote = null
			}
			continue
		}

		if (ch === '"' || ch === "'" || ch === '`') {
			quote = ch
		} else if (ch === '{') {
			braceDepth++
		} else if (ch === '}') {
			if (braceDepth > 0) braceDepth--
		} else if (ch === '>' && braceDepth === 0) {
			return i
		}
	}

	return -1
}

function sanitizeMdxExpressions(source: string): string {
	const placeholders: string[] = []
	const token = (i: number) => `___MDX_SAFE_${i}___`

	const componentRegex = /<(Gallery|QuestMap|Callout)(?=[\s/>])/g
	let protectedSource = ''
	let lastIndex = 0
	let compMatch: RegExpExecArray | null

	while ((compMatch = componentRegex.exec(source)) !== null) {
		const tagStart = compMatch.index
		const component = compMatch[1]
		const allowedProps = ALLOWED_JSON_PROPS[component]
		const tagEnd = findTagEnd(source, tagStart)

		if (tagEnd === -1) continue

		const tag = source.slice(tagStart, tagEnd + 1)
		protectedSource += source.slice(lastIndex, tagStart)

		let safeTag = ''
		let cursor = 0
		const propRegex = /([A-Za-z_][A-Za-z0-9_-]*)=\{/g
		let propMatch: RegExpExecArray | null

		while ((propMatch = propRegex.exec(tag)) !== null) {
			const propName = propMatch[1]
			const braceStartInTag = propMatch.index + propMatch[0].length - 1
			const braceStart = tagStart + braceStartInTag
			const braceEnd = findMatchingBrace(source, braceStart)

			if (braceEnd === -1 || braceEnd > tagEnd) {
				safeTag += tag.slice(cursor, propMatch.index)
				cursor = tag.length - 1
				break
			}

			const inner = source.slice(braceStart + 1, braceEnd)
			let isSafeJson = false

			if (allowedProps.has(propName)) {
				try {
					const parsed: unknown = JSON.parse(inner)
					isSafeJson =
						parsed === null ||
						typeof parsed === 'string' ||
						typeof parsed === 'number' ||
						typeof parsed === 'boolean' ||
						Array.isArray(parsed) ||
						(parsed !== null && typeof parsed === 'object')
				} catch {
					isSafeJson = false
				}
			}

			safeTag += tag.slice(cursor, propMatch.index)
			if (isSafeJson) {
				const id = placeholders.length
				placeholders.push(`{${inner}}`)
				safeTag += `${propName}=${token(id)}`
			}

			const consumedInTag = braceEnd - tagStart + 1
			cursor = consumedInTag
			propRegex.lastIndex = consumedInTag
		}

		safeTag += tag.slice(cursor)
		protectedSource += safeTag

		lastIndex = tagEnd + 1
		componentRegex.lastIndex = tagEnd + 1
	}
	protectedSource += source.slice(lastIndex)

	let stripped = protectedSource.replace(/\{[\s\S]*?\}/g, '')

	stripped = stripped.replace(/=\s*(?=[\s/>])/g, '="__removed__"')

	for (let i = 0; i < placeholders.length; i++) {
		stripped = stripped.split(token(i)).join(placeholders[i])
	}

	return stripped
}

export async function compileMdx(source: string) {
	const lowerTagRegex = /<([a-z][a-z0-9-]*)[\s/>]/g
	let match
	while ((match = lowerTagRegex.exec(source)) !== null) {
		if (!HTML_TAGS.has(match[1])) {
			throw new Error(`Unknown tag: <${match[1]}>`)
		}
	}

	const upperTagRegex = /<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g
	while ((match = upperTagRegex.exec(source)) !== null) {
		if (!ALLOWED_MDX_COMPONENTS.has(match[1])) {
			throw new Error(`Unknown component: <${match[1]}>`)
		}
	}

	const safe = sanitizeMdxExpressions(source)

	const result = await serialize(safe, {
		mdxOptions: {
			remarkPlugins: [
				remarkDirective,
				remarkCalloutContainers,
				remarkGfm,
				remarkBreaks,
				remarkCallouts,
			],
		},
	})

	return {
		compiledSource: result.compiledSource,
		frontmatter: result.frontmatter,
	}
}
