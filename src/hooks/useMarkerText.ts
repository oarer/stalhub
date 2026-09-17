import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

export function useMarkerText() {
	const t = useTranslations('markers')

	return useCallback(
		(key: string | null | undefined): string => {
			if (!key) return ''
			return t.has(key) ? t(key) : key
		},
		[t]
	)
}

export function useSettlementText() {
	const t = useTranslations('markers')

	return useCallback(
		(key: string | null | undefined): string => {
			if (!key) return ''
			const lk = `settlement.id.${key}.title`
			return t.has(lk) ? t(lk) : key
		},
		[t]
	)
}
