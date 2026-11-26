import type { AwardCampaignStatus } from '@/types/awards.type'

export function effectiveAwardStatus(
	status: AwardCampaignStatus,
	endsAt: string | null | undefined,
	now = Date.now()
): AwardCampaignStatus {
	if (status !== 'voting' || !endsAt) return status
	const end = Date.parse(endsAt)
	return Number.isFinite(end) && end <= now ? 'ended' : status
}
