'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { type ClanSchedule, TOURNAMENT_DAYS } from '@/types/clan/clan.type'

interface ScheduleSectionProps {
	schedule: ClanSchedule
	isPending: boolean
	onFieldChange: (key: keyof ClanSchedule, value: number | boolean) => void
	onSave: () => void
}

export function ScheduleSection({
	schedule,
	isPending,
	onFieldChange,
	onSave,
}: ScheduleSectionProps) {
	const t = useTranslations()
	return (
		<div className="flex flex-col gap-3 rounded-xl bg-background px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:calendar-days" />
				{t('clan.settings.scheduleTitle')}
			</div>

			<Input
				label="clan.settings.scheduleFields.brawlsPerWeek"
				max={4}
				min={0}
				onChange={(e) =>
					onFieldChange('brawlsPerWeek', Number(e.target.value))
				}
				type="number"
				value={schedule.brawlsPerWeek}
			/>

			<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('clan.settings.brawlsMandatoryLabel')}
					</span>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.settings.brawlsMandatoryHint')}
					</span>
				</div>
				<Switch
					checked={schedule.brawlsMandatory}
					disabled={isPending}
					onCheckedChange={(value) =>
						onFieldChange('brawlsMandatory', value)
					}
				/>
			</div>

			<p
				className={`${montserrat.className} font-semibold text-sm text-text-accent`}
			>
				{t('clan.settings.scheduleTotal', {
					tournament: TOURNAMENT_DAYS,
					brawl: schedule.brawlsPerWeek,
					mandatory: schedule.brawlsMandatory ? 'yes' : 'no',
				})}
			</p>

			<Button
				className="self-start"
				disabled={isPending}
				onClick={onSave}
				type="button"
			>
				{t('clan.settings.saveSchedule')}
			</Button>
		</div>
	)
}
