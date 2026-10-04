'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { seasonDeadline, seasonStartDate, simulateBP, toISODate } from './utils/bp'
import { BPDashboardForm } from './components/BPDashboardForm'
import { ALL_WEEK, type BPFormState } from './components/bp-form-state'
import { BPForecast } from './components/BPForecast'

type BPViewProps = {
	variant?: 'page' | 'widget'
}

const DAY_MS = 86_400_000

export function BPView({ variant = 'page' }: BPViewProps) {
	const t = useTranslations()
	const today = useMemo(() => new Date(), [])
	const todayISO = toISODate(today)

	const [state, setState] = useState<BPFormState>(() => ({
		currentLevel: 1,
		targetLevel: 1000,
		deadlineISO: toISODate(seasonDeadline(today)),
		tasksPerDay: 25,
		weekdays: [...ALL_WEEK],
		overloadMode: 'full',
		overloadStock: 0,
		donationPacks: 0,
		boostOn: true,
		boostStartISO: todayISO,
		boostDays: 3,
	}))

	const onChange = (patch: Partial<BPFormState>) =>
		setState((prev) => ({ ...prev, ...patch }))

	const seasonWeeks = useMemo(() => {
		const start = seasonStartDate(today).getTime()
		const end = seasonDeadline(today).getTime()
		return Math.max(1, Math.round((end - start) / (7 * DAY_MS)))
	}, [today])

	const sim = useMemo(
		() =>
			simulateBP({
				startISO: todayISO,
				deadlineISO: state.deadlineISO,
				currentLevel: state.currentLevel,
				targetLevel: state.targetLevel,
				tasksPerDay: state.tasksPerDay,
				weekdays: state.weekdays,
				overloadMode: state.overloadMode,
				overloadStock: state.overloadStock,
				donationPacks: state.donationPacks,
				boostOn: state.boostOn,
				boostStartISO: state.boostStartISO,
				boostDays: state.boostDays,
			}),
		[state, todayISO]
	)

	return (
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-32 pb-12 lg:pt-36'
			}
		>
			{variant === 'page' && (
				<>
					<h1
						className={`${mtsExtended.className} font-medium text-[28px] leading-none`}
					>
						{t('bp.title')}
					</h1>
					<p className="font-medium text-muted-foreground text-sm">
						{t('bp.sub_title')}
					</p>
				</>
			)}
			<div className="grid items-start gap-4 lg:grid-cols-[340px_1fr]">
				<BPDashboardForm
					onChange={onChange}
					seasonWeeks={seasonWeeks}
					state={state}
					todayISO={todayISO}
				/>
				<BPForecast sim={sim} state={state} todayISO={todayISO} />
			</div>
		</section>
	)
}
