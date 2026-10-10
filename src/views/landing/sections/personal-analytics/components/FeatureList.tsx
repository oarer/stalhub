'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { mtsWide, unbounded } from '@/app/fonts'
import { PERSONAL_FEATURES } from '../config'

export function PersonalFeatureList() {
	const t = useTranslations('landing.personal')

	return (
		<dl className="flex flex-col border-primary/40 border-t-2">
			{PERSONAL_FEATURES.map((feature) => (
				<div
					className="flex flex-col gap-2 border-primary/40 border-b-2 py-4"
					key={feature.id}
				>
					<div className="flex items-center gap-4">
						<Icon className="text-xl" icon={feature.icon} />
						<dt
							className={`${unbounded.className} font-semibold text-lg`}
						>
							{t(`features.${feature.id}.title`)}
						</dt>
					</div>
					<dd
						className={`${mtsWide.className} font-medium text-foreground/80 text-sm`}
					>
						{t(`features.${feature.id}.desc`)}
					</dd>
				</div>
			))}
		</dl>
	)
}
