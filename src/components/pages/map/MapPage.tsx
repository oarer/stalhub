'use client'

import dynamic from 'next/dynamic'

import { useMaps } from '@/hooks/useMaps'
import type { MapConfig } from '@/types/map.type'

const MapTile = dynamic(() => import('./components/MapTile'), {
    ssr: false,
    loading: () => (
        <section className="relative mx-auto mt-[104px] mb-12 flex max-w-[95rem] flex-col gap-10 px-4 pt-12 xl:mt-0 dark:text-white/70">
            <div className="mx-auto flex items-center gap-4 xl:px-0 xl:pt-[170px] xl:pb-[60px]">
                <p className="text-2xl font-semibold">Загрузка карты</p>
            </div>
        </section>
    ),
})

export default function MapPage({ mapName }: { mapName: string }) {
    const { maps } = useMaps()

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
