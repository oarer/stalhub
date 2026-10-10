'use client'

import { useMemo } from 'react'
import type { BuildApi } from '@/types/build-api.type'
import type { Item, Locale } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import type { PublicUserBuild } from '@/types/user.type'
import { messageToString } from '@/utils/itemUtils'

export interface BuildArtifactEntry {
	name: string
	color: string
	percent: number
	potential: number
}

export function getBuildItemIconUrl(item: Item) {
	return `https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`
}

function resolveInfoColor(color: string | undefined) {
	return color
		? (infoColorMap[color as InfoColor] ?? infoColorMap[InfoColor.DEFAULT])
		: infoColorMap[InfoColor.DEFAULT]
}

export function useBuildCardItems({
	build,
	armorItems,
	containers,
	artifacts,
	locale,
}: {
	build: BuildApi | PublicUserBuild
	armorItems?: Item[]
	containers?: Item[]
	artifacts?: Item[]
	locale: Locale
}) {
	return useMemo(() => {
		const armorItem = build.data.armor
			? (armorItems?.find((item) => item.id === build.data.armor?.id) ??
				null)
			: null
		const containerItem = build.data.container
			? (containers?.find(
					(item) => item.id === build.data.container?.id
				) ?? null)
			: null

		const armorColor = resolveInfoColor(armorItem?.color)
		const containerColor = resolveInfoColor(containerItem?.color)

		const artsMap = artifacts
			? new Map(artifacts.map((i) => [i.id, i]))
			: null
		const instanceToArt = new Map(
			build.data.arts.map((a) => [a.instance_id, a])
		)

		const artifactEntries = (build.data.container?.slots ?? [])
			.filter((s): s is string => s !== null)
			.map((instanceId) => {
				const art = instanceToArt.get(instanceId)
				if (!art) return null
				const item = artsMap?.get(art.item_id)
				if (!item) return null
				return {
					name: messageToString(item.name, locale),
					color:
						art.quality_class !== undefined
							? (infoColorMap[art.quality_class] ??
								infoColorMap[InfoColor.DEFAULT])
							: infoColorMap[InfoColor.DEFAULT],
					percent: art.percent,
					potential: art.potential,
				}
			})
			.filter(
				(
					e
				): e is {
					name: string
					color: string
					percent: number
					potential: number
				} => e !== null
			)

		const hasPreview = armorItems && containers && artifacts

		return {
			armorItem,
			containerItem,
			armorColor,
			containerColor,
			artifactEntries,
			hasPreview,
		}
	}, [build, armorItems, containers, artifacts, locale])
}
