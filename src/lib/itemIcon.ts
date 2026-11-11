type ItemIconSource = {
	data?: string
	icon?: string
	category?: string
	id?: string
	uno?: boolean
}

const ITEMS_PREFIX = 'items/'
const ICONS_PREFIX = '/icons/'

export function getItemIconPath(data: string): string {
	const normalized = data
		.trim()
		.replace(/^\/+/, '')
		.replace(/\.json$/i, '')
	const relative = normalized.startsWith(ITEMS_PREFIX)
		? normalized.slice(ITEMS_PREFIX.length)
		: normalized

	return relative ? `${ICONS_PREFIX}${relative}.png` : ''
}

export function getItemIcon(item: ItemIconSource): string {
	const icon = item.icon?.trim()
	if (icon) return icon

	if (item.data) {
		const iconFromData = getItemIconPath(item.data)
		if (iconFromData) return iconFromData
	}

	if (item.category && item.id) {
		const prefix = item.uno ? `${ICONS_PREFIX}uno/` : ICONS_PREFIX
		return `${prefix}${item.category}/${item.id}.png`
	}

	return ''
}
