'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import {
	type ClanSchedule,
	type SundayActivity,
	TOURNAMENT_DAYS,
} from '@/types/clan/clan.type'
import { OptionDropdown } from '@/views/me/components/settings/OptionDropdown'

const SUNDAY_OPTIONS: Array<{ value: SundayActivity; label: string }> = [
	{ value: 'BASE_CAPTURE', label: 'clan.settings.sundayActivities.baseCapture' },
	{ value: 'BRAWL', label: 'clan.settings.sundayActivities.brawl' },
	{ value: 'NONE', label: 'clan.settings.sundayActivities.none' },
]

interface ScheduleSectionProps {
	schedule: ClanSchedule
	isPending: boolean
	onFieldChange: (
		key: keyof ClanSchedule,
		value: number | boolean | SundayActivity
	) => void
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
		<div className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:calendar-days" />
				{t('clan.settings.scheduleTitle')}
			</div>

			<Input
				label="clan.settings.scheduleFields.brawlsPerWeek"
				max={4}
				min={0}
				onChange={(e) =>
					onFieldChange('brawls_per_week', Number(e.target.value))
				}
				type="number"
				value={schedule.brawls_per_week}
			/>

			<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('clan.settings.sundayActivityLabel')}
					</span>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.settings.sundayActivityHint')}
					</span>
				</div>
				<OptionDropdown
					onSelect={(value) => onFieldChange('sunday_activity', value)}
					options={SUNDAY_OPTIONS}
					title={
						SUNDAY_OPTIONS.find(
							(option) => option.value === schedule.sunday_activity
						)?.label ?? 'clan.settings.sundayActivities.brawl'
					}
					value={schedule.sunday_activity}
				/>
			</div>

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
					checked={schedule.brawls_mandatory}
					disabled={isPending}
					onCheckedChange={(value) =>
						onFieldChange('brawls_mandatory', value)
					}
				/>
			</div>

			<p
				className={`${montserrat.className} font-semibold text-sm text-text-accent`}
			>
				{t('clan.settings.scheduleTotal', {
					tournament: TOURNAMENT_DAYS,
					brawl: schedule.brawls_per_week,
					mandatory: schedule.brawls_mandatory ? 'yes' : 'no',
				})}
			</p>

			<Button
				className="gap-2 self-start"
				disabled={isPending}
				onClick={onSave}
				type="button"
			>
				<Icon className="text-lg" icon="lucide:save" />
				{t('clan.settings.saveSchedule')}
			</Button>
		</div>
	)
}
