'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useVisibleItems } from '@/lib/unoItems'
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

	const visibleArtifacts = useVisibleItems(artifacts)
	const visibleArmorItems = useVisibleItems(armorItems)
	const visibleContainers = useVisibleItems(containers)

	return {
		artifacts: visibleArtifacts ?? [],
		armorItems: visibleArmorItems ?? [],
		containers: visibleContainers ?? [],
	}
}
