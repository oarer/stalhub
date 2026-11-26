import type {
	AdminAwardCampaign,
	AdminAwardCategory,
	AdminAwardResults,
} from '@/types/admin.type'
import type {
	AwardResults,
	AwardResultsCategory,
	LocalizedText,
} from '@/types/awards.type'

export function localizedText(
	value: LocalizedText | null | undefined,
	locale?: string
) {
	if (!value) return undefined
	if (locale) {
		const localized = value[locale as keyof LocalizedText]
		if (localized) return localized
	}
	return value.ru ?? value.en ?? Object.values(value).find(Boolean)
}

export function toAwardResults(
	campaign: AdminAwardCampaign,
	results: AdminAwardResults,
	categories: AdminAwardCategory[] = [],
	locale?: string
): AwardResults {
	const images = new Map<string, string | undefined>()
	const positions = new Map<string, number>()
	for (const category of categories) {
		images.set(category.id, category.image_url || undefined)
		images.set(category.slug, category.image_url || undefined)
		positions.set(category.id, category.position)
		positions.set(category.slug, category.position)
	}

	const mapped: AwardResultsCategory[] = results.categories.map(
		(category) => ({
			description: localizedText(category.description_i18n, locale),
			id: category.id,
			image_url:
				category.image_url ||
				images.get(category.id) ||
				images.get(category.slug) ||
				undefined,
			kind: category.kind,
			nominees: category.nominees.map((nominee) => ({
				avatar_url: nominee.avatar_url ?? undefined,
				clan_faction: nominee.clan_faction ?? undefined,
				clan_id: nominee.clan_id ?? undefined,
				clan_member_count: nominee.clan_member_count ?? undefined,
				clan_name: nominee.clan_name ?? undefined,
				clan_tag: nominee.clan_tag ?? undefined,
				date: nominee.date ?? undefined,
				description: localizedText(nominee.description_i18n, locale),
				id: nominee.id,
				name: nominee.name,
				patch_url: nominee.patch_url ?? undefined,
				place: nominee.place,
				player_alliance: nominee.player_alliance ?? undefined,
				player_region: nominee.player_region ?? undefined,
				player_uuid: nominee.player_uuid ?? undefined,
				social_links: nominee.social_links,
				votes_count: nominee.votes_count,
			})),
			slug: category.slug,
			title: localizedText(category.title_i18n, locale) ?? category.slug,
			winner_ids: category.winner_ids,
		})
	)

	const known = new Set(
		mapped.flatMap((category) => [category.id, category.slug])
	)
	for (const category of categories) {
		if (known.has(category.id) || known.has(category.slug)) continue
		mapped.push({
			description: localizedText(category.description_i18n, locale),
			id: category.id,
			image_url: category.image_url || undefined,
			kind: category.kind,
			nominees: [],
			slug: category.slug,
			title: localizedText(category.title_i18n, locale) ?? category.slug,
			winner_ids: [],
		})
	}

	const positionOf = (category: AwardResultsCategory) =>
		positions.get(category.id) ??
		positions.get(category.slug) ??
		Number.MAX_SAFE_INTEGER

	mapped.sort((a, b) => positionOf(a) - positionOf(b))

	return {
		categories: mapped,
		published_at: results.published_at,
		title: campaign.title,
		year: campaign.year,
	}
}
