'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { getLocale } from '@/lib/getLocale'
import { useVisibleItems } from '@/lib/unoItems'
import { itemsQueries } from '@/queries/calcs/items.queries'

export function useTTKData() {
	const weaponsQuery = useSuspenseQuery(itemsQueries.get({ type: 'weapons' }))
	const ammoQuery = useSuspenseQuery(itemsQueries.get({ type: 'ammo' }))
	const platesQuery = useSuspenseQuery(itemsQueries.get({ type: 'plates' }))
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

	const visibleWeapons = useVisibleItems(weaponsQuery.data) ?? []
	const visibleArmors = useVisibleItems(armorsQuery.data) ?? []
	const visibleContainers = useVisibleItems(containersQuery.data) ?? []
	const visibleArtefacts = useVisibleItems(artefactsQuery.data) ?? []
	const visibleConsumables = useVisibleItems(consumablesQuery.data) ?? []

	return {
		weapons: visibleWeapons,
		allAmmo: ammoQuery.data,
		plates: platesQuery.data,
		armors: visibleArmors,
		containers: visibleContainers,
		artefacts: visibleArtefacts,
		consumables: visibleConsumables,
		locale: getLocale(),
		t: useTranslations(),
	}
}
