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

export function useVisibleItems<T extends UnoItem>(
	items: T[] | null | undefined
): T[] | undefined {
	const showUno = useSettingsStore((s) => s.showUno)
	return useMemo(() => filterUnoItems(items, showUno), [items, showUno])
}
