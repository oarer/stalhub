import { useMemo } from 'react'

import { useSettingsStore } from '@/stores/useSettings.store'

type UnoItem = {
	uno?: boolean
}

export function filterUnoItems<T extends UnoItem>(
	items: T[] | null | undefined,
	showUno: boolean
): T[] | undefined {
	if (!items) return undefined
	if (showUno) return items
	return items.filter((item) => !item.uno)
}

export function includeItemsById<T extends { id: string }>(
	visibleItems: T[] | null | undefined,
	allItems: T[] | null | undefined,
	ids: Iterable<string>
): T[] | undefined {
	if (!visibleItems || !allItems) return visibleItems ?? undefined
	const result = new Map(visibleItems.map((item) => [item.id, item]))
	for (const id of ids) {
		const item = allItems.find((candidate) => candidate.id === id)
		if (item) result.set(id, item)
	}
	return Array.from(result.values())
}

export function useVisibleItems<T extends UnoItem>(
	items: T[] | null | undefined
): T[] | undefined {
	const showUno = useSettingsStore((s) => s.showUno)
	return useMemo(() => filterUnoItems(items, showUno), [items, showUno])
}
