import type { Stat } from '@/types/player.type'
import { decimalConfig } from '@/types/player.type'

export type PlayerStatTranslate = (key: string) => string

export function formatStatValue(
	stat: Stat,
	locale: string,
	t: PlayerStatTranslate
): string {
	const { value, type, id } = stat

	switch (type) {
		case 'INTEGER':
			return Number(value).toLocaleString(locale)
		case 'DECIMAL': {
			const config = decimalConfig[id] ?? {
				divisor: 100000,
				precision: 2,
				unit: 'km',
			}
			const formatted = (Number(value) / config.divisor).toLocaleString(
				locale,
				{
					maximumFractionDigits: config.precision,
					minimumFractionDigits: config.precision,
				}
			)
			return config.unit
				? `${formatted} ${t(`unit.${config.unit}`)}`
				: formatted
		}
		case 'DURATION': {
			const hours = Number(value) / (1000 * 60 * 60)
			return `${hours.toLocaleString(locale, { maximumFractionDigits: 1 })} ${t('unit.hours')}`
		}
		case 'DATE': {
			const date = value instanceof Date ? value : new Date(value)
			return Number.isNaN(date.getTime())
				? String(value)
				: date.toLocaleDateString(locale)
		}
		default:
			return String(value)
	}
}
