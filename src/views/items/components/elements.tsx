'use client'

import { cn } from '@/lib/cn'
import { useBuildStore } from '@/stores/useBuild.store'
import type {
	InfoElement,
	Locale,
	NumericVariantsElement,
} from '@/types/item.type'
import {
	getValueColorByRankKey,
	hasFormatted,
	messageToString,
	roundNumber,
} from '@/utils/itemUtils'
import type { StatOverride } from './attachments/attachmentStats'

function normalizeColor(raw?: string): string | undefined {
	if (!raw) return undefined
	const trimmed = raw.trim()
	if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed
	if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`
	return undefined
}

export const ItemElement: React.FC<{
	el: Extract<InfoElement, { type: 'item' }>
	locale: Locale
}> = ({ el, locale }) => {
	const name = messageToString(el.name, locale)
	const nameColor = normalizeColor(el.formatted?.nameColor)
	return (
		<div className="flex justify-between">
			<p
				className="font-body"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
		</div>
	)
}

export const TextElement: React.FC<{
	el: Extract<InfoElement, { type: 'text' }>
	locale: Locale
}> = ({ el, locale }) => {
	const text = messageToString(el.text, locale)
	const valueColor = normalizeColor(el.formatted?.valueColor)
	return (
		<p
			className="font-body text-[13px]"
			style={valueColor ? { color: valueColor } : undefined}
		>
			{text}
		</p>
	)
}

export const KeyValueElement: React.FC<{
	el: Extract<InfoElement, { type: 'key-value' }>
	locale: Locale
}> = ({ el, locale }) => {
	const key = messageToString(el.key, locale)
	const value = messageToString(el.value, locale)

	const nameColor = normalizeColor(el.formatted?.nameColor)
	const valueColor =
		normalizeColor(el.formatted?.valueColor) ||
		getValueColorByRankKey(el.value)

	return (
		<div className="flex justify-between">
			<p
				className="font-medium"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{key}
			</p>
			<p
				className="max-w-40 truncate text-nowrap font-mono font-semibold"
				style={valueColor ? { color: valueColor } : undefined}
			>
				{value}
			</p>
		</div>
	)
}

export const NumericElement: React.FC<{
	el: Extract<InfoElement, { type: 'numeric' }>
	locale: Locale
	override?: StatOverride
}> = ({ el, locale, override }) => {
	const name = messageToString(el.name, locale)
	const nameColor = normalizeColor(el.formatted?.nameColor)

	const display =
		hasFormatted(el) && el.formatted?.value?.[locale]
			? el.formatted.value[locale]
			: roundNumber(el.value)

	return (
		<div className="flex justify-between gap-2">
			<p
				className="font-medium"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			{override ? (
				<div className="flex items-center gap-1 text-nowrap">
					<span className="font-mono font-semibold text-foreground text-sm line-through">
						{roundNumber(override.base)}
					</span>
					<span aria-hidden="true">→</span>
					<span className="font-mono font-semibold text-sm">
						{roundNumber(override.modified)}
					</span>
					<span
						className={cn(
							'font-mono font-semibold text-sm',
							override.improved
								? 'text-emerald-500'
								: 'text-destructive'
						)}
					>
						({override.deltaPct > 0 ? '+' : ''}
						{roundNumber(override.deltaPct)}%)
					</span>
				</div>
			) : (
				<p
					className="font-mono font-semibold"
					style={nameColor ? { color: nameColor } : undefined}
				>
					{display}
				</p>
			)}
		</div>
	)
}

export const RangeElement: React.FC<{
	el: Extract<InfoElement, { type: 'range' }>
	locale: Locale
}> = ({ el, locale }) => {
	const name = messageToString(el.name, locale)
	const nameColor = normalizeColor(el.formatted?.nameColor)
	const valueColor = normalizeColor(el.formatted?.valueColor)

	const display =
		hasFormatted(el) && el.formatted?.value?.[locale]
			? el.formatted.value[locale]
			: `${roundNumber(el.min)} — ${roundNumber(el.max)}`

	return (
		<div className="flex justify-between">
			<p
				className="font-medium"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			<p
				className="font-mono font-semibold"
				style={valueColor ? { color: valueColor } : undefined}
			>
				{display}
			</p>
		</div>
	)
}

export const UsageElement: React.FC<{
	el: Extract<InfoElement, { type: 'usage' }>
	locale: Locale
}> = ({ el, locale }) => {
	const name = messageToString(el.name, locale)
	const valueColor = normalizeColor(el.formatted?.valueColor)

	return (
		<p
			className="font-body"
			style={valueColor ? { color: valueColor } : undefined}
		>
			{name}
		</p>
	)
}

export const ThresholdElement: React.FC<{
	el: Extract<InfoElement, { type: 'threshold' }>
	locale: Locale
}> = ({ el, locale }) => {
	const sicknessDisplay = useBuildStore(
		(s) => s.defaults.sicknessDisplay ?? 'new'
	)
	const scale = sicknessDisplay === 'old' ? 20 : 1

	const name = messageToString(el.name, locale)
	const nameColor = normalizeColor(el.formatted?.nameColor)
	const valueColor =
		normalizeColor(el.formatted?.valueColor) ??
		(el.withinLimit ? '#22C55E' : '#EF4444')

	const display =
		hasFormatted(el) && el.formatted?.value?.[locale]
			? el.formatted.value[locale]
			: `${roundNumber(el.value / scale)} / ${roundNumber(el.limit / scale)}`

	return (
		<div className="flex justify-between gap-2">
			<p
				className="font-semibold"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			<p
				className={`${montserrat.className} font-medium text-nowrap`}
				style={{ color: valueColor }}
			>
				{display}
			</p>
		</div>
	)
}

export const FallbackElement: React.FC<{ el: InfoElement }> = ({ el }) => {
	return (
		<div className="text-destructive text-sm">
			<span className="font-mono font-semibold">
				Парсер не смог обработать строки ниже:
			</span>
			<pre className="whitespace-pre-wrap font-medium font-mono text-xs">
				{JSON.stringify(el, null, 2)}
			</pre>
		</div>
	)
}

export const NumericVariantsElementRenderer: React.FC<{
	el: NumericVariantsElement
	locale: Locale
	numericVariants: number
}> = ({ el, locale, numericVariants }) => {
	const name = messageToString(el.name, locale) || ''
	const values = Array.isArray(el.value) ? el.value : []
	const maxIdx = Math.max(0, values.length - 1)

	const safePoint = Math.min(numericVariants, maxIdx)

	const nameColor = normalizeColor(el.formatted?.nameColor)
	const valueColor = normalizeColor(el.formatted?.valueColor)

	const current = values[safePoint] ?? null
	const format = (v: number) =>
		Number.isInteger(v) ? String(v) : v.toFixed(2)

	const pair = Array.isArray(current) ? (current as [number, number]) : null

	const display =
		pair !== null
			? `${format(pair[0])} — ${format(pair[1])}`
			: current !== null
				? format(current as number)
				: '—'

	return (
		<div className="flex items-center justify-between py-1">
			<p
				className="truncate font-medium"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			<p
				className="font-mono font-semibold text-md"
				style={valueColor ? { color: valueColor } : undefined}
			>
				{display}
			</p>
		</div>
	)
}
