'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { ARTEFACT_META_KEYS } from '@/constants/artefact_meta.const'
import { MAX_UPGRADE_LEVEL } from '@/constants/upgrade.const'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { upgradePricesQueries } from '@/queries/calcs/upgrade-prices.queries'
import { Regions } from '@/types/api.type'
import type { Item } from '@/types/item.type'
import type {
	UpgradeItemKey,
	UpgradePriceEntry,
	UpgradePricesResponse,
} from '@/types/upgrade.type'
import { UpgradeForm } from './components/UpgradeForm'
import { UpgradeResult } from './components/UpgradeResult'
import {
	type CostInputs,
	computeUpgrade,
	type UpgradeMode,
	type UpgradeTarget,
} from './utils/upgrade'

export type UpgradeViewProps = {
	variant?: 'page' | 'widget'
}

export type MarketPrices = {
	catalyst: number | null
	energy: number | null
	tools: Partial<Record<UpgradeItemKey, number | null>>
}

const DEFAULT_COSTS: CostInputs = {
	artifactKey: 'art.jarka_crystal',
	attemptCost: 5,
	useAmplifier: false,
	amplifierCost: 10,
	energyPrice: 10,
}

const marketPricesFromResponse = (
	response?: UpgradePricesResponse
): MarketPrices | null => {
	if (!response) return null

	const tools: MarketPrices['tools'] = {}
	let catalyst: number | null = null
	let energy: number | null = null

	for (const p of response.prices) {
		if (p.key === 'catalyst') catalyst = p.min_price
		if (p.key === 'quantum_battery') energy = p.energy_price
		if (p.key !== 'catalyst' && p.key !== 'quantum_battery') {
			tools[p.key] = p.min_price
		}
	}

	return { catalyst, energy, tools }
}

export function UpgradeView({ variant = 'page' }: UpgradeViewProps) {
	const t = useTranslations()

	const artifactsQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const artifacts = artifactsQuery.data

	const pricesQuery = useQuery(upgradePricesQueries.get(Regions.RU))
	const marketPrices = useMemo(
		() => marketPricesFromResponse(pricesQuery.data),
		[pricesQuery.data]
	)

	const [target, setTarget] = useState<UpgradeTarget>('artefact')
	const [mode, setMode] = useState<UpgradeMode>('luck')
	const [fromLevel, setFromLevel] = useState(0)
	const [toLevel, setToLevel] = useState(MAX_UPGRADE_LEVEL)
	const [costs, setCosts] = useState<CostInputs>(DEFAULT_COSTS)
	const autoSynced = useRef(false)

	useEffect(() => {
		if (!marketPrices || autoSynced.current) return

		autoSynced.current = true
		setCosts((prev) => ({
			...prev,
			amplifierCost: marketPrices.catalyst ?? prev.amplifierCost,
			energyPrice: marketPrices.energy ?? prev.energyPrice,
		}))
	}, [marketPrices])

	const artifactOptions = useMemo(
		() =>
			artifacts
				.flatMap((item) => {
					const key = itemNameKey(item)
					if (!key || !isMetaArtifact(key)) return []
					return [{ key, label: itemLabel(item) }]
				})
				.sort((a, b) => a.label.localeCompare(b.label, 'ru')),
		[artifacts]
	)

	const result = useMemo(
		() =>
			computeUpgrade(
				target,
				fromLevel,
				toLevel,
				mode,
				costs,
				marketPrices?.tools
			),
		[target, fromLevel, toLevel, mode, costs, marketPrices]
	)

	const selectedLabel =
		artifactOptions.find((o) => o.key === costs.artifactKey)?.label ??
		itemLabelFind(artifacts, costs.artifactKey)

	const pricesList = pricesQuery.data?.prices ?? []
	const pricesUpdatedAt = pricesQuery.data?.updated_at ?? null

	return (
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36'
			}
		>
			{variant === 'page' && (
				<div className="text-center">
					<h1
						className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
					>
						{t('upgrade.title')}
					</h1>
					<p className="font-semibold text-sm text-text-accent">
						{t('upgrade.subtitle')}
					</p>
				</div>
			)}

			<UpgradeForm
				artifactOptions={artifactOptions}
				costs={costs}
				fromLevel={fromLevel}
				mode={mode}
				onCostsChange={setCosts}
				onFromLevelChange={setFromLevel}
				onModeChange={setMode}
				onTargetChange={setTarget}
				onToLevelChange={setToLevel}
				selectedArtifactLabel={selectedLabel}
				target={target}
				toLevel={toLevel}
			/>

			{result.rows.length > 0 ? (
				<UpgradeResult
					prices={pricesList}
					pricesUpdatedAt={pricesUpdatedAt}
					result={result}
				/>
			) : (
				<div className="flex items-center justify-center gap-2 rounded-xl bg-card/50 px-5 py-10 text-muted-foreground ring-2 ring-primary/30">
					<p className="font-semibold">{t('upgrade.empty')}</p>
				</div>
			)}
		</section>
	)
}

function itemNameKey(item: Item): string | null {
	const message = item.name
	if (message.type !== 'translation') return null
	const key = message.key
	if (!key?.startsWith('item.') || !key.endsWith('.name')) return null
	return key.slice('item.'.length, -'.name'.length)
}

function isMetaArtifact(key: string): boolean {
	return ARTEFACT_META_KEYS.has(key)
}

function itemLabel(item: Item): string {
	const message = item.name
	if (message.type === 'translation') {
		return message.lines?.ru ?? message.key ?? ''
	}
	return ''
}

function itemLabelFind(items: Item[], key: string): string {
	for (const it of items) {
		if (itemNameKey(it) === key) return itemLabel(it) || key
	}
	return key
}

export type { UpgradePriceEntry }
