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
			<div className="border-destructive/20 bg-destructive/10 rounded-lg border-2 p-4">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<span className="text-sm font-semibold">
							{t('me.settings.deleteAccount')}
						</span>
						<span className="text-destructive text-xs font-semibold">
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
