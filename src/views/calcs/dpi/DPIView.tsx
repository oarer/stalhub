'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { DPIForm } from './components/DPIForm'
import { convertSens } from './utils/conversion'
import { games } from './utils/dpi.const'

type DPIViewProps = {
	variant?: 'page' | 'widget'
}

export function DPIView({ variant = 'page' }: DPIViewProps) {
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
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto flex max-w-3xl flex-col gap-10 px-4 pt-32 lg:pt-36'
			}
		>
			{variant === 'page' && (
				<>
					<h1
						className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
					>
						{t('dpi.title')}
					</h1>
					<p className="font-medium text-muted-foreground text-sm">
						{t('dpi.sub_title')}
					</p>
				</>
			)}

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
