'use client'

import { getLocale } from '@/lib/getLocale'
import type { CatalogItem, CatalogSlot, LocaleCode } from '@/types/loot.type'

export function pickName(
	names: Partial<Record<LocaleCode, string>> | undefined
): string {
	if (!names) {
		return ''
	}
	const locale = getLocale() as LocaleCode
	return names[locale] ?? names.ru ?? names.en ?? ''
}

export function formattedPct(pct: number): string {
	return `${pct.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
}

export function slotLabel(slot: CatalogSlot, index: number): string {
	const miss = slot.filter((item) => !item.stack).length
	if (miss === slot.length) {
		return `Miss ${index + 1}`
	}
	return `Slot ${index + 1}`
}

export function sortedByPct(slot: CatalogSlot): CatalogItem[] {
	return [...slot].sort((a, b) => b.pct - a.pct)
}
