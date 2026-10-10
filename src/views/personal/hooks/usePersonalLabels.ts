'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { getCategoryKey, getDerivedStatKey, getStatLabel } from '../statMeta'

/** Лейблы метрик и категорий через ключи переводов.
 * Расчётные метрики → personal.stat*, категории → player.category.* */
export function usePersonalLabels() {
	const t = useTranslations()
	const locale = useLocale()

	const statLabel = useCallback(
		(id: string): string => {
			const key = getDerivedStatKey(id)
			if (key) return t(key)
			return getStatLabel(id, locale)
		},
		[t, locale]
	)

	const categoryLabel = useCallback(
		(cat: string): string => t(getCategoryKey(cat)),
		[t]
	)

	const compareLabels = useCallback(
		(a: string, b: string): number =>
			statLabel(a).localeCompare(statLabel(b), locale),
		[statLabel, locale]
	)

	return { statLabel, categoryLabel, compareLabels, locale }
}
