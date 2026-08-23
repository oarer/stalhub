'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'
import { InfoColor, infoColorMap } from '@/types/item.type'
import type { ModuleAttribute } from '@/types/module.type'
import {
	calcArtifactPercent,
	qualityIndexToArtQuality,
	type ArtifactAdditional,
} from '@/utils/artUtils'
import {
	buildModuleAttrLines,
	calcModuleAttrStats,
	calcModulePct,
	getModuleByDefinitionId,
	getModuleGroupByAttributeType,
	getRarityByQuality,
	RARITY_COLORS,
} from '@/views/calcs/modules/utils/moduleCalc'

export function getLotRankColor(
	additional?: ArtifactAdditional
): string | null {
	if (!additional) return null

	const attributes = additional.attributes ?? []
	if (attributes.length > 0) {
		const maxPct = Math.max(
			...attributes.map((a) => calcModulePct(a))
		)
		return RARITY_COLORS[getRarityByQuality(maxPct)]
	}

	if (additional.qlt != null) {
		const artQuality =
			qualityIndexToArtQuality[additional.qlt] ?? InfoColor.DEFAULT
		return infoColorMap[artQuality]
	}

	return null
}

export function getLotRankLabelKey(
	additional?: ArtifactAdditional
): string | null {
	if (!additional) return null

	const attributes = additional.attributes ?? []
	if (attributes.length > 0) {
		const maxPct = Math.max(
			...attributes.map((a) => calcModulePct(a))
		)
		const rarity = getRarityByQuality(maxPct)
		return `arts.ART_QUALITY_${rarity.toUpperCase()}`
	}

	if (additional.qlt != null) {
		const artQuality =
			qualityIndexToArtQuality[additional.qlt] ?? InfoColor.DEFAULT
		return `arts.${artQuality}`
	}

	return null
}

export function getLotRankTint(additional?: ArtifactAdditional): string | null {
	const color = getLotRankColor(additional)
	if (!color) return null
	return `color-mix(in srgb, ${color} 10%, transparent)`
}

export function LotRankBadge({
	additional,
}: {
	additional?: ArtifactAdditional
}) {
	const t = useTranslations()
	const color = getLotRankColor(additional)
	const labelKey = getLotRankLabelKey(additional)
	if (!color || !labelKey) return null

	return (
		<div
			className="self-start rounded-md px-2 py-0.5 font-bold text-sm"
			style={{
				background: `color-mix(in srgb, ${color} 18%, transparent)`,
				color,
			}}
		>
			{t(labelKey)}
		</div>
	)
}

export function buildModuleAttributeLines(
	attributes: ModuleAttribute[]
): string[] {
	return attributes.map((attr) => {
		const module = getModuleByDefinitionId(attr.definitionId)
		const name = module?.lines.ru ?? attr.definitionId
		const pct = calcModulePct(attr)
		const lines = buildModuleAttrLines(attr)

		return `${name} ${pct.toFixed(2)}%: ${lines.join(', ')}`
	})
}

export function ModuleAttributes({
	attributes,
}: {
	attributes: ModuleAttribute[]
}) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2">
			{attributes.map((attr, i) => {
				const module = getModuleByDefinitionId(attr.definitionId)
				const pct = calcModulePct(attr)
				const rarity = getRarityByQuality(pct)
				const group = getModuleGroupByAttributeType(attr.type)
				const groupLabel =
					group === 'add-on'
						? t('modules.groupAddOn')
						: group === 'deviation'
							? t('modules.groupDeviation')
							: t('modules.groupConcept')
				const name = module?.lines.ru ?? attr.definitionId
				const stats = calcModuleAttrStats(attr)

				return (
					<div
						className="flex flex-col gap-1.5 rounded-lg bg-accent/50 p-2.5"
						key={i}
					>
						<div className="flex items-center justify-between gap-2">
							<p
								className="font-bold text-sm"
								style={{ color: RARITY_COLORS[rarity] }}
							>
								{name}
							</p>
							<div className="flex items-center gap-2">
								<span
									className={cn(
										'font-bold text-sm',
										montserrat.className
									)}
									style={{ color: RARITY_COLORS[rarity] }}
								>
									{pct.toFixed(2)}%
								</span>
								<p className="font-semibold text-text-accent text-xs">
									{groupLabel}
								</p>
							</div>
						</div>
						{stats.map((stat, j) => (
							<div
								className="flex items-center justify-between gap-2 text-sm"
								key={j}
							>
								<span className="font-semibold">
									{stat.label}
								</span>
								<span
									className={cn(
										'font-bold text-sm',
										montserrat.className,
										stat.sign === '+'
											? 'text-success'
											: 'text-destructive'
									)}
								>
									{`${stat.sign}${stat.value.toFixed(3)}`}
								</span>
							</div>
						))}
					</div>
				)
			})}
		</div>
	)
}

export function AdditionalDetails({
	additional,
}: {
	additional?: ArtifactAdditional
}) {
	const t = useTranslations()

	if (!additional) return null

	const attributes = additional.attributes ?? []
	if (attributes.length > 0) {
		return <ModuleAttributes attributes={attributes} />
	}

	if (additional.qlt != null) {
		const percent = calcArtifactPercent(additional)
		return (
			<div className="flex items-center justify-between rounded-lg bg-accent/50 px-2.5 py-1.5 text-sm">
				<span className="font-semibold">
					{t('modals.builds.settings.percent')}
				</span>
				<span
					className={cn('font-bold', montserrat.className)}
				>
					{percent.toFixed(2)}%
				</span>
			</div>
		)
	}

	return null
}
