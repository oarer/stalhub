'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { WORLD_MAP } from '@/constants/map.const'

function Loading() {
	const t = useTranslations()
	return (
		<section className="relative mx-auto mt-26 mb-12 flex max-w-380 flex-col gap-10 px-4 pt-12 xl:mt-0 dark:text-white/70">
			<div className="mx-auto flex items-center gap-4 xl:px-0 xl:pt-42.5 xl:pb-15">
				<p className="font-semibold text-2xl">{t('map.loading')}</p>
			</div>
		</section>
	)
}

const MapTile = dynamic(() => import('./components/MapTile'), {
	ssr: false,
	loading: () => <Loading />,
})

export default function MapView() {
	return (
		<MapTile
			atlasMarkers={WORLD_MAP.atlasMarkers === true}
			fullMaxLevel={WORLD_MAP.image.maxZoom}
			imageHeight={WORLD_MAP.image.height}
			imageWidth={WORLD_MAP.image.width}
			mapName={WORLD_MAP.name}
			markersUrl={WORLD_MAP.markers}
			url={WORLD_MAP.url}
		/>
	)
}
