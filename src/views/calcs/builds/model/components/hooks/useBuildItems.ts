'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useVisibleItems } from '@/lib/unoItems'
import { itemsQueries } from '@/queries/calcs/items.queries'

export function useBuildItems() {
	const armorsQuery = useSuspenseQuery(itemsQueries.get({ type: 'armor' }))
	const containersQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)
	const artefactsQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const consumablesQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'consumables' })
	)

	const armors = useVisibleItems(armorsQuery.data) ?? []
	const containers = useVisibleItems(containersQuery.data) ?? []
	const artefacts = useVisibleItems(artefactsQuery.data) ?? []
	const consumables = useVisibleItems(consumablesQuery.data) ?? []

	const allItems = useMemo(
		() => [...armors, ...containers, ...artefacts, ...consumables],
		[armors, containers, artefacts, consumables]
	)

	return { armors, containers, artefacts, consumables, allItems }
}
