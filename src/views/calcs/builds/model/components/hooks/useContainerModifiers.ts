'use client'

import { useMemo } from 'react'
import type { Item } from '@/types/item.type'
import { getContainerModifiers as getModifiers } from './buildStatsUtils'

export function useContainerModifiers(containerItem: Item | undefined) {
	return useMemo(() => getModifiers(containerItem), [containerItem])
}
