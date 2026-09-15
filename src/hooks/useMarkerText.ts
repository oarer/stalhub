import { useTranslations } from 'next-intl'

export function useMarkerText() {
	const t = useTranslations('markers')

	return (key: string | null | undefined): string => {
		if (!key) return ''
		return t.has(key) ? t(key) : key
	}
}

export function useSettlementText() {
	const t = useTranslations('markers')

	return (key: string | null | undefined): string => {
		if (!key) return ''
		const lk = `settlement.id.${key}.title`
		return t.has(lk) ? t(lk) : key
	}
}
