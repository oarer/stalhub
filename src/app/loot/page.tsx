import { getLootCatalogCached } from '@/services/calcs/loot.server'
import { LootView } from '@/views/calcs/loot/LootView'

export default async function LootPage() {
	const catalog = await getLootCatalogCached()
	return <LootView catalog={catalog} />
}
