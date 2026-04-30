'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
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

	const armors = armorsQuery.data ?? []
	const containers = containersQuery.data ?? []
	const artefacts = artefactsQuery.data ?? []
	const consumables = consumablesQuery.data ?? []

	const allItems = useMemo(
		() => [...armors, ...containers, ...artefacts, ...consumables],
		[armors, containers, artefacts, consumables]
	)

	return { armors, containers, artefacts, consumables, allItems }
}
