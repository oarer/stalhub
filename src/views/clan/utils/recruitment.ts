import type { RecruitmentSettings } from '@/types/clan/clan.type'

export interface RecruitmentFormState {
	leader_discord: string
	clan_discord: string
	paid_recruitment: boolean
	tier: number
	guilds_per_week: string
}

export function toRecruitmentPayload(
	form: RecruitmentFormState
): RecruitmentSettings {
	const leaderDiscord = form.leader_discord.trim()
	if (!leaderDiscord) throw new Error('leader_discord_required')
	if (!Number.isInteger(form.tier) || form.tier < 1 || form.tier > 4)
		throw new Error('tier_invalid')
	const guildsPerWeek =
		form.guilds_per_week === '' ? null : Number(form.guilds_per_week)
	if (
		guildsPerWeek !== null &&
		(!Number.isInteger(guildsPerWeek) || guildsPerWeek < 0 || guildsPerWeek > 999)
	)
		throw new Error('guilds_per_week_invalid')

	return {
		leader_discord: leaderDiscord,
		clan_discord: form.clan_discord.trim() || null,
		paid_recruitment: form.paid_recruitment,
		tier: form.tier,
		guilds_per_week: guildsPerWeek,
	}
}
