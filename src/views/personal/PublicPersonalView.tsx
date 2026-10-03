'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { personalQueries } from '@/queries/personal/personal.queries'
import { StatChart } from './StatChart'

const STAT_LABELS: Record<string, string> = {
	'kil': 'Убийства',
	'bul-dea': 'Смерти',
	'pla-tim': 'Время в игре',
	'sho-fir': 'Выстрелов',
	'sho-hit': 'Попаданий',
	'sho-hea': 'Хедшотов',
	'max-kil-ser': 'Макс. серия',
	'gre-thr': 'Гранаты',
}

export function PublicPersonalView({ username }: { username: string }) {
	const t = useTranslations('personal')
	const { data } = useSuspenseQuery(personalQueries.getPublic(username))
	const [statId, setStatId] = useState('kil')

	const series = useMemo(() => {
		const map: Record<string, { t: string; v: number }[]> = {}
		for (const s of data.snapshots) {
			for (const st of s.stats) {
				if (typeof st.value !== 'number') continue
				;(map[st.id] ??= []).push({ t: s.created_at, v: Number(st.value) })
			}
		}
		return map
	}, [data])

	const ids = Object.keys(series)

	return (
		<div className="mx-auto flex max-w-4xl flex-col gap-4 px-2 pt-28 pb-12 xl:pt-36">
			<Card.Root className="flex flex-col gap-2 p-5">
				<h1 className="font-semibold text-xl">{data.profile.character_name}</h1>
				<p className="text-muted-foreground text-sm">
					{data.user.username} · {data.profile.region} · {t('snapshots', { n: data.snapshots.length })}
				</p>
			</Card.Root>
			{ids.length > 0 && (
				<Card.Root className="flex flex-col gap-3 p-5">
					<div className="flex flex-wrap gap-2">
						{ids.map((id) => (
							<button
								className={`rounded-md px-2 py-1 text-sm ${statId === id ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}
								key={id}
								onClick={() => setStatId(id)}
								type="button"
							>
								{STAT_LABELS[id] ?? id}
							</button>
						))}
					</div>
					<StatChart
						label={STAT_LABELS[statId] ?? statId}
						points={series[statId] ?? []}
					/>
				</Card.Root>
			)}
		</div>
	)
}
