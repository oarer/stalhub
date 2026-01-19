'use client'

import { type JSX } from 'react'

import { Marker, Popup, useMap } from 'react-leaflet'

import L from 'leaflet'

import type { MarkersFile } from '@/types/map.type'
import { type Locale } from '@/types/item.type'
import { getLocale } from '@/lib/getLocale'

type Props = {
	markersFile: MarkersFile | null
	visibleClusterIds: Set<number>
	visibleGroupKeys: Set<string>
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
}

function getLocalized(
	maybeLocalized: Record<string, string> | undefined,
	lang: Locale
): string | undefined {
	if (!maybeLocalized) return undefined
	return maybeLocalized[lang] ?? maybeLocalized.ru ?? maybeLocalized.en
}

export default function ServerMarkers({
	markersFile,
	visibleClusterIds,
	visibleGroupKeys,
	imageWidth,
	imageHeight,
	fullMaxLevel,
}: Props) {
	const map = useMap()
	const lang = getLocale()

	if (!markersFile?.markers_clusters) return null

	const out: JSX.Element[] = []

	for (const cluster of markersFile.markers_clusters) {
		if (!visibleClusterIds.has(cluster.id)) continue

		for (const group of cluster.markers) {
			const groupKey = `${cluster.id}_${group.id}`
			if (!visibleGroupKeys.has(groupKey)) continue

			for (const p of group.markers) {
				const coords = p.coordinates
				const isPixelCoord =
					typeof imageWidth === 'number' &&
					typeof imageHeight === 'number' &&
					coords.lat >= 0 &&
					coords.lng >= 0 &&
					coords.lat <= imageHeight &&
					coords.lng <= imageWidth

				const pos: L.LatLngExpression = isPixelCoord
					? map.unproject([coords.lng, coords.lat], fullMaxLevel)
					: L.latLng(coords.lat, coords.lng)

				const icon = L.icon({
					iconUrl: group.settings?.image ?? '/default-icon.png',
					iconSize: [
						group.settings?.iconWidth ?? 22,
						group.settings?.iconHeight ?? 22,
					],
					className: 'custom-marker',
				})

				const title =
					getLocalized(group.name, lang) || group.slug || 'marker'
				const desc = getLocalized(p.description, lang) || p.popup || ''

				out.push(
					<Marker
						icon={icon}
						key={`${cluster.id}-${group.id}-${p.id ?? `${(pos as L.LatLng).lat}-${(pos as L.LatLng).lng}`}`}
						position={pos}
					>
						<Popup>
							<b>{title}</b>
							<br />
							{desc}
							<hr />
							<small>
								Категория:{' '}
								{getLocalized(cluster.name, lang) ?? cluster.id}{' '}
								→ {getLocalized(group.name, lang) ?? group.slug}
							</small>
						</Popup>
					</Marker>
				)
			}
		}
	}

	return <>{out}</>
}
