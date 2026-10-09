export interface TocItem {
	id: string
	text: string
	level: 2 | 3 | 4
}

export function slugify(text: string): string {
	const slug = text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\p{M}]/gu, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')

	return slug || 'section'
}

export function extractTocHeadings(root: HTMLElement): TocItem[] {
	const nodes = root.querySelectorAll('h2, h3, h4')
	const used = new Set<string>()
	const items: TocItem[] = []

	nodes.forEach((node) => {
		const el = node as HTMLElement
		const level = Number(el.tagName.slice(1)) as 2 | 3 | 4
		const text = (el.textContent ?? '').trim()
		if (!text) return

		let id = el.id || slugify(text)
		if (used.has(id)) {
			let i = 2
			while (used.has(`${id}-${i}`)) i++
			id = `${id}-${i}`
		}
		used.add(id)

		if (el.id !== id) el.id = id

		el.classList.add('scroll-m-24')

		items.push({ id, text, level })
	})

	return items
}
