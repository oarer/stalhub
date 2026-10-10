'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import type { Stat } from '@/types/player.type'

const STAT_KEYS = {
	generalKills: 'kil',
	generalDeaths: 'bul-dea',
	sessionKills: 'kills-bf',
	sessionDeaths: 'deaths-bf',
	colosseumKills: 'pres-kills',
	colosseumDeaths: 'pres-deaths',
	colosseumGames: 'pres-plays',
} as const

function num(stats: Stat[], id: string): number {
	const s = stats.find((x) => x.id === id)
	const v = Number(s?.value ?? 0)
	return isNaN(v) ? 0 : v
}

function kd(k: number, d: number): string {
	if (d <= 0) return k > 0 ? k.toFixed(2) : '—'
	return (k / d).toFixed(2)
}

export default function PlayerSummary({ stats }: { stats: Stat[] }) {
	const t = useTranslations()

	const pvp = useMemo(() => {
		const kills = num(stats, STAT_KEYS.generalKills)
		const deaths = num(stats, STAT_KEYS.generalDeaths)
		return {
			kills,
			deaths,
			kd: kd(kills, deaths),
		}
	}, [stats])

	const sessions = useMemo(() => {
		const kills = num(stats, STAT_KEYS.sessionKills)
		const deaths = num(stats, STAT_KEYS.sessionDeaths)
		return { kills, deaths, kd: kd(kills, deaths) }
	}, [stats])

	const colosseum = useMemo(() => {
		const kills = num(stats, STAT_KEYS.colosseumKills)
		const deaths = num(stats, STAT_KEYS.colosseumDeaths)
		const games = num(stats, STAT_KEYS.colosseumGames)
		return { kills, deaths, games, kd: kd(kills, deaths) }
	}, [stats])

	const cards = [
		{
			icon: 'lucide:crosshair',
			label: t('player.summary.kd'),
			value: pvp.kd,
			hint: `${pvp.kills} / ${pvp.deaths}`,
		},
		{
			icon: 'lucide:siren',
			label: t('player.summary.sessionKd'),
			value: sessions.kd,
			hint: `${sessions.kills} / ${sessions.deaths}`,
		},
		{
			icon: 'lucide:trophy',
			label: t('player.summary.colosseumKd'),
			value: colosseum.kd,
			hint: `${colosseum.kills} / ${colosseum.deaths} · ${colosseum.games} ${t('player.summary.games')}`,
		},
	]

	return (
		<Card.Root>
			<Card.Header className="gap-1">
				<div className="flex items-center gap-2">
					<Icon className="text-xl" icon="lucide:layout-dashboard" />
					<h2 className="font-semibold text-xl">
						{t('player.summary.title')}
					</h2>
				</div>
			</Card.Header>
			<Card.Content>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{cards.map((c) => (
						<div
							className="flex flex-col gap-1 rounded-xl bg-accent/40 p-4"
							key={c.label}
						>
							<div className="flex items-center gap-2 text-foreground text-xs">
								<Icon icon={c.icon} />
								<span>{c.label}</span>
							</div>
							<div className="font-bold font-mono text-2xl">
								{c.value}
							</div>
							<div className="font-mono font-semibold text-[11px] text-muted-foreground">
								{c.hint}
							</div>
						</div>
					))}
				</div>
			</Card.Content>
		</Card.Root>
	)
}
