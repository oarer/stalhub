'use client'

import type { UnoMetric } from '@/types/uno/uno.type'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoPercent, formatUnoValue } from '../../utils/uno.utils'
import { UnoStat } from '../UnoStat'

export function MetricGrid({ metrics }: { metrics: UnoMetric[] }) {
	const locale = useUnoLocale()
	if (metrics.length === 0) return null
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{metrics.slice(0, 8).map((metric) => (
				<UnoStat
					key={metric.key}
					label={metric.label}
					value={
						metric.key === 'win_rate'
							? formatUnoPercent(metric.value, locale)
							: `${formatUnoValue(metric.value, locale)}${metric.unit ?? ''}`
					}
				/>
			))}
		</div>
	)
}
