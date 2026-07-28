import type { Root, Paragraph, Text } from 'mdast'

const CALLOUT_TYPES = new Set([
	'info',
	'warning',
	'warn',
	'tip',
	'danger',
	'success',
])

const OPEN_RE = /^:::\s*(info|warning|tip|danger|success|warn)[^\S\n]*(.*)/
const CLOSE_RE = /^:::\s*$/

export function remarkCalloutContainers() {
	return (tree: Root) => {
		for (let i = tree.children.length - 1; i >= 0; i--) {
			const node = tree.children[i]
			if (node.type !== 'paragraph') continue

			const para = node as Paragraph
			const fullText = para.children
				.filter((c): c is Text => c.type === 'text')
				.map((t) => t.value)
				.join('')

			const openMatch = fullText.match(OPEN_RE)
			if (!openMatch) continue

			const calloutType = openMatch[1]
			let title = openMatch[2].trim() || undefined

			const afterOpen = fullText.slice(openMatch[0].length)
			const lines = afterOpen.split('\n')
			let endIdx = -1
			for (let j = 1; j < lines.length; j++) {
				if (CLOSE_RE.test(lines[j])) {
					endIdx = j
					break
				}
			}
			const body =
				endIdx >= 0 ? lines.slice(0, endIdx).join('\n') : afterOpen

			if (!title && body.includes('\n')) {
				const firstLineEnd = body.indexOf('\n')
				const firstLine = body.slice(0, firstLineEnd).trim()
				if (firstLine && !CLOSE_RE.test(firstLine)) {
					title = firstLine
				}
			}

			const contentText = title
				? body.includes('\n')
					? body.slice(body.indexOf('\n') + 1)
					: ''
				: body

			const children: any[] = contentText.trim()
				? [{ type: 'paragraph', children: [{ type: 'text', value: contentText.trim() }] }]
				: []

			tree.children[i] = {
				type: 'containerDirective',
				name: calloutType,
				attributes: title ? { title } : {},
				children,
			} as any
		}
	}
}

export function remarkCallouts() {
	return (tree: Root) => {
		for (let i = tree.children.length - 1; i >= 0; i--) {
			const node = tree.children[i] as any
			if (node.type !== 'containerDirective') continue
			if (!CALLOUT_TYPES.has(node.name)) continue

			const calloutType = node.name
			const title = node.attributes?.title ?? undefined

			const titleAttr = title
				? [
						{
							type: 'mdxJsxAttribute' as const,
							name: 'title',
							value: String(title),
						},
					]
				: []

			const children = node.children ?? []

			tree.children[i] = {
				type: 'mdxJsxFlowElement',
				name: 'Callout',
				attributes: [
					{
						type: 'mdxJsxAttribute' as const,
						name: 'type',
						value: calloutType,
					},
					...titleAttr,
				],
				children: children.length
					? children
					: [
							{
								type: 'paragraph',
								children: [],
							},
						],
			} as any
		}
	}
}
