'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { mtsWide, unbounded } from '@/app/fonts'

export function FeatureList({
	features,
	namespace,
}: {
	features: ReadonlyArray<{ id: string; icon: string }>
	namespace: string
}) {
	const t = useTranslations(namespace)

	return (
		<dl className="border-primary/40 flex flex-col border-t-2">
			{features.map((feature) => (
				<div
					className="border-primary/40 flex flex-col gap-2 border-b-2 py-4"
					key={feature.id}
				>
					<div className="flex items-center gap-4">
						<Icon className="text-xl" icon={feature.icon} />
						<dt
							className={`${unbounded.className} text-lg font-semibold`}
						>
							{t(`features.${feature.id}.title`)}
						</dt>
					</div>
					<dd
						className={`${mtsWide.className} text-foreground/80 text-sm font-medium`}
					>
						{t(`features.${feature.id}.desc`)}
					</dd>
				</div>
			))}
		</dl>
	)
}
