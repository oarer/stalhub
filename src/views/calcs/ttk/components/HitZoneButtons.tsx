'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { HitZone } from '../constants/ttk'
import { HIT_ZONES } from '../constants/ttk'

interface HitZoneButtonsProps {
	hitZone: HitZone
	onChange: (zone: HitZone) => void
}

export function HitZoneButtons({ hitZone, onChange }: HitZoneButtonsProps) {
	const t = useTranslations()

	return (
		<Card.Header className="flex flex-row items-center gap-4">
			{HIT_ZONES.map((z) => (
				<Button
					className={`flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-sm transition-all ${hitZone === z.value && 'bg-red-500/15 text-red-400 dark:ring-red-300/60'}`}
					key={z.value}
					onClick={() => onChange(z.value)}
					type="button"
					variant={'outline'}
				>
					{t(z.labelKey)}
				</Button>
			))}
		</Card.Header>
	)
}
