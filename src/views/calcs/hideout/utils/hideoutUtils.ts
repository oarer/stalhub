import type { ItemListing } from '@/types/api.type'
import type { Hideout } from '@/types/hideout.type'
import type { Locale } from '@/types/item.type'

export function normalizeItemId(itemId: string): string {
	return itemId.split('/').pop()?.replace('.json', '') ?? itemId
}

export function getItemName(
	items: ItemListing[] | null,
	locale: string,
	itemId: string
): string {
	if (!items) return itemId

	const itemData = items.find((i) => {
		const file = i.data.split('/').pop()?.replace('.json', '')
		return file === itemId || i.data.includes(itemId)
	})

	return (
		itemData?.name[locale as Locale] ??
		Object.values(itemData?.name ?? {})[0] ??
		itemId
	)
}

export function getItemIcon(
	items: ItemListing[] | null,
	itemId: string
): string {
	if (!items) return ''

	const itemData = items.find((i) => {
		const file = i.data.split('/').pop()?.replace('.json', '')
		return file === itemId || i.data.includes(itemId)
	})

	if (!itemData?.icon) return ''

	return `https://raw.githubusercontent.com/oarer/sc-db/main/merged${itemData.icon}`
}

export function hasRecipe(
	hideoutData: Hideout | undefined,
	itemId: string
): boolean {
	if (!hideoutData) return false
	const id = normalizeItemId(itemId)
	return hideoutData.recipes.some((r) =>
		r.result.some((res) => normalizeItemId(res.item) === id)
	)
}
