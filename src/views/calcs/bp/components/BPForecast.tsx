'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { type BPSimInput, type BPSimResult, simulateBP } from '../utils/bp'
import { BPProgressChart } from './BPProgressChart'
import type { BPFormState } from './bp-form-state'

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

function DayTable({ sim }: { sim: BPSimResult }) {
	const t = useTranslations()
	const rows = sim.days.filter((d) => d.gaming)
	return (
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>{t('bp.col_date')}</Table.Head>
					<Table.Head>{t('bp.col_xp')}</Table.Head>
					<Table.Head className="text-right">
						{t('bp.col_level')}
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{rows.map((d) => (
					<Table.Row key={d.date}>
						<Table.Cell>
							<div className="flex flex-wrap items-center gap-1">
								<span className="font-mono">
									{fmtShort(d.date)}
								</span>
								<span className="text-muted-foreground text-xs">
									{WEEKDAY_SHORT[d.weekday]}
								</span>
								{d.boosted && (
									<Badge variant="stalhub">+50%</Badge>
								)}
								{d.overloaded && (
									<Badge variant="secondary">
										{t('bp.mark_overload')}
									</Badge>
								)}
							</div>
						</Table.Cell>
						<Table.Cell>
							<span className="font-mono">+{fmtInt(d.xp)}</span>
						</Table.Cell>
						<Table.Cell className="text-right">
							<span className="font-mono font-semibold">
								{d.level}
							</span>
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
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
						className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2.5 ring-2 ring-primary/15"
						key={key}
					>
						<span className="font-medium text-sm">
							{t(`bp.compare_${key}`)}
						</span>
						<span className="flex items-center gap-2">
							<span className="font-mono font-semibold text-sm">
								{fmtInt(sim.projectedLevel)} {t('bp.levels')}
							</span>
							<Badge variant={ok ? 'success' : 'danger'}>
								{ok
									? t('bp.compare_ok')
									: `−${fmtInt(sim.deficitLevels)}`}
							</Badge>
						</span>
					</div>
				)
			})}
		</div>
	)
}

function StatCell({ value, hint }: { value: string; hint: string }) {
	return (
		<div>
			<div className="font-bold font-mono text-xl">{value}</div>
			<div className="text-muted-foreground text-xs">{hint}</div>
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
			<Card.Root className="flex flex-col gap-4">
				<Card.Header className="flex-row items-center justify-between">
					<Card.Title>
						<Icon
							className="text-neutral-700 text-xl dark:text-neutral-300"
							icon="lucide:chart-line"
						/>
						<h2>{t('bp.forecast')}</h2>
					</Card.Title>
					<Badge variant={ok ? 'success' : 'secondary'}>
						{ok ? t('bp.badge_ok') : t('bp.badge_lack')}
					</Badge>
				</Card.Header>

				<Card.Content className="flex flex-col gap-4">
					<div>
						<Card.Description>
							{t('bp.goal', { level: state.targetLevel })}
						</Card.Description>
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
									? t('bp.sub_ok', {
											count: sim.spareGamingDays,
										})
									: t('bp.sub_lack', {
											xp: fmtInt(sim.deficitXP),
										})}
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
							<span className="font-mono font-semibold">
								{fmtInt(sim.projectedLevel)} {t('bp.levels')}
							</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-linear-to-r from-muted/50 to-primary transition-all"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-2">
						<StatCell
							hint={t('bp.stat_days')}
							value={String(sim.gamingDays)}
						/>
						<StatCell
							hint={t('bp.stat_pace')}
							value={sim.gamingDays > 0 ? fmtPace(pace) : '—'}
						/>
						<StatCell
							hint={t('bp.stat_spare')}
							value={String(sim.spareGamingDays)}
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Tabs.Root onValueChange={setTab} value={tab}>
					<Tabs.List className="grid w-full grid-cols-2">
						<Tabs.Trigger value="progress">
							{t('bp.tab_progress')}
						</Tabs.Trigger>
						<Tabs.Trigger value="compare">
							{t('bp.tab_compare')}
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="progress">
						<div className="flex flex-col gap-3">
							<BPProgressChart sim={sim} />
							<Button
								className="w-fit"
								onClick={() => setShowDaily((v) => !v)}
								size="sm"
								type="button"
								variant="ghost"
							>
								{showDaily
									? t('bp.hide_daily')
									: t('bp.show_daily')}
							</Button>
							{showDaily && <DayTable sim={sim} />}
						</div>
					</Tabs.Content>
					<Tabs.Content value="compare">
						<CompareTab base={toSimInput(state, todayISO)} />
					</Tabs.Content>
				</Tabs.Root>
			</Card.Root>
		</div>
	)
}
