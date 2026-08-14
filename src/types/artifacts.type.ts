export type ArtPriceQuery = {
	itemId: string
	qlt: number
	ptn: number
}

export type ArtPriceResult = ArtPriceQuery & {
	price: number | null
	source: 'market' | 'estimate' | null
	count: number
}

export type ArtPricesResponse = {
	updatedAt: string | null
	region: string
	prices: ArtPriceResult[]
}
