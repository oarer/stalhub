'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLocale } from 'next-intl'
import { useCallback, useMemo } from 'react'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { Item, Locale } from '@/types/item.type'
import {
	computeAverageWeaponTTK,
	computeWeaponTTK,
	isAggregateScenario,
	parseScenarioName,
	type TierScenario,
} from '../utils/tier-ttk'

export function useTierTtk(scenario?: string | null, variantIndex = 15) {
	const locale = useLocale() as Locale

	const { data: ammoDict } = useQuery({
		queryKey: ['items', 'ammo'],
		queryFn: async () => {
			const { data } = await axios.get<Record<string, Item>>(
				`${GITHUB_RAW_BASE}/listing/ammo.json`
			)
			return data
		},
		staleTime: 1000 * 60 * 60,
	})

	const ammoItems = ammoDict ? Object.values(ammoDict) : []

	const aggregate = useMemo(() => isAggregateScenario(scenario), [scenario])
	const tierScenario: TierScenario = parseScenarioName(scenario)

	const getTtk = useCallback(
		(weapon: Item) => {
			if (aggregate) {
				return computeAverageWeaponTTK(
					weapon,
					ammoItems,
					'head',
					locale,
					variantIndex
				)
			}
			return computeWeaponTTK(
				weapon,
				ammoItems,
				tierScenario,
				locale,
				variantIndex
			)
		},
		[aggregate, ammoItems, tierScenario, locale, variantIndex]
	)

	return { getTtk, isAmmoLoading: !ammoDict }
}
