'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import type { ModuleGroupKey, ModuleRarity } from '@/types/module.type'
import type { ArtifactAdditional } from '@/utils/artUtils'
import {
	getModuleGroupByAttributeType,
	useModulesData,
} from '@/views/calcs/modules/utils/moduleCalc'
import {
	type AuctionSortKey,
	type LotRangeFilter,
	RARITY_ORDER,
} from './auctionSort'

const SORT_OPTIONS: ComboboxOption[] = [
	{ value: 'default', label: 'items.auction.sort_default' },
	{ value: 'price', label: 'items.auction.sort_price' },
	{ value: 'rarity', label: 'items.auction.sort_rarity' },
]

const RARITY_OPTIONS: ComboboxOption[] = RARITY_ORDER.map((rarity) => ({
	value: rarity,
	label: `arts.ART_QUALITY_${rarity.toUpperCase()}`,
}))

const GROUP_ORDER: ModuleGroupKey[] = ['add-on', 'deviation', 'concept']

const GROUP_LABEL_KEYS: Record<ModuleGroupKey, string> = {
	'add-on': 'modules.groupAddOn',
	deviation: 'modules.groupDeviation',
	concept: 'modules.groupConcept',
}

type Props = {
	lots: { additional?: ArtifactAdditional }[]
	sort: AuctionSortKey
	onSortChange: (sort: AuctionSortKey) => void
	selectedModules: string[]
	onSelectedModulesChange: (values: string[]) => void
	selectedRarities: ModuleRarity[]
	onSelectedRaritiesChange: (values: ModuleRarity[]) => void
	price: LotRangeFilter
	onPriceChange: (range: LotRangeFilter) => void
}

export function AuctionControls({
	lots,
	sort,
	onSortChange,
	selectedModules,
	onSelectedModulesChange,
	selectedRarities,
	onSelectedRaritiesChange,
	price,
	onPriceChange,
}: Props) {
	const t = useTranslations()
	const modules = useModulesData()

	const categoryOptions = useMemo(() => {
		const byGroup = new Map<ModuleGroupKey, ComboboxOption[]>()
		const groupByKey = new Map<string, ModuleGroupKey>()
		const nameByKey = new Map<string, string>()

		for (const group of modules.groups) {
			for (const module of group.modules) {
				groupByKey.set(module.key, group.key)
				nameByKey.set(module.key, module.lines.ru)
			}
		}

		for (const lot of lots) {
			for (const attr of lot.additional?.attributes ?? []) {
				const group =
					groupByKey.get(attr.definitionId) ??
					getModuleGroupByAttributeType(attr.type)

				const list = byGroup.get(group) ?? []
				if (list.some((o) => o.value === attr.definitionId)) {
					continue
				}

				list.push({
					value: attr.definitionId,
					label:
						nameByKey.get(attr.definitionId) ?? attr.definitionId,
				})
				byGroup.set(group, list)
			}
		}

		return byGroup
	}, [lots, modules])

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<Combobox
					className="w-full sm:w-56"
					onValueChange={(v) =>
						onSortChange((v || 'default') as AuctionSortKey)
					}
					options={SORT_OPTIONS}
					placeholder="items.auction.sort"
					value={sort}
				/>

				<Combobox
					className="w-full sm:w-56"
					multiple
					onValuesChange={(values) =>
						onSelectedRaritiesChange(values as ModuleRarity[])
					}
					options={RARITY_OPTIONS}
					placeholder="items.auction.sort_rarity"
					values={selectedRarities}
				/>
				<div className="relative flex items-center gap-2">
					<Input
						className="w-full sm:w-21"
						label={t('items.auction.range_from')}
						min={0}
						onChange={(e) =>
							onPriceChange({
								...price,
								min:
									e.target.value === ''
										? undefined
										: Number(e.target.value),
							})
						}
						type="number"
						value={price.min ?? ''}
					/>

					<span
						className={`${montserrat.className} font-bold text-text-accent text-xs uppercase tracking-widest`}
					>
						цена
					</span>

					<Input
						className="w-full sm:w-21"
						label={t('items.auction.range_to')}
						min={0}
						onChange={(e) =>
							onPriceChange({
								...price,
								max:
									e.target.value === ''
										? undefined
										: Number(e.target.value),
							})
						}
						type="number"
						value={price.max ?? ''}
					/>
				</div>
			</div>
			<div className="flex justify-between">
				{GROUP_ORDER.map((group) => {
					const options = categoryOptions.get(group)
					if (!options?.length) return null

					return (
						<Combobox
							className="w-full sm:w-56"
							key={group}
							multiple
							onValuesChange={onSelectedModulesChange}
							options={options}
							placeholder={GROUP_LABEL_KEYS[group]}
							values={selectedModules}
						/>
					)
				})}
			</div>
		</div>
	)
}
