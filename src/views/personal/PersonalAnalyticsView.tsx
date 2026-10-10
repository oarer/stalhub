'use client'

import { Icon } from '@iconify/react'
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import { exboQueries } from '@/queries/exbo/exbo.queries'
import { personalQueries } from '@/queries/personal/personal.queries'
import { personalService } from '@/services/personal/personal.service'
import { Regions } from '@/types/api.type'
import { usePersonalLabels } from './hooks/usePersonalLabels'
import { MetricSelect } from './MetricSelect'
import { PersonalSessions } from './PersonalSessions'
import { StageSummaryCard } from './StageSummaryCard'
import { type ChartMode, StatChart } from './StatChart'
import {
	buildDerivedSeries,
	formatDelta,
	formatStatValue,
	OVERVIEW_STATS,
	type SeriesPoint,
	toNumber,
} from './statMeta'

function apiError(e: unknown, fallback: string): string {
	if (typeof e === 'object' && e !== null && 'response' in e) {
		const r = (e as { response?: { data?: { error?: string } } }).response
		if (r?.data?.error) return r.data.error
	}
	return e instanceof Error ? e.message : fallback
}

export default function PersonalAnalyticsView() {
	const qc = useQueryClient()
	const { data: profile } = useSuspenseQuery(personalQueries.getMe())

	if (!profile)
		return (
			<LinkCharacter
				onLinked={() =>
					qc.invalidateQueries({ queryKey: ['personal'] })
				}
			/>
		)

	return (
		<AnalyticsContent
			key={profile.character_name}
			onChanged={() => qc.invalidateQueries({ queryKey: ['personal'] })}
		/>
	)
}

function LinkCharacter({ onLinked }: { onLinked: () => void }) {
	const t = useTranslations('personal')
	const [region, setRegion] = useState<Regions>(Regions.RU)
	const [name, setName] = useState('')
	const [busy, setBusy] = useState(false)
	const { data: characters } = useQuery(exboQueries.getCharacters(region))

	const submit = async (character: string) => {
		if (!character.trim()) return
		setBusy(true)
		try {
			await personalService.link(region, character.trim())
			toast.success(t('linked'))
			onLinked()
		} catch (e) {
			toast.error(apiError(e, t('linkError')))
		} finally {
			setBusy(false)
		}
	}

	return (
		<Card.Root className="flex flex-col gap-4 p-5">
			<div>
				<h2 className="font-semibold text-lg">{t('title')}</h2>
				<p className="text-muted-foreground text-sm">{t('linkHint')}</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{([Regions.RU, Regions.EU, Regions.NA] as Regions[]).map(
					(r) => (
						<Button
							key={r}
							onClick={() => setRegion(r)}
							size="sm"
							variant={region === r ? 'primary' : 'outline'}
						>
							{r}
						</Button>
					)
				)}
			</div>
			{characters && characters.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground text-sm">
						{t('yourCharacters')}
					</p>
					{characters.map((c) => (
						<button
							className="flex cursor-pointer items-center justify-between rounded-lg bg-accent px-3 py-2 text-sm transition hover:brightness-110"
							disabled={busy}
							key={c.uuid}
							onClick={() => submit(c.username)}
							type="button"
						>
							<span className="font-medium">{c.username}</span>
							<span className="text-muted-foreground text-xs">
								{t('track')}
							</span>
						</button>
					))}
				</div>
			)}
			<div className="flex gap-2">
				<Input
					onChange={(e) => setName(e.target.value)}
					placeholder={t('characterPlaceholder')}
					value={name}
				/>
				<Button
					disabled={busy || !name.trim()}
					onClick={() => submit(name)}
				>
					{t('linkAction')}
				</Button>
			</div>
		</Card.Root>
	)
}

