'use client'

import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { exboQueries } from '@/queries/exbo/exbo.queries'
import { personalQueries } from '@/queries/personal/personal.queries'
import { personalService } from '@/services/personal/personal.service'
import { Regions } from '@/types/api.type'
import { StatChart } from './StatChart'
import { PersonalSessions } from './PersonalSessions'

const STAT_LABELS: Record<string, string> = {
	'kil': 'Убийства',
	'bul-dea': 'Смерти',
	'pla-tim': 'Время в игре',
	'reg-tim': 'Время в рейде',
	'sho-fir': 'Выстрелов',
	'sho-hit': 'Попаданий',
	'sho-hea': 'Хедшотов',
	'max-kil-ser': 'Макс. серия',
	'gre-thr': 'Гранаты',
}

export default function PersonalAnalyticsView() {
	const qc = useQueryClient()
	const { data: profile } = useSuspenseQuery(personalQueries.getMe())

	if (!profile) return <LinkCharacter onLinked={() => qc.invalidateQueries({ queryKey: ['personal'] })} />

	return <AnalyticsContent key={profile.character_name} onChanged={() => qc.invalidateQueries({ queryKey: ['personal'] })} />
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
			toast.error(e instanceof Error ? e.message : t('linkError'))
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
				{([Regions.RU, Regions.EU, Regions.NA] as Regions[]).map((r) => (
					<Button
						key={r}
						onClick={() => setRegion(r)}
						size="sm"
						variant={region === r ? 'primary' : 'outline'}
					>
						{r}
					</Button>
				))}
			</div>
			{characters && characters.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground text-sm">{t('yourCharacters')}</p>
					{characters.map((c) => (
						<button
							className="flex cursor-pointer items-center justify-between rounded-lg bg-accent px-3 py-2 text-sm transition hover:brightness-110"
							disabled={busy}
							key={c.uuid}
							onClick={() => submit(c.username)}
							type="button"
						>
							<span className="font-medium">{c.username}</span>
							<span className="text-muted-foreground text-xs">{t('track')}</span>
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
				<Button disabled={busy || !name.trim()} onClick={() => submit(name)}>
					{t('linkAction')}
				</Button>
			</div>
		</Card.Root>
	)
}

function AnalyticsContent({ onChanged }: { onChanged: () => void }) {
	const t = useTranslations('personal')
	const qc = useQueryClient()
	const { data: profile } = useSuspenseQuery(personalQueries.getMe())
	const { data: summary, isLoading } = useSuspenseQuery(personalQueries.getSummary())
	const { data: stageStats } = useSuspenseQuery(personalQueries.getStageStats())
	const [statId, setStatId] = useState('kil')
	const [busy, setBusy] = useState(false)

	const statIds = useMemo(() => Object.keys(summary?.series ?? {}), [summary])
	const last = summary?.last
	const lastStats = useMemo(() => {
		const map = new Map<string, number | string>()
		for (const s of last?.stats ?? []) map.set(s.id, s.value)
		return map
	}, [last])
	useEffect(() => {
		if (statIds.length > 0 && !statIds.includes(statId)) setStatId(statIds[0]!)
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
			toast.error(e instanceof Error ? e.message : t('snapshotError'))
		} finally {
			setBusy(false)
		}
	}

	const togglePublic = async () => {
		try {
			await personalService.setVisibility(!profile.is_public)
			toast.success(t('visibilityOk'))
			invalidateAll()
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Error')
		}
	}

	const unlink = async () => {
		if (!confirm(t('unlinkConfirm'))) return
		await personalService.unlink()
		invalidateAll()
	}

	const publicUrl =
		typeof window !== 'undefined' && profile.is_public
			? `${window.location.origin}/stats/${profile.character_name}`
			: null

	return (
		<div className="flex flex-col gap-4">
			<Card.Root className="flex flex-col gap-3 p-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="font-semibold text-lg">{profile.character_name}</h2>
						<p className="text-muted-foreground text-sm">
							{profile.region} · {t('snapshots', { n: summary?.snapshots ?? 0 })}
							{profile.last_snapshot_at &&
								` · ${new Date(profile.last_snapshot_at).toLocaleString()}`}
						</p>
						{last?.profile?.clan && (
							<p className="text-muted-foreground text-sm">
								[{last.profile.clan.tag}] {last.profile.clan.name}
							</p>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button disabled={busy} onClick={refresh} size="sm">
							{t('refresh')}
						</Button>
						<Button onClick={togglePublic} size="sm" variant="outline">
							{profile.is_public ? t('makePrivate') : t('makePublic')}
						</Button>
						<Button onClick={unlink} size="sm" variant="ghost">
							{t('unlink')}
						</Button>
					</div>
				</div>
				{publicUrl && (
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
				)}
			</Card.Root>

			{isLoading ? (
				<Skeleton className="h-64 w-full" />
			) : (summary?.snapshots ?? 0) === 0 ? (
				<Card.Root className="p-5 text-muted-foreground text-sm">{t("noSnapshots")}</Card.Root>
			) : (
				<>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{(statIds.slice(0, 8)).map((id) => (
							<Card.Root className="p-3" key={id}>
								<p className="text-muted-foreground text-xs">{STAT_LABELS[id] ?? id}</p>
								<p className="font-semibold text-lg">
									{String(lastStats.get(id) ?? '—')}
								</p>
								<p
									className={
										(summary?.deltas[id] ?? 0) >= 0
											? 'text-green-500 text-xs'
											: 'text-red-500 text-xs'
									}
								>
									{(summary?.deltas[id] ?? 0) > 0 ? '+' : ''}
									{summary?.deltas[id] ?? 0}
								</p>
							</Card.Root>
						))}
					</div>
					<Card.Root className="flex flex-col gap-3 p-5">
						<div className="flex flex-wrap gap-2">
							{statIds.map((id) => (
								<Button
									key={id}
									onClick={() => setStatId(id)}
									size="sm"
									variant={statId === id ? 'primary' : 'outline'}
								>
									{STAT_LABELS[id] ?? id}
								</Button>
							))}
						</div>
						<StatChart
							label={STAT_LABELS[statId] ?? statId}
							points={(summary?.series[statId] ?? []).map((p) => ({
								t: p.t,
								v: typeof p.v === 'number' ? p.v : Number(p.v) || 0,
							}))}
						/>
					</Card.Root>
				</>
			)}

			<Card.Root className="flex flex-col gap-2 p-5">
				<h3 className="font-semibold">{t('stagesTitle')}</h3>
				<p className="text-muted-foreground text-sm">
					{t('stagesHint', {
						sessions: stageStats?.sessions ?? 0,
						kills: stageStats?.kills ?? 0,
					})}
				</p>
			</Card.Root>

			<PersonalSessions region={profile.region} />
		</div>
	)
}
