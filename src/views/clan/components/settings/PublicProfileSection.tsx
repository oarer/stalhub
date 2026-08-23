'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import { Switch } from '@/components/ui/Switch'

interface PublicProfileSectionProps {
	isPublic: boolean
	isPending: boolean
	onToggle: (value: boolean) => void
}

export function PublicProfileSection({
	isPublic,
	isPending,
	onToggle,
}: PublicProfileSectionProps) {
	const t = useTranslations()
	return (
		<div className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:eye" />
				{t('clan.settings.publicTitle')}
			</div>

			<Alert.Root>
				<Alert.Description>
					{t('clan.settings.publicDesc')}
				</Alert.Description>
			</Alert.Root>

			<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('clan.settings.publicToggle')}
					</span>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.settings.publicToggleHint')}
					</span>
				</div>
				<Switch
					checked={isPublic}
					disabled={isPending}
					onCheckedChange={onToggle}
				/>
			</div>
		</div>
	)
}
