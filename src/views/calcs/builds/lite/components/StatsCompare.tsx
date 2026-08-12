'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { memo, useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import type { Build } from '@/types/build.type'
import { roundNumber } from '../../model/components/hooks/buildStatsUtils'
import { useBuildStats } from '../../model/components/hooks/useBuildStats'

type StatsCompareProps = {
	buildA: Build
	buildB: Build
	nameA: string
	nameB: string
}

const BETTER_COLOR = '#53C353'
const WORSE_COLOR = '#C15252'

function mergeKeys(
	listA: [string, number][],
	listB: [string, number][]
): string[] {
	const keys: string[] = []
	const seen = new Set<string>()
	for (const entry of [...listA, ...listB]) {
		if (seen.has(entry[0])) continue
		seen.add(entry[0])
		keys.push(entry[0])
	}
	return keys
}

const CompareValueRow = memo(function CompareValueRow({
	name,
	keyName,
	valueA,
	valueB,
	isPercent,
}: {
	name: string
	keyName?: string
	valueA: number
	valueB: number
	isPercent?: boolean
}) {
	const isAccumulation = keyName
		? keyName.toLowerCase().includes('accumulation')
		: false
	const aBetter = isAccumulation ? valueA < valueB : valueA > valueB
	const bBetter = isAccumulation ? valueB < valueA : valueB > valueA
	const equal = valueA === valueB

	const colorFor = (better: boolean) =>
		equal ? undefined : better ? BETTER_COLOR : WORSE_COLOR

	return (
		<p className="grid grid-cols-[1fr_5rem_5rem] items-center gap-3">
			<span className="truncate">{name}</span>
			<span
				className={`${montserrat.className} w-20 rounded-lg px-2 text-right font-semibold`}
				style={{
					color: colorFor(aBetter),
					background: `${colorFor(aBetter)}66`,
				}}
			>
				{roundNumber(valueA)}
				{isPercent ? '%' : ''}
			</span>
			<span
				className={`${montserrat.className} w-20 rounded-lg px-2 text-right font-semibold`}
				style={{
					color: colorFor(bBetter),
					background: `${colorFor(bBetter)}66`,
				}}
			>
				{roundNumber(valueB)}
				{isPercent ? '%' : ''}
			</span>
		</p>
	)
})

function CompareHeaderRow({ nameA, nameB }: { nameA: string; nameB: string }) {
	const t = useTranslations()

	return (
		<p className="grid grid-cols-[1fr_5rem_5rem] items-center gap-3 border-border-secondary border-b pb-2">
			<span className="font-bold">{t('build.stats.title')}</span>
			<span className="w-20 truncate text-right font-bold">{nameA}</span>
			<span className="w-20 truncate text-right font-bold">{nameB}</span>
		</p>
	)
}

export function StatsCompare({
	buildA,
	buildB,
	nameA,
	nameB,
}: StatsCompareProps) {
	const t = useTranslations()

	const statsA = useBuildStats(buildA)
	const statsB = useBuildStats(buildB)

	const displayNamesMap = useMemo(
		() => ({ ...statsB.displayNamesMap, ...statsA.displayNamesMap }),
		[statsA.displayNamesMap, statsB.displayNamesMap]
	)
	const isPercentMap = useMemo(
		() => ({ ...statsB.isPercentMap, ...statsA.isPercentMap }),
		[statsA.isPercentMap, statsB.isPercentMap]
	)

	const allKeys = useMemo(
		() => mergeKeys(statsA.sortedStats, statsB.sortedStats),
		[statsA.sortedStats, statsB.sortedStats]
	)
	const containerKeys = useMemo(
		() =>
			mergeKeys(statsA.sortedContainerStats, statsB.sortedContainerStats),
		[statsA.sortedContainerStats, statsB.sortedContainerStats]
	)

	const allRows = useMemo(
		() =>
			allKeys.map((key) => (
				<CompareValueRow
					isPercent={isPercentMap[key]}
					key={key}
					keyName={key}
					name={displayNamesMap[key] ?? key}
					valueA={statsA.stats[key] ?? 0}
					valueB={statsB.stats[key] ?? 0}
				/>
			)),
		[allKeys, statsA.stats, statsB.stats, displayNamesMap, isPercentMap]
	)

	const containerRows = useMemo(
		() =>
			containerKeys.map((key) => (
				<CompareValueRow
					isPercent={isPercentMap[key]}
					key={key}
					keyName={key}
					name={displayNamesMap[key] ?? key}
					valueA={statsA.containerStats[key] ?? 0}
					valueB={statsB.containerStats[key] ?? 0}
				/>
			)),
		[
			containerKeys,
			statsA.containerStats,
			statsB.containerStats,
			displayNamesMap,
			isPercentMap,
		]
	)

	return (
		<Tabs.Root className="w-full" defaultValue="statsAll">
			<Tabs.List className="grid w-full grid-cols-2">
				<Tabs.Trigger value="statsAll">
					<Icon className="text-lg" icon="lucide:bar-chart-3" />
					{t('build.stats.all')}
				</Tabs.Trigger>
				<Tabs.Trigger value="statsCont">
					<Icon className="text-lg" icon="lucide:box" />
					{t('build.stats.container')}
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="statsAll">
				<Card.Root>
					<Card.Content className="flex flex-col gap-2 text-sm">
						<CompareHeaderRow nameA={nameA} nameB={nameB} />
						<CompareValueRow
							name={t('build.stats.prime')}
							valueA={Number(statsA.prime)}
							valueB={Number(statsB.prime)}
						/>
						<CompareValueRow
							isPercent
							name={t('build.stats.regen')}
							valueA={Number(statsA.hps)}
							valueB={Number(statsB.hps)}
						/>
						<div className="flex flex-col gap-2 border-neutral-700 border-t pt-2">
							{allKeys.length === 0 ? (
								<p className="text-neutral-500">
									{t('build.stats.no_stats')}
								</p>
							) : (
								allRows
							)}
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
			<Tabs.Content value="statsCont">
				<Card.Root>
					<Card.Content className="flex flex-col gap-2 text-sm">
						<CompareHeaderRow nameA={nameA} nameB={nameB} />
						{containerKeys.length === 0 ? (
							<p className="text-neutral-500">
								{t('build.stats.no_stats')}
							</p>
						) : (
							containerRows
						)}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	)
}
