'use client'

import dynamic from 'next/dynamic'

import { useMaps } from '@/hooks/useMaps'
import type { MapConfig } from '@/types/map.type'

const MapTile = dynamic(() => import('./components/MapTile'), {
    ssr: false,
    loading: () => <div>Загрузка карты…</div>,
})

export default function MapPage({ mapName }: { mapName: string }) {
    const { maps, loading } = useMaps()

    if (loading) return <p>Загрузка карты…</p>

    const mapConfig = maps.find((m: MapConfig) => m.name === mapName)

    if (!mapConfig) return <p>Карта {mapName} не найдена</p>

    return (
        <MapTile
            fullMaxLevel={mapConfig.image.maxZoom}
            imageHeight={mapConfig.image.height}
            imageWidth={mapConfig.image.width}
            markersUrl={mapConfig.markers}
            url={mapConfig.url}
        />
    )
}
