'use client'

import { useTranslation } from 'react-i18next'

import dynamic from 'next/dynamic'

import { useMaps } from '@/hooks/useMaps'
import type { MapConfig } from '@/types/map.type'

// ! TODO SUSPENSE QUERIES

function Loading() {
	const { t } = useTranslation()
	return (
		<section className="relative mx-auto mt-26 mb-12 flex max-w-380 flex-col gap-10 px-4 pt-12 xl:mt-0 dark:text-white/70">
			<div className="mx-auto flex items-center gap-4 xl:px-0 xl:pt-42.5 xl:pb-15">
				<p className="text-2xl font-semibold">{t('map.loading')}</p>
			</div>
		</section>
	)
}

const MapTile = dynamic(() => import('./components/MapTile'), {
	ssr: false,
	loading: () => <Loading />,
})

export default function MapView({ mapName }: { mapName: string }) {
	const { maps } = useMaps()
	const { t } = useTranslation()

	const mapConfig = maps.find((m: MapConfig) => m.name === mapName)

	if (!mapConfig) return <p>{t('map.notFound', { mapName })}</p>

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
