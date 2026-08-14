'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { itemsQueries } from '@/queries/calcs/items.queries'

export function useItemsData() {
	const { data: artifacts } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armorItems } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)

	return {
		artifacts: artifacts ?? [],
		armorItems: armorItems ?? [],
		containers: containers ?? [],
	}
}
