import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { artifactsPricesQueries } from '@/queries/calcs/artifacts-prices.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import { Regions } from '@/types/api.type'
import type { ArtPriceResult } from '@/types/artifacts.type'
import { artQualityToQualityIndex } from '@/utils/artUtils'

export const artPriceKey = (itemId: string, qlt: number, ptn: number): string =>
	`${itemId}:${qlt}:${ptn}`

export const useBuildPrices = (
	region: string = Regions.RU
): {
	isLoading: boolean
	isError: boolean
	updatedAt: string | null
	priceMap: Record<string, ArtPriceResult>
} => {
	const arts = useBuildStore((s) => s.build.arts)

	const queries = useMemo(() => {
		return arts.map((art) => ({
			item_id: art.itemId,
			qlt: artQualityToQualityIndex[art.qualityClass] ?? 0,
			ptn: art.potential ?? 0,
		}))
	}, [arts])

	const { data, isLoading, isError } = useQuery(
		artifactsPricesQueries.prices(queries, region)
	)

	const priceMap = useMemo(() => {
		const map: Record<string, ArtPriceResult> = {}
		for (const price of data?.prices ?? []) {
			map[artPriceKey(price.item_id, price.qlt, price.ptn)] = price
		}
		return map
	}, [data])

	return {
		isLoading,
		isError,
		updatedAt: data?.updatedAt ?? null,
		priceMap,
	}
}

export const formatArtPrice = (price: number | null): string | null => {
	if (price == null) return null
	return new Intl.NumberFormat('ru-RU').format(price)
}

