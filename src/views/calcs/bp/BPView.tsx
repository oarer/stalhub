'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { BPForm } from './components/BPForm'
import { BPPlan } from './components/BPPlan'
import {
	type BPInput,
	buildBPPlan,
	computeDaysUntilSeasonEnd,
} from './utils/bp'

type BPViewProps = {
	variant?: 'page' | 'widget'
}

const defaults: Omit<BPInput, 'daysLeft'> = {
	currentLevel: 1,
	targetLevel: 200,
	maxTasksPerDay: 15,
	donations: 0,
	overloads: true,
	boost3d: false,
}

export function BPView({ variant = 'page' }: BPViewProps) {
	const t = useTranslations()

	const [daysLeft, setDaysLeft] = useState<number | null>(null)
	const [values, setValues] = useState<BPInput>({
		...defaults,
		daysLeft: 0,
	})

	useEffect(() => {
		setDaysLeft((prev) => prev ?? computeDaysUntilSeasonEnd(new Date()))
	}, [])

	const input: BPInput = useMemo(
		() => ({ ...values, daysLeft: daysLeft ?? 0 }),
		[values, daysLeft]
	)

	const onChange = (patch: Partial<BPInput>) => {
		setValues((prev) => ({ ...prev, ...patch }))
	}

	const plan = useMemo(() => buildBPPlan(input), [input])

	return (
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto flex max-w-5xl flex-col gap-10 px-4 pt-32 lg:pt-36'
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
			<div className="grid gap-6 md:grid-cols-2">
				<BPForm
					daysLeft={daysLeft}
					onChange={onChange}
					onDaysLeftChange={setDaysLeft}
					values={values}
				/>

				<BPPlan plan={plan} />
			</div>
		</section>
	)
}
