'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/Switch'

interface RecruitingSectionProps {
	recruiting: boolean
	isPending: boolean
	onToggle: (value: boolean) => void
}

export function RecruitingSection({
	recruiting,
	isPending,
	onToggle,
}: RecruitingSectionProps) {
	const t = useTranslations()
	return (
		<div className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:megaphone" />
				{t('clan.settings.recruitingTitle')}
			</div>
			<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('clan.settings.acceptRequests')}
					</span>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.settings.acceptRequestsHint')}
					</span>
				</div>
				<Switch
					checked={recruiting}
					disabled={isPending}
					onCheckedChange={onToggle}
				/>
			</div>
		</div>
	)
}