function AnalyticsContent({ onChanged }: { onChanged: () => void }) {
	const t = useTranslations('personal')
	const { statLabel, locale } = usePersonalLabels()
	const qc = useQueryClient()
	const { data: profile } = useSuspenseQuery(personalQueries.getMe())
	const { data: summary, isLoading } = useSuspenseQuery(
		personalQueries.getSummary()
	)
	const { data: stageStats } = useSuspenseQuery(
		personalQueries.getStageStats()
	)
	const [statId, setStatId] = useState<string>('kil')
	const [mode, setMode] = useState<ChartMode>('absolute')
	const [tab, setTab] = useState('overview')
	const [busy, setBusy] = useState(false)
	const [visibilityBusy, setVisibilityBusy] = useState(false)
	const [unlinkOpen, setUnlinkOpen] = useState(false)
	const [unlinkBusy, setUnlinkBusy] = useState(false)

	const rawSeries: Record<string, SeriesPoint[]> = useMemo(() => {
		const out: Record<string, SeriesPoint[]> = {}
		for (const [id, pts] of Object.entries(summary?.series ?? {})) {
			out[id] = pts.map((p) => ({ t: p.t, v: toNumber(p.v) }))
		}
		return out
	}, [summary])

	const derived = useMemo(() => buildDerivedSeries(rawSeries), [rawSeries])
	const series: Record<string, SeriesPoint[]> = useMemo(
		() => ({ ...rawSeries, ...derived }),
		[rawSeries, derived]
	)

	const statIds = useMemo(() => Object.keys(series).sort(), [series])
	const derivedIds = useMemo(() => new Set(Object.keys(derived)), [derived])

	const lastValues = useMemo(() => {
		const map = new Map<string, number>()
		const last = summary?.last
		for (const s of last?.stats ?? []) {
			if (typeof s.value === 'number') map.set(s.id, s.value)
		}

		const kil = map.get('kil') ?? 0
		const dea = map.get('dea') ?? 0
		map.set('kd', dea > 0 ? kil / dea : kil)
		const fir = map.get('sho-fir') ?? 0
		const hit = map.get('sho-hit') ?? 0
		const hea = map.get('sho-hea') ?? 0
		map.set('accuracy', fir > 0 ? hit / fir : 0)
		map.set('hs-rate', hit > 0 ? hea / hit : 0)
		return map
	}, [summary])

	const totalDeltas = useMemo(() => {
		const map = new Map<string, number>(
			Object.entries(summary?.deltas ?? {}).map(([k, v]) => [
				k,
				Number(v),
			])
		)

		for (const id of ['kd', 'accuracy', 'hs-rate']) {
			const pts = series[id]
			if (pts && pts.length >= 2)
				map.set(id, pts[pts.length - 1]!.v - pts[0]!.v)
		}
		return map
	}, [summary, series])

	useEffect(() => {
		if (statIds.length > 0 && !statIds.includes(statId))
			setStatId(statIds[0]!)
	}, [statIds, statId])

	if (!profile) return null

	const invalidateAll = () => {
		qc.invalidateQueries({ queryKey: ['personal'] })
		onChanged()
	}

	const refresh = async () => {
		setBusy(true)
		try {
			await personalService.snapshotNow()
			toast.success(t('snapshotOk'))
			invalidateAll()
		} catch (e) {
			toast.error(apiError(e, t('snapshotError')))
		} finally {
			setBusy(false)
		}
	}

	const togglePublic = async () => {
		setVisibilityBusy(true)
		try {
			await personalService.setVisibility(!profile.is_public)
			toast.success(t('visibilityOk'))
			invalidateAll()
		} catch (e) {
			toast.error(apiError(e, 'Error'))
		} finally {
			setVisibilityBusy(false)
		}
	}

	const unlink = async () => {
		setUnlinkBusy(true)
		try {
			await personalService.unlink()
			invalidateAll()
		} catch (e) {
			toast.error(apiError(e, 'Error'))
		} finally {
			setUnlinkBusy(false)
		}
	}

	const publicUrl =
		typeof window !== 'undefined' && profile.is_public
			? `${window.location.origin}/stats/${encodeURIComponent(profile.character_name)}`
			: null

	const keyCards = OVERVIEW_STATS.filter(
		(id) => series[id] && series[id]!.length > 0
	)

	const selectedPoints = series[statId] ?? []
	const selectedDelta = totalDeltas.get(statId) ?? 0

	return (
		<div className="flex flex-col gap-4">
			<Card.Root className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-card p-1">
							{summary?.last?.profile?.alliance ? (
								<Image
									alt={summary.last.profile.alliance}
									height={28}
									src={`/images/alliance/${summary.last.profile.alliance}.png`}
									width={28}
								/>
							) : (
								<Icon className="size-7" icon="lucide:user" />
							)}
						</div>
						<div>
							<h2 className="font-semibold text-lg">
								{profile.character_name}
							</h2>
							<p className="text-muted-foreground text-sm">
								{profile.region} ·{' '}
								{t('snapshots', { n: summary?.snapshots ?? 0 })}
								{profile.last_snapshot_at &&
									` · ${new Date(profile.last_snapshot_at).toLocaleString(locale)}`}
							</p>
							{summary?.last?.profile?.clan && (
								<p className="text-muted-foreground text-sm">
									[{summary.last.profile.clan.tag}]{' '}
									{summary.last.profile.clan.name}
								</p>
							)}
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button disabled={busy} onClick={refresh} size="sm">
							{busy ? t('refreshing') : t('refresh')}
						</Button>
						<Button
							disabled={visibilityBusy}
							onClick={togglePublic}
							size="sm"
							variant={profile.is_public ? 'outline' : 'primary'}
						>
							{profile.is_public
								? t('makePrivate')
								: t('makePublic')}
						</Button>
						<Modal.Root
							onOpenChange={setUnlinkOpen}
							open={unlinkOpen}
						>
							<Modal.Trigger variant="ghost">
								{t('unlink')}
							</Modal.Trigger>
							<Modal.Content className="max-w-md">
								<Modal.Header>
									<Modal.Title>
										{t('unlinkTitle')}
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									{t.rich('unlinkBody', {
										name: ` «${profile.character_name}»`,
										span: (chunks) => (
											<span className="font-mono font-semibold text-primary text-sm">
												{chunks}
											</span>
										),
										danger: (chunks) => (
											<span className="text-red-300">
												{chunks}
											</span>
										),
									})}
								</Modal.Body>
								<Modal.Footer>
									<Modal.Close>{t('cancel')}</Modal.Close>
									<Modal.Action
										className="gap-2"
										closeOnClick
										disabled={unlinkBusy}
										onClick={unlink}
										variant="danger"
									>
										{unlinkBusy ? (
											<Icon
												className="animate-spin text-base"
												icon="lucide:loader-circle"
											/>
										) : (
											<Icon
												className="text-base"
												icon="lucide:unlink"
											/>
										)}
										{t('unlink')}
									</Modal.Action>
								</Modal.Footer>
							</Modal.Content>
						</Modal.Root>
					</div>
				</div>
				{publicUrl ? (
					<button
						className="cursor-pointer truncate rounded-lg bg-accent px-3 py-2 text-left text-primary text-sm hover:underline"
						onClick={() => {
							navigator.clipboard.writeText(publicUrl)
							toast.success(t('copied'))
						}}
						type="button"
					>
						{publicUrl}
					</button>
				) : (
					<p className="text-muted-foreground text-xs">
						{t('privateHint')}
					</p>
				)}
			</Card.Root>

			<Tabs.Root onValueChange={setTab} value={tab}>
				<Tabs.List className="grid grid-cols-3">
					<Tabs.Trigger value="overview">
						{t('tabOverview')}
					</Tabs.Trigger>
					<Tabs.Trigger value="stages">{t('tabStages')}</Tabs.Trigger>
					<Tabs.Trigger value="sessions">
						{t('tabSessions')}
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="overview">
					{isLoading ? (
						<Skeleton className="h-64 w-full" />
					) : (summary?.snapshots ?? 0) === 0 ? (
						<Card.Root className="p-5 text-muted-foreground text-sm">
							{t('noSnapshots')}
						</Card.Root>
					) : (
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
								{keyCards.map((id) => {
									const v = lastValues.get(id)
									const d = totalDeltas.get(id) ?? 0
									return (
										<button
											className={`cursor-pointer rounded-xl p-3 text-left ring-2 transition hover:brightness-110 ${
												statId === id
													? 'bg-primary/10 ring-primary/60'
													: 'bg-card ring-primary/30'
											}`}
											key={id}
											onClick={() => setStatId(id)}
											type="button"
										>
											<p className="text-muted-foreground text-xs">
												{statLabel(id)}
											</p>
											<p className="truncate font-semibold text-xl">
												{v !== undefined
													? formatStatValue(
															id,
															v,
															locale
														)
													: '—'}
											</p>
											<p
												className={`text-xs ${d >= 0 ? 'text-primary' : 'text-destructive'}`}
											>
												{formatDelta(id, d, locale)} ·{' '}
												{t('forPeriod')}
											</p>
										</button>
									)
								})}
							</div>

							<Card.Root className="flex flex-col gap-3 p-5">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<MetricSelect
										derivedIds={derivedIds}
										ids={statIds}
										onChange={setStatId}
										value={statId}
									/>
									<div className="flex gap-2">
										<Button
											onClick={() => setMode('absolute')}
											size="sm"
											variant={
												mode === 'absolute'
													? 'primary'
													: 'outline'
											}
										>
											{t('absolute')}
										</Button>
										<Button
											onClick={() => setMode('delta')}
											size="sm"
											variant={
												mode === 'delta'
													? 'primary'
													: 'outline'
											}
										>
											{t('growth')}
										</Button>
									</div>
								</div>

								<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
									<span className="font-medium">
										{statLabel(statId)}
									</span>
									<span
										className={
											selectedDelta >= 0
												? 'text-green-500'
												: 'text-red-500'
										}
									>
										{formatDelta(
											statId,
											selectedDelta,
											locale
										)}{' '}
										{t('forPeriod')}
									</span>
								</div>
								<StatChart
									label={statLabel(statId)}
									mode={mode}
									points={selectedPoints}
									statId={statId}
								/>
							</Card.Root>
						</div>
					)}
				</Tabs.Content>

				<Tabs.Content value="stages">
					<StageSummaryCard stageStats={stageStats} />
				</Tabs.Content>

				<Tabs.Content value="sessions">
					<PersonalSessions region={profile.region} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}
