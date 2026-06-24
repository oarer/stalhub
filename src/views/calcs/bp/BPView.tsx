'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { BPForm } from './components/BPForm'
import { BPResults } from './components/BPResults'
import { simulateXP } from './utils/bp'

export function BPView() {
	const t = useTranslations()

	const [days, setDays] = useState(90)
	const [playDays, setPlayDays] = useState(7)
	const [tasks, setTasks] = useState(20)
	const [overloads, setOverloads] = useState(15)
	const [currentLevel, setCurrentLevel] = useState(0)

	const xpWithoutOverload = useMemo(() => {
		return simulateXP(days, playDays, tasks, 0)
	}, [days, playDays, tasks])

	const xpWithOverload = useMemo(() => {
		return simulateXP(days, playDays, tasks, overloads)
	}, [days, playDays, tasks, overloads])

	const levelWithout = Math.floor(xpWithoutOverload / 1000) + currentLevel
	const levelWith = Math.floor(xpWithOverload / 1000) + currentLevel
	const difference = levelWith - levelWithout

	return (
		<section className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pt-32 lg:pt-36">
			<div className="text-center">
				<h1
					className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('bp.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('bp.sub_title')}
				</p>
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<BPForm
					currentLevel={currentLevel}
					days={days}
					onCurrentLevelChange={setCurrentLevel}
					onDaysChange={setDays}
					onOverloadsChange={setOverloads}
					onPlayDaysChange={setPlayDays}
					onTasksChange={setTasks}
					overloads={overloads}
					playDays={playDays}
					tasks={tasks}
				/>

				<BPResults
					difference={difference}
					levelWith={levelWith}
					levelWithout={levelWithout}
				/>
			</div>
		</section>
	)
}
