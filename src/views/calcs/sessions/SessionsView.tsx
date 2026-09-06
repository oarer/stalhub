'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { arcadeMaps } from '@/data/arcadeMaps'
import { SessionForm } from './components/SessionForm'
import { SessionMaps } from './components/SessionMaps'
import { SessionPlan } from './components/SessionPlan'
import { SessionsTable } from './components/SessionsTable'
import {
	buildPlan,
	mapEval,
	repNeededForInput,
	type SessionInput,
} from './utils/sessions'

const defaultValues: SessionInput = {
	currentLevel: 1,
	currentPoints: 0,
	targetLevel: 40,
	hoursPerDay: 3,
	queueMin: 3,
	avgDamagePerKill: 150,
	includeCaptures: true,
	maxKillsPerMatch: 40,
	spartakBoost: 0,
}

export function SessionsView() {
	const t = useTranslations()

	const [values, setValues] = useState<SessionInput>(defaultValues)
	const [selected, setSelected] = useState<Set<string>>(
		() =>
			new Set(
				arcadeMaps
					.filter((map) => map.arcadeActive)
					.map((map) => map.id)
			)
	)

	const selectedMaps = useMemo(
		() => arcadeMaps.filter((map) => selected.has(map.id)),
		[selected]
	)

	const rankings = useMemo(() => {
		return selectedMaps
			.map((map) => mapEval(map, values))
			.sort((a, b) => {
				if (b.repPerDay !== a.repPerDay)
					return b.repPerDay - a.repPerDay
				return b.repPerHour - a.repPerHour
			})
	}, [selectedMaps, values])

	const best = rankings[0] ?? null

	const repNeeded = repNeededForInput(values)

	const plan = buildPlan(selectedMaps, values)

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const setIds = (ids: string[]) => setSelected(new Set(ids))

	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-32 pb-12 lg:pt-36">
			<div className="text-center">
				<h1
					className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('sessions.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('sessions.sub_title')}
				</p>
			</div>

			<div className="grid items-start gap-6 md:grid-cols-2">
				<SessionForm
					onChange={(patch) =>
						setValues((prev) => ({ ...prev, ...patch }))
					}
					values={values}
				/>

				<SessionPlan
					best={best}
					days={plan?.days ?? 0}
					repNeeded={repNeeded}
					targetReached={repNeeded <= 0}
					totalMatches={plan?.totalMatches ?? 0}
				/>
			</div>

			<SessionMaps
				maps={arcadeMaps}
				onSelect={setIds}
				onToggle={toggle}
				selected={selected}
			/>

			<SessionsTable
				bestMapId={best?.map.id ?? null}
				rankings={rankings}
			/>
		</section>
	)
}
