'use client'

import { useMemo } from 'react'
import type { Item, Locale } from '@/types/item.type'
import { getContainerModifiers as getModifiers } from './buildStatsUtils'

export function useContainerModifiers(
	containerItem: Item | undefined,
	locale: Locale
) {
	return useMemo(
		() => getModifiers(containerItem, locale),
		[containerItem, locale]
	)
}
