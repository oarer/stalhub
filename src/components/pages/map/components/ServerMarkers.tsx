'use client'

import { type JSX } from 'react'

import { Marker, Popup, useMap } from 'react-leaflet'

import L from 'leaflet'

import type { MarkersFile } from '@/types/map.type'

type Props = {
    markersFile: MarkersFile | null
    visibleClusterIds: Set<number>
    visibleGroupKeys: Set<string>
    lang: 'ru' | 'en'
    imageWidth: number
    imageHeight: number
    fullMaxLevel: number
}

export default function ServerMarkers({
    markersFile,
    visibleClusterIds,
    visibleGroupKeys,
    lang,
    imageWidth,
    imageHeight,
    fullMaxLevel,
}: Props) {
    const map = useMap()
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

                let pos: L.LatLng

                if (isPixelCoord) {
                    pos = map.unproject([coords.lng, coords.lat], fullMaxLevel)
                } else {
                    pos = L.latLng(coords.lat, coords.lng)
                }

                const icon = L.icon({
                    iconUrl: group.settings?.image ?? '/default-icon.png',
                    iconSize: [
                        group.settings?.iconWidth ?? 22,
                        group.settings?.iconHeight ?? 22,
                    ],
                    className: 'custom-marker',
                })

                const title =
                    (group.name && group.name[lang]) || group.slug || 'marker'
                const desc =
                    (p.description &&
                        (p.description[lang] ||
                            p.description.ru ||
                            p.description.en)) ||
                    p.popup ||
                    ''

                out.push(
                    <Marker
                        icon={icon}
                        key={`${cluster.id}-${group.id}-${p.id ?? `${pos.lat}-${pos.lng}`}`}
                        position={pos}
                    >
                        <Popup>
                            <b>{title}</b>
                            <br />
                            {desc}
                            <hr />
                            <small>
                                Категория: {cluster.name?.[lang] ?? cluster.id}{' '}
                                → {group.name?.[lang] ?? group.slug}
                            </small>
                        </Popup>
                    </Marker>
                )
            }
        }
    }

    return <>{out}</>
}
