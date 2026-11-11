import type { ItemListing } from '@/types/api.type'

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

export function getItemIcon(
	item: Pick<ItemListing, 'data'> & Partial<Pick<ItemListing, 'icon'>>
): string {
	return item.icon || getItemIconPath(item.data)
}

export function withResolvedItemIcon(item: ItemListing): ItemListing {
	const icon = getItemIcon(item)
	return icon === item.icon ? item : { ...item, icon }
}
