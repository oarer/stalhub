'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import type { RecruitmentFormState } from '../../utils/recruitment'

interface RecruitingSectionProps {
	recruiting: boolean
	form: RecruitmentFormState
	hasSavedLeaderDiscord: boolean
	isPending: boolean
	onToggle: (value: boolean) => void
	onFieldChange: <K extends keyof RecruitmentFormState>(
		key: K,
		value: RecruitmentFormState[K]
	) => void
	onSave: () => void
}

export function RecruitingSection({
	recruiting,
	form,
	hasSavedLeaderDiscord,
	isPending,
	onToggle,
	onFieldChange,
	onSave,
}: RecruitingSectionProps) {
	const t = useTranslations()
	const leaderDiscordMissing = !form.leader_discord.trim()

	return (
		<div className="bg-card flex flex-col gap-3 rounded-xl px-5 py-4">
			<div className="flex items-center gap-2 text-lg font-semibold">
				<Icon className="text-xl" icon="lucide:megaphone" />
				{t('clan.settings.recruitingTitle')}
			</div>
			<div className="bg-border-secondary/40 flex items-center justify-between gap-3 rounded-lg px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="text-sm font-semibold">
						{t('clan.settings.acceptRequests')}
					</span>
					<span className="text-foreground text-sm font-semibold">
						{t('clan.settings.acceptRequestsHint')}
					</span>
				</div>
				<Switch
					checked={recruiting}
					disabled={
						isPending || (!hasSavedLeaderDiscord && !recruiting)
					}
					onCheckedChange={onToggle}
				/>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<Input
					label="clan.settings.recruitmentFields.leaderDiscord"
					maxLength={100}
					onChange={(event) =>
						onFieldChange('leader_discord', event.target.value)
					}
					required
					value={form.leader_discord}
				/>
				<Input
					label="clan.settings.recruitmentFields.clanDiscord"
					maxLength={255}
					onChange={(event) =>
						onFieldChange('clan_discord', event.target.value)
					}
					value={form.clan_discord}
				/>
				<Input
					label="clan.settings.recruitmentFields.tier"
					max={3000}
					min={0}
					onChange={(event) =>
						onFieldChange('tier', Number(event.target.value))
					}
					type="number"
					value={form.tier}
				/>
				<Input
					label="clan.settings.recruitmentFields.guildsPerWeek"
					max={300000}
					min={0}
					onChange={(event) =>
						onFieldChange('guilds_per_week', event.target.value)
					}
					type="number"
					value={form.guilds_per_week}
				/>
			</div>

			<div className="bg-border-secondary/40 flex items-center justify-between gap-3 rounded-lg px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="text-sm font-semibold">
						{t('clan.settings.paidRecruitment')}
					</span>
					<span className="text-foreground text-sm font-semibold">
						{t('clan.settings.paidRecruitmentHint')}
					</span>
				</div>
				<Switch
					checked={form.paid_recruitment}
					disabled={isPending}
					onCheckedChange={(value) =>
						onFieldChange('paid_recruitment', value)
					}
				/>
			</div>

			{leaderDiscordMissing && (
				<p className="text-danger text-sm font-semibold">
					{t('clan.settings.leaderDiscordRequired')}
				</p>
			)}
			<Button
				className="gap-2 self-start"
				disabled={isPending || leaderDiscordMissing}
				onClick={onSave}
				type="button"
			>
				<Icon className="text-lg" icon="lucide:save" />
				{t('clan.settings.saveRecruitment')}
			</Button>
		</div>
	)
}
