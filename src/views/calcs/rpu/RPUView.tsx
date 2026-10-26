'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { RPUForm } from './components/RPUForm'
import { calculateRpu, formatRpu, rpuDefaults } from './utils/rpu'

type RPUViewProps = {
	variant?: 'page' | 'widget'
}

export function RPUView({ variant = 'page' }: RPUViewProps) {
	const t = useTranslations()

	const [hours, setHours] = useState(rpuDefaults.hours)
	const [kd, setKd] = useState(rpuDefaults.kd)
	const [fi, setFi] = useState(rpuDefaults.fi)
	const [donate, setDonate] = useState(rpuDefaults.donate)

	const result = useMemo(
		() => formatRpu(calculateRpu({ hours, kd, fi, donate })),
		[hours, kd, fi, donate]
	)

	return (
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-32 lg:pt-36'
			}
		>
			{variant === 'page' && (
				<div className="flex flex-col gap-2">
					<h1
						className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
					>
						{t('rpu.title')}
					</h1>
					<p className="font-medium text-muted-foreground text-sm">
						{t('rpu.sub_title')}
					</p>
				</div>
			)}

			<RPUForm
				donate={donate}
				fi={fi}
				hours={hours}
				kd={kd}
				onDonateChange={setDonate}
				onFiChange={setFi}
				onHoursChange={setHours}
				onKdChange={setKd}
				result={result}
			/>
		</section>
	)
}
