'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

//! TODO проверить бэк, падает при попытке (422)
interface SyncSectionProps {
	isPending: boolean
	onSync: () => void
}

export function SyncSection({ isPending, onSync }: SyncSectionProps) {
	const t = useTranslations()
	return (
		<div className="flex items-center justify-between rounded-lg bg-background p-4">
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2 font-semibold text-lg">
					<Icon className="text-xl" icon="lucide:refresh-cw" />
					{t('clan.settings.syncTitle')}
				</div>
				<span className="font-semibold text-sm text-text-accent">
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
