'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Section } from '../Section'

export function DangerZoneSection({
	onDeleteClick,
}: {
	onDeleteClick: () => void
}) {
	const t = useTranslations()

	return (
		<Section
			danger
			icon="lucide:triangle-alert"
			title={t('me.settings.dangerZone')}
		>
			<div className="rounded-lg border-2 border-red-500/20 bg-red-400/20 p-4">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-sm">
							{t('me.settings.deleteAccount')}
						</span>
						<span className="font-semibold text-red-400 text-xs">
							{t('me.settings.deleteAccountDesc')}
						</span>
					</div>
					<Button onClick={onDeleteClick} variant="danger">
						{t('me.settings.delete')}
					</Button>
				</div>
			</div>
		</Section>
	)
}
