'use client'

import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'
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
				className="font-semibold"
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
			className="font-semibold"
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
		<div className="flex justify-between font-semibold">
			<p style={nameColor ? { color: nameColor } : undefined}>{key}</p>
			<p
				className={`${montserrat.className} ] text-nowrap`}
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
				className="font-semibold"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			{override ? (
				<div className="flex items-center gap-1 text-nowrap">
					<span
						className={`${montserrat.className} font-medium text-sm text-text-accent line-through`}
					>
						{roundNumber(override.base)}
					</span>
					<span aria-hidden="true">→</span>
					<span
						className={`${montserrat.className} font-semibold text-sm`}
					>
						{roundNumber(override.modified)}
					</span>
					<span
						className={cn(
							montserrat.className,
							'font-semibold text-sm',
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
					className={`${montserrat.className} font-medium`}
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
				className="font-semibold"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			<p
				className={`${montserrat.className} font-semibold`}
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
			className={`${montserrat.className} font-medium`}
			style={valueColor ? { color: valueColor } : undefined}
		>
			{name}
		</p>
	)
}

export const FallbackElement: React.FC<{ el: InfoElement }> = ({ el }) => {
	return (
		<div className="text-red-200 text-sm">
			<pre className="whitespace-pre-wrap text-destructive text-xs">
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

	const pair = Array.isArray(current)
		? (current as [number, number])
		: null

	const display =
		pair !== null
			? `${format(pair[0])} — ${format(pair[1])}`
			: current !== null
				? format(current as number)
				: '—'

	return (
		<div className="flex items-center justify-between py-1">
			<p
				className="truncate font-semibold"
				style={nameColor ? { color: nameColor } : undefined}
			>
				{name}
			</p>
			<p
				className={`${montserrat.className} font-medium text-md`}
				style={valueColor ? { color: valueColor } : undefined}
			>
				{display}
			</p>
		</div>
	)
}
