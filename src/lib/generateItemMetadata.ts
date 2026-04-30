import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { ItemListing } from '@/types/api.type'
import type { Locale } from '@/types/item.type'

const DESCRIPTIONS: Record<Locale, (name: string) => string> = {
	ru: (name: string) =>
		`Информация о предмете ${name}: описание, характеристики, аукцион`,
	en: (name: string) =>
		`Information about item ${name}: description, stats, auction`,
	es: (name: string) =>
		`Información sobre el objeto ${name}: descripción, características, subasta`,
	fr: (name: string) =>
		`Informations sur l'objet ${name} : description, caractéristiques, enchères`,
	ko: (name: string) => `${name} 아이템 정보: 설명, 특징, 경매`,
}

type ItemData = {
	name: string
	description: string
	icon: string
}

export async function generateItemMetadata(
	slug: string | string[],
	locale: Locale
): Promise<ItemData | null> {
	const githubUrl = Array.isArray(slug)
		? `/items/${slug.join('/')}.json`
		: `/items/${slug}.json`

	const res = await fetch(`${GITHUB_RAW_BASE}/listing.json`, {
		next: { revalidate: 60 },
	})
	const listing: ItemListing[] = await res.json()

	const item = listing.find((i) => i.data === githubUrl)
	if (!item || !item.name || !item.icon) return null

	const name = item.name[locale] || item.name.en || item.name.ru
	if (!name) return null

	const description = DESCRIPTIONS[locale]?.(name) ?? DESCRIPTIONS.ru(name)

	return { name, description, icon: item.icon }
}
