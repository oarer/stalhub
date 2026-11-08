'use client'

import { useTranslations } from 'next-intl'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoValue } from '../../utils/uno.utils'
import { UnoStat } from '../UnoStat'

export function LeaderboardStats({
	total,
	visible,
	observedAt,
}: {
	total: number
	visible: number
	observedAt: string | null | undefined
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()

	return (
		<div className="grid gap-3 sm:grid-cols-3">
			<UnoStat
				accent
				label={t('stats.clans')}
				value={formatUnoValue(total, locale)}
			/>
			<UnoStat
				label={t('stats.visible')}
				value={formatUnoValue(visible, locale)}
			/>
			<UnoStat
				label={t('stats.updated')}
				value={
					observedAt
						? new Date(observedAt).toLocaleDateString(locale)
						: '—'
				}
			/>
		</div>
	)
}
