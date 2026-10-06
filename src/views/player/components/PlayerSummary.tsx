'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { playerQueries } from '@/queries/player/player.queries'
import type { Regions } from '@/types/api.type'
import type { Stat } from '@/types/player.type'

const PVE_IDS = [
	'mut-kil',
	'mut-pse-kil',
	'mut-dog-kil',
	'mut-flsh-kil',
	'mut-psi-kil',
	'mut-boar-kil',
	'mut-krv-kil',
	'mut-elp-kil',
	'mut-gig-kil',
	'mut-tush-kil',
	'mut-chi-kill',
]

function num(stats: Stat[], id: string): number {
	const s = stats.find((x) => x.id === id)
	const v = Number(s?.value ?? 0)
	return isNaN(v) ? 0 : v
}

function kd(k: number, d: number): string {
	if (d <= 0) return k > 0 ? k.toFixed(2) : '—'
	return (k / d).toFixed(2)
}

export default function PlayerSummary({
	stats,
	region,
	character,
}: {
	stats: Stat[]
	region: Regions
	character: string
}) {
	const t = useTranslations()
	const { data: ops } = useQuery(
		playerQueries.getOperations({ region, character })
	)

	const pvp = useMemo(() => {
		const kills = num(stats, 'kil')
		const deaths = num(stats, 'dea')
		const dmgPlayers = num(stats, 'dam-dea-pla')
		const dmgAll = num(stats, 'dam-dea-all')
		const shots = num(stats, 'sho-fir')
		const hits = num(stats, 'sho-hit')
		return {
			kills,
			deaths,
			kd: kd(kills, deaths),
			dmgPlayers,
			dmgAll,
			acc: shots > 0 ? ((hits / shots) * 100).toFixed(1) : '—',
		}
	}, [stats])

	const pve = useMemo(() => {
		const kills = PVE_IDS.reduce((a, id) => a + num(stats, id), 0)
		return { kills }
	}, [stats])

	const sessions = useMemo(() => {
		let mobKills = 0
		let deaths = 0
		let dmg = 0
		let count = 0
		for (const s of ops?.sessions ?? []) {
			for (const p of s.participants ?? []) {
				if (p.username?.toLowerCase() !== character.toLowerCase())
					continue
				mobKills += p.mobKills ?? 0
				deaths += p.death ?? 0
				dmg += p.damageDealt ?? 0
				count++
			}
		}
		return {
			count: count || (ops?.total ?? 0),
			mobKills,
			deaths,
			kd: kd(mobKills, deaths),
			avgDmg: count > 0 ? Math.round(dmg / count) : 0,
		}
	}, [ops, character])

	const cards = [
		{
			icon: 'lucide:crosshair',
			label: t('player.summary.kd'),
			value: pvp.kd,
			hint: `${pvp.kills} / ${pvp.deaths}`,
		},
		{
			icon: 'lucide:swords',
			label: t('player.summary.pvp'),
			value: `${pvp.kills}`,
			hint: `${pvp.dmgPlayers.toLocaleString()} dmg · ${pvp.acc}%`,
		},
		{
			icon: 'lucide:bug',
			label: t('player.summary.pve'),
			value: `${pve.kills}`,
			hint: t('player.summary.mutants'),
		},
		{
			icon: 'lucide:siren',
			label: t('player.summary.sessionKd'),
			value: sessions.kd,
			hint: `${sessions.mobKills} / ${sessions.deaths} · ${sessions.count}`,
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
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
					{cards.map((c) => (
						<div
							className="rounded-xl bg-accent/40 p-4"
							key={c.label}
						>
							<div className="flex items-center gap-2 text-foreground text-xs">
								<Icon icon={c.icon} />
								<span>{c.label}</span>
							</div>
							<div className="mt-1 font-bold font-mono text-2xl">
								{c.value}
							</div>
							<div className="mt-0.5 font-mono text-foreground text-xs">
								{c.hint}
							</div>
						</div>
					))}
				</div>
			</Card.Content>
		</Card.Root>
	)
}
