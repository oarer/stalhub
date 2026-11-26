'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

interface SyncSectionProps {
	isPending: boolean
	onSync: () => void
}

export function SyncSection({ isPending, onSync }: SyncSectionProps) {
	const t = useTranslations()
	return (
		<div className="bg-card flex items-center justify-between rounded-lg p-4">
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2 text-lg font-semibold">
					<Icon className="text-xl" icon="lucide:refresh-cw" />
					{t('clan.settings.syncTitle')}
				</div>
				<span className="text-foreground text-sm font-semibold">
					{t('clan.settings.syncDesc')}
				</span>
			</div>
			<Button
				disabled={isPending}
				loading={isPending}
				onClick={onSync}
				variant={'secondary'}
			>
				<Icon className="text-base" icon="lucide:refresh-cw" />
			</Button>
		</div>
	)
}
