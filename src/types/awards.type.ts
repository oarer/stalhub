import type { Locale } from '@/types/item.type'

export type LocalizedText = Partial<Record<Locale, string>>

export type AwardCategoryKind = 'nominees' | 'updates' | 'clan' | 'player'

export type AwardCampaignStatus = 'draft' | 'voting' | 'ended' | 'published'

export type AwardVoteBlockReason =
	| null
	| 'not_authenticated'
	| 'not_exbo'
	| 'not_voting'
	| 'ended'

export interface AwardSocialLink {
	label: string
	url: string
}

export interface AwardNominee {
	id: string
	name: string
	avatar_url?: string
	date?: string
	patch_url?: string
	clan_id?: string
	clan_name?: string
	clan_tag?: string
	clan_member_count?: number
	clan_faction?: string | null
	social_links?: AwardSocialLink[]
	description?: string
	votes_count?: number
	place?: number
	player_uuid?: string | null
	player_region?: string | null
	player_alliance?: string | null
}

export interface AwardPlayerTop {
	id: string
	name: string
	avatar_url?: string | null
	player_uuid?: string | null
	region?: string | null
	alliance?: string | null
}

export interface AwardCategory {
	id: string
	slug: string
	title: string
	description?: string
	kind: AwardCategoryKind
	image_url?: string | null
	nominees: AwardNominee[]
	my_vote_nominee_id: string | null
	top?: AwardPlayerTop[]
}

export interface AwardCampaign {
	year: number
	title: string
	status: AwardCampaignStatus
	ends_at: string | null
	server_time: string
	can_vote: boolean
	vote_block_reason: AwardVoteBlockReason
	categories: AwardCategory[]
}

export interface AwardResultsNominee {
	id: string
	name: string
	avatar_url?: string
	date?: string
	patch_url?: string
	clan_id?: string
	clan_name?: string
	clan_tag?: string
	clan_member_count?: number
	clan_faction?: string | null
	social_links?: AwardSocialLink[]
	description?: string
	votes_count: number
	place: number | null
	player_uuid?: string | null
	player_region?: string | null
	player_alliance?: string | null
}

export interface AwardResultsCategory {
	id: string
	slug: string
	title: string
	description?: string
	kind: AwardCategoryKind
	image_url?: string | null
	winner_ids: string[]
	top?: AwardPlayerTop[] | null
	nominees: AwardResultsNominee[]
}

export interface AwardResults {
	year: number
	title: string
	published_at: string | null
	categories: AwardResultsCategory[]
}

export interface ClanCandidate {
	id: string
	name: string
	tag: string
	faction?: string | null
	member_count?: number | null
}

export interface CastVoteInput {
	category_id: string
	nominee_id: string
}

export interface CastPlayerVoteInput {
	category_id: string
	player_name: string
}

export interface AwardPlayerCandidate {
	name: string
	alliance: string | null
	region: string
	nominee_id: string | null
}

export interface AwardPlayerSearchResponse {
	category_id: string
	campaign_id: string
	items: AwardPlayerCandidate[]
}

export interface NominateClanInput {
	category_id: string
	clan_name: string
}

export interface NominateClanResponse {
	id: string
	category_id: string
	clan_id?: string
	clan_name?: string
	clan_tag?: string
	nominated_by: number
	created_at: string
}

export type AwardErrorCode =
	| 'already_voted'
	| 'not_exbo'
	| 'clan_ambiguous'
	| 'clan_not_found'
	| 'player_not_found'
	| 'invalid_query'
	| 'invalid_player_name'
	| 'verification_unavailable'
	| 'too_many_requests'
	| 'category_cap_exceeded'

export interface AwardErrorPayload {
	code: AwardErrorCode
	message?: string
	candidates?: ClanCandidate[]
	cooldown_seconds?: number
	cap?: number
}
