'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { personalQueries } from '@/queries/personal/personal.queries'
import { MetricSelect } from './MetricSelect'
import { StageSummaryCard } from './StageSummaryCard'
import { type ChartMode, StatChart } from './StatChart'
import {
	buildDerivedSeries,
	formatDelta,
	formatStatValue,
	OVERVIEW_STATS,
	toNumber,
} from './statMeta'
import { usePersonalLabels } from './hooks/usePersonalLabels'

export function PublicPersonalView({ username }: { username: string }) {
	const t = useTranslations('personal')
	const { statLabel, locale } = usePersonalLabels()
	const { data } = useSuspenseQuery(personalQueries.getPublic(username))
	const [statId, setStatId] = useState<string>('kil')
	const [mode, setMode] = useState<ChartMode>('absolute')

	const rawSeries = useMemo(() => {
		const map: Record<string, { t: string; v: number }[]> = {}
		for (const s of data.snapshots) {
			for (const st of s.stats) {
				if (typeof st.value !== 'number') continue
				;(map[st.id] ??= []).push({
					t: s.created_at,
					v: toNumber(st.value),
				})
			}
		}
		for (const pts of Object.values(map))
			pts.sort((a, b) => +new Date(a.t) - +new Date(b.t))
		return map
	}, [data])

	const series = useMemo(
		() => ({ ...rawSeries, ...buildDerivedSeries(rawSeries) }),
		[rawSeries]
	)
	const ids = useMemo(() => Object.keys(series).sort(), [series])
	const derivedIds = useMemo(
		() => new Set(Object.keys(series).filter((id) => !(id in rawSeries))),
		[series, rawSeries]
	)

	const lastValues = useMemo(() => {
		const m = new Map<string, number>()
		const last = data.snapshots[data.snapshots.length - 1]
		for (const s of last?.stats ?? []) {
			if (typeof s.value === 'number') m.set(s.id, s.value)
		}
		const kil = m.get('kil') ?? 0
		const dea = m.get('dea') ?? 0
		m.set('kd', dea > 0 ? kil / dea : kil)
		const fir = m.get('sho-fir') ?? 0
		const hit = m.get('sho-hit') ?? 0
		const hea = m.get('sho-hea') ?? 0
		m.set('accuracy', fir > 0 ? hit / fir : 0)
		m.set('hs-rate', hit > 0 ? hea / hit : 0)
		return m
	}, [data])

	const points = series[statId] ?? series[ids[0]!] ?? []
	const delta =
		points.length >= 2 ? points[points.length - 1]!.v - points[0]!.v : 0
	const alliance =
		data.snapshots[data.snapshots.length - 1]?.profile?.alliance ?? null

	return (
		<div className="mx-auto flex max-w-4xl flex-col gap-4 px-2 pt-28 pb-12 xl:pt-36">
			<Card.Root className="flex flex-col gap-2 p-5">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-card p-1">
						{alliance ? (
							<Image
								alt={alliance}
								height={28}
								src={`/images/alliance/${alliance}.png`}
								width={28}
							/>
						) : (
							<Icon className="size-7" icon="lucide:user" />
						)}
					</div>
					<div>
						<h1 className="font-semibold text-xl">
							{data.profile.character_name}
						</h1>
						<p className="text-muted-foreground text-sm">
							{data.user.username} · {data.profile.region} ·{' '}
							{t('snapshots', { n: data.snapshots.length })}
							{data.profile.last_snapshot_at &&
								` · ${new Date(data.profile.last_snapshot_at).toLocaleString(locale)}`}
						</p>
					</div>
				</div>
			</Card.Root>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{OVERVIEW_STATS.filter((id) => series[id]).map((id) => (
					<Card.Root className="p-3" key={id}>
						<p className="text-muted-foreground text-xs">
							{statLabel(id)}
						</p>
						<p className="truncate font-semibold text-lg">
							{formatStatValue(id, lastValues.get(id) ?? 0, locale)}
						</p>
					</Card.Root>
				))}
			</div>

			{data.stage_stats && (
				<StageSummaryCard stageStats={data.stage_stats} />
			)}

			{ids.length > 0 && (
				<Card.Root className="flex flex-col gap-3 p-5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h3 className="font-semibold">{t('dynamics')}</h3>
						<div className="flex gap-2">
							<Button
								onClick={() => setMode('absolute')}
								size="sm"
								variant={
									mode === 'absolute' ? 'primary' : 'outline'
								}
							>
								{t('absolute')}
							</Button>
							<Button
								onClick={() => setMode('delta')}
								size="sm"
								variant={
									mode === 'delta' ? 'primary' : 'outline'
								}
							>
								{t('growth')}
							</Button>
						</div>
					</div>
					<MetricSelect
						derivedIds={derivedIds}
						ids={ids}
						onChange={setStatId}
						value={statId}
					/>
					<div className="flex flex-wrap gap-x-4 text-sm">
						<span className="font-medium">
							{statLabel(statId)}
						</span>
						<span
							className={
								delta >= 0 ? 'text-green-500' : 'text-red-500'
							}
						>
							{formatDelta(statId, delta, locale)} {t('forPeriod')}
						</span>
					</div>
					<StatChart
						label={statLabel(statId)}
						mode={mode}
						points={points}
						statId={statId}
					/>
				</Card.Root>
			)}
		</div>
	)
}
