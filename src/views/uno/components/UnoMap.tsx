'use client'

import { useTranslations } from 'next-intl'
import { normalizeUnoMap } from '../utils/uno.utils'

export function UnoMap({
	map,
	className,
}: {
	map: string | null | undefined
	className?: string
}) {
	const t = useTranslations('uno')
	const key = normalizeUnoMap(map)

	return (
		<span className={className}>
			{key ? t(`grids.maps.${key}`) : (map ?? '—')}
		</span>
	)
}
