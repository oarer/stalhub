'use client'

import { useMemo, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { DPIForm } from './components/DPIForm'
import { convertSens } from './utils/conversion'
import { games } from './utils/dpi.const'
import { useTranslations } from 'next-intl'

export function DPIView() {
	const t = useTranslations()

	const [sens, setSens] = useState(1)
	const [fromGame, setFromGame] = useState('cs-2')
	const [toGame, setToGame] = useState('stalcraft')

	const result = useMemo(() => {
		const from = games.find((g) => g.slug === fromGame)
		const to = games.find((g) => g.slug === toGame)
		if (!from || !to) return null
		return convertSens(sens, from, to)
	}, [sens, fromGame, toGame])

	return (
		<section className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pt-32 lg:pt-36">
			<div className="text-center">
				<h1
					className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('dpi.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('dpi.sub_title')}
				</p>
			</div>

			<DPIForm
				fromGame={fromGame}
				onFromGameChange={setFromGame}
				onSensChange={setSens}
				onToGameChange={setToGame}
				result={result || 0}
				sens={sens}
				toGame={toGame}
			/>
		</section>
	)
}
