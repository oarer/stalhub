'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import DropdownMenu from '@/components/ui/DropDown'
import Input from '@/components/ui/Input'
import type { ParsedItem, StatBreakdown } from '@/types/artifact.type'
import { percentButtons, potentialButtons } from '@/types/build.type'
import type { ArtQuality, Locale, Message } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import type { DropdownItem } from '@/types/ui/dropdown.type'
import {
	getArtQualityCandidates,
	getMaxaddsFromPotential,
} from '@/utils/artCalculations'
import { messageToString } from '@/utils/itemUtils'

type ArtifactStatsPanelProps = {
	art: {
		instanceId: string
		percent: number
		potential: number
		selectedStats: (string | null)[]
		qualityClass?: ArtQuality
	} | null
	stats: Record<string, StatBreakdown> | null
	parsed: ParsedItem | null
	itemName?: Message
	color?: ArtQuality
	percentState: number
	potentialState: number
	qualityOverrides: Record<string, ArtQuality | undefined>
	onPercentChange: (value: number) => void
	onPotentialChange: (value: number) => void
	onPercentInputChange: (value: number) => void
	onPotentialInputChange: (value: number) => void
	onQualitySelect: (
		instanceId: string | undefined,
		choice: ArtQuality
	) => void
	onSelectedStatsChange: (values: string[]) => void
	addOptions: ComboboxOption[]
	locale: Locale
	container: string | null
}

export function ArtifactStatsPanel({
	art,
	stats,
	parsed,
	itemName,
	color,
	percentState,
	potentialState,
	qualityOverrides,
	onPercentChange,
	onPotentialChange,
	onPercentInputChange,
	onPotentialInputChange,
	onQualitySelect,
	onSelectedStatsChange,
	addOptions,
	locale,
	container,
}: ArtifactStatsPanelProps) {
	const t = useTranslations()

	if (!art || !stats || Object.keys(stats).length === 0) {
		return (
			<div className="text-center">
				<p className="font-bold text-lg text-neutral-400">
					{t('modals.builds.no_data')}
				</p>

				{!container && (
					<p className="mt-2 font-bold text-lg text-red-400">
						{t('build.needed_cont')}
					</p>
				)}
			</div>
		)
	}

	return (
		<>
			<div className="flex w-full items-center justify-between">
				<p
					className="max-w-67 truncate font-semibold transition-colors"
					style={{
						color:
							infoColorMap[color as ArtQuality] ||
							InfoColor.DEFAULT,
					}}
				>
					| {messageToString(itemName, locale)}
				</p>
				<div className="flex items-center gap-2">
					<QualityDropdown
						art={art}
						onQualitySelect={onQualitySelect}
						percentState={percentState}
						qualityOverrides={qualityOverrides}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					{Object.values(stats)
						.filter((s) => Number(s.final) !== 0)
						.map((s) => {
							const label = parsed?.displayNames?.[s.key] ?? s.key
							return (
								<div
									className="flex justify-between"
									key={s.key}
								>
									<p className="font-semibold text-sm">
										{label}
									</p>
									<p
										className="font-semibold text-sm"
										style={
											s.color
												? { color: `#${s.color}` }
												: undefined
										}
									>
										{s.final}
									</p>
								</div>
							)
						})}
				</div>

				<div className="flex items-center justify-between gap-2">
					<div className="grid grid-cols-3 gap-2">
						{percentButtons.map((p) => (
							<button
								className={`w-fit min-w-12 cursor-pointer rounded-md px-3 text-center ring-2 ${p.color} transition-colors`}
								key={p.value}
								onClick={() => onPercentChange(p.value)}
							>
								<p className="font-semibold text-sm">
									{p.value}
								</p>
							</button>
						))}
					</div>
					<Input
						className="min-w-30"
						label="modals.builds.quality"
						max={190}
						min={85}
						onChange={(e) =>
							onPercentInputChange(Number(e.target.value))
						}
						type="number"
						value={percentState}
					/>
				</div>

				<div className="flex items-center justify-between gap-2">
					<div className="grid grid-cols-4 gap-2">
						{potentialButtons.map((p) => (
							<button
								className="min-w-9 cursor-pointer rounded-lg bg-neutral-800/80 p-2 text-center ring-2 ring-border/40 transition-colors hover:bg-neutral-900"
								key={p}
								onClick={() => onPotentialChange(p)}
							>
								<p className="font-semibold text-sm">{p}</p>
							</button>
						))}
					</div>
					<Input
						className="min-w-30"
						label="Уровень"
						max={15}
						min={0}
						onChange={(e) =>
							onPotentialInputChange(Number(e.target.value))
						}
						type="number"
						value={potentialState}
					/>
				</div>

				<Combobox
					maxSelected={getMaxaddsFromPotential(art.potential)}
					multiple
					onValuesChange={onSelectedStatsChange}
					options={addOptions}
					placeholder="ui.combobox.addStats.placeholder"
					values={(art.selectedStats ?? []).filter(
						(v): v is string => typeof v === 'string'
					)}
				/>
			</div>
		</>
	)
}

function QualityDropdown({
	art,
	percentState,
	qualityOverrides,
	onQualitySelect,
}: {
	art: { instanceId: string; percent: number; qualityClass?: ArtQuality }
	percentState: number
	qualityOverrides: Record<string, ArtQuality | undefined>
	onQualitySelect: (
		instanceId: string | undefined,
		choice: ArtQuality
	) => void
}) {
	const t = useTranslations()
	const candidates = getArtQualityCandidates(art.percent ?? percentState)
	if (candidates.length <= 1) return null

	const instanceId = art.instanceId
	const override = instanceId ? qualityOverrides[instanceId] : undefined
	const current = override ?? art.qualityClass

	const items: DropdownItem[] = candidates.map((q) => {
		const colorHex = infoColorMap[q as ArtQuality] ?? InfoColor.DEFAULT

		return {
			key: q,
			content: (
				<button
					className="flex w-full cursor-pointer items-center justify-between"
					onClick={() => onQualitySelect(instanceId, q as ArtQuality)}
				>
					<div className="flex items-center gap-2">
						<div
							className="h-4 w-4 rounded-sm"
							style={{ background: colorHex }}
						/>
						<p
							className="font-semibold text-[15px]"
							style={{ color: colorHex }}
						>
							{t(`arts.${q}`)}
						</p>
					</div>

					{current === q && (
						<Icon className="text-lg" icon="lucide:check" />
					)}
				</button>
			),
		}
	})

	const currentColorHex =
		infoColorMap[current as ArtQuality] ?? InfoColor.DEFAULT

	return (
		<DropdownMenu
			blur={false}
			className="px-2 py-0.5 text-[15px]"
			icon={currentColorHex}
			items={items}
			placement="bottom-start"
			title="modals.builds.quality"
		/>
	)
}
