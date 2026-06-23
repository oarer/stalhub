'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { getLocale } from '@/lib/getLocale'
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

	return {
		weapons: weaponsQuery.data,
		allAmmo: ammoQuery.data,
		plates: platesQuery.data,
		armors: armorsQuery.data,
		containers: containersQuery.data,
		artefacts: artefactsQuery.data,
		consumables: consumablesQuery.data,
		locale: getLocale(),
		t: useTranslations(),
	}
}
