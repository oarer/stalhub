'use client'

import { Icon } from '@iconify/react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import { type BPSimInput, type BPSimResult, simulateBP } from '../utils/bp'
import type { BPFormState } from './bp-form-state'
import { BPProgressChart } from './BPProgressChart'

const fmtInt = (n: number) => Math.round(n).toLocaleString('ru-RU')
const fmtPace = (n: number) => n.toFixed(1).replace('.', ',')
const fmtDayMonth = (iso: string) =>
	new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
	})
const fmtShort = (iso: string) =>
	new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function toSimInput(s: BPFormState, startISO: string): BPSimInput {
	return {
		startISO,
		deadlineISO: s.deadlineISO,
		currentLevel: s.currentLevel,
		targetLevel: s.targetLevel,
		tasksPerDay: s.tasksPerDay,
		weekdays: s.weekdays,
		overloadMode: s.overloadMode,
		overloadStock: s.overloadStock,
		donationPacks: s.donationPacks,
		boostOn: s.boostOn,
		boostStartISO: s.boostStartISO,
		boostDays: s.boostDays,
	}
}

function DayTable({
	sim,
	compact,
}: {
	sim: BPSimResult
	compact?: boolean
}) {
	const t = useTranslations()
	const rows = compact ? sim.days.filter((d) => d.gaming) : sim.days
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left text-muted-foreground">
						<th className="py-1.5 pr-3 font-medium">{t('bp.col_date')}</th>
						{!compact && (
							<th className="py-1.5 pr-3 font-medium">{t('bp.col_tasks')}</th>
						)}
						<th className="py-1.5 pr-3 font-medium">{t('bp.col_xp')}</th>
						<th className="py-1.5 font-medium">{t('bp.col_level')}</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((d) => (
						<tr
							className="border-border/50 border-t"
							key={d.date}
						>
							<td className="py-1.5 pr-3 font-mono whitespace-nowrap">
								{fmtShort(d.date)}
								<span className="ml-1.5 text-muted-foreground text-xs">
									{WEEKDAY_SHORT[d.weekday]}
								</span>
								{d.boosted && (
									<span className="ml-1.5 rounded bg-amber-500/15 px-1 py-0.5 text-amber-500 text-[11px]">
										+50%
									</span>
								)}
								{d.overloaded && (
									<span className="ml-1.5 rounded bg-sky-500/15 px-1 py-0.5 text-sky-500 text-[11px]">
										{t('bp.mark_overload')}
									</span>
								)}
							</td>
							{!compact && (
								<td className="py-1.5 pr-3 font-mono">
									{d.gaming ? d.tasks : '—'}
								</td>
							)}
							<td className="py-1.5 pr-3 font-mono">
								{d.gaming ? `+${fmtInt(d.xp)}` : '—'}
							</td>
							<td className="py-1.5 font-mono font-semibold">
								{d.level}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function CompareTab({ base }: { base: BPSimInput }) {
	const t = useTranslations()
	const scenarios = useMemo(() => {
		const defs: { key: string; input: BPSimInput }[] = [
			{ key: 'plan', input: base },
			{ key: 'no_overload', input: { ...base, overloadMode: 'off' } },
			{ key: 'no_boost', input: { ...base, boostOn: false } },
			{ key: 'calm', input: { ...base, tasksPerDay: 7 } },
		]
		return defs.map((d) => ({ ...d, sim: simulateBP(d.input) }))
	}, [base])

	return (
		<div className="flex flex-col gap-2">
			{scenarios.map(({ key, sim }) => {
				const ok = sim.deficitLevels <= 0
				return (
					<div
						className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
						key={key}
					>
						<span className="font-medium text-sm">
							{t(`bp.compare_${key}`)}
						</span>
						<span className="flex items-center gap-2">
							<span className="font-mono text-sm">
								{fmtInt(sim.projectedLevel)} {t('bp.levels')}
							</span>
							<span
								className={cn(
									'rounded-full px-2 py-0.5 font-semibold text-xs',
									ok
										? 'bg-green-500/15 text-green-500'
										: 'bg-red-500/15 text-red-500'
								)}
							>
								{ok
									? t('bp.compare_ok')
									: `−${fmtInt(sim.deficitLevels)}`}
							</span>
						</span>
					</div>
				)
			})}
		</div>
	)
}

export function BPForecast({
	state,
	sim,
	todayISO,
}: {
	state: BPFormState
	sim: BPSimResult
	todayISO: string
}) {
	const t = useTranslations()
	const [tab, setTab] = useState('progress')
	const [showDaily, setShowDaily] = useState(false)

	const alreadyDone =
		state.currentLevel + sim.donationLevels >= state.targetLevel
	const ok = alreadyDone || sim.deficitLevels <= 0

	const pace =
		sim.gamingDays > 0
			? (sim.projectedLevel - state.currentLevel) / sim.gamingDays
			: 0

	const progress = (() => {
		const span = state.targetLevel - state.currentLevel
		if (span <= 0) return 100
		return Math.min(
			100,
			Math.max(
				0,
				((sim.projectedLevel - state.currentLevel) / span) * 100
			)
		)
	})()

	return (
		<div className="flex min-w-0 flex-col gap-4">
			<div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2 font-semibold text-[15px]">
						<Icon className="size-4 text-muted-foreground" icon="lucide:target" />
						{t('bp.forecast')}
					</div>
					<span
						className={cn(
							'rounded-full px-2.5 py-1 font-semibold text-xs',
							ok
								? 'bg-green-500/15 text-green-500'
								: 'bg-muted text-muted-foreground'
						)}
					>
						{ok ? t('bp.badge_ok') : t('bp.badge_lack')}
					</span>
				</div>

				<div>
					<p className="text-muted-foreground text-sm">
						{t('bp.goal', { level: state.targetLevel })}
					</p>
					<p className="mt-1 font-bold text-[26px] leading-tight">
						{alreadyDone
							? t('bp.headline_done')
							: ok && sim.reachedISO
								? t('bp.headline_ok', {
										date: fmtDayMonth(sim.reachedISO),
									})
								: t('bp.headline_lack', {
										count: fmtInt(sim.deficitLevels),
									})}
					</p>
					{!alreadyDone && (
						<p className="mt-1 text-muted-foreground text-sm">
							{ok
								? t('bp.sub_ok', { count: sim.spareGamingDays })
								: t('bp.sub_lack', { xp: fmtInt(sim.deficitXP) })}
						</p>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between text-muted-foreground text-xs">
						<span>
							{t('bp.to_deadline', {
								date: fmtDayMonth(state.deadlineISO),
							})}
						</span>
						<span className="font-mono">
							{fmtInt(sim.projectedLevel)} {t('bp.levels')}
						</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-foreground transition-all"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-2">
					<div>
						<div className="font-mono font-bold text-xl">
							{sim.gamingDays}
						</div>
						<div className="text-muted-foreground text-xs">
							{t('bp.stat_days')}
						</div>
					</div>
					<div>
						<div className="font-mono font-bold text-xl">
							{sim.gamingDays > 0 ? fmtPace(pace) : '—'}
						</div>
						<div className="text-muted-foreground text-xs">
							{t('bp.stat_pace')}
						</div>
					</div>
					<div>
						<div className="font-mono font-bold text-xl">
							{sim.spareGamingDays}
						</div>
						<div className="text-muted-foreground text-xs">
							{t('bp.stat_spare')}
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
				<Tabs.Root onValueChange={setTab} value={tab}>
					<Tabs.List className="grid w-full grid-cols-3">
						<Tabs.Trigger value="progress">
							{t('bp.tab_progress')}
						</Tabs.Trigger>
						<Tabs.Trigger value="calendar">
							{t('bp.tab_calendar')}
						</Tabs.Trigger>
						<Tabs.Trigger value="compare">
							{t('bp.tab_compare')}
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="progress">
						<div className="flex flex-col gap-3">
							<BPProgressChart sim={sim} />
							<button
								className="w-fit font-semibold text-primary text-sm hover:underline"
								onClick={() => setShowDaily((v) => !v)}
								type="button"
							>
								{showDaily
									? t('bp.hide_daily')
									: t('bp.show_daily')}
							</button>
							{showDaily && <DayTable compact sim={sim} />}
						</div>
					</Tabs.Content>
					<Tabs.Content value="calendar">
						<DayTable sim={sim} />
					</Tabs.Content>
					<Tabs.Content value="compare">
						<CompareTab base={toSimInput(state, todayISO)} />
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</div>
	)
}
