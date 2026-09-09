export type UpgradeItemKey =
	| 'catalyst'
	| 'quantum_battery'
	| 'advanced_tools'
	| 'cheap_tools'
	| 'standard_tools'
	| 'advanced_parts'
	| 'standard_parts'
	| 'cheap_parts'

export type UpgradePriceEntry = {
	item_id: string
	key: UpgradeItemKey
	min_price: number | null
	count: number
	energy_price: number | null
}

export type UpgradePricesResponse = {
	region: string
	updated_at: string | null
	prices: UpgradePriceEntry[]
}
