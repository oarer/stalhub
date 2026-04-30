'use client'

import L from 'leaflet'
import type { ComponentProps, ReactNode } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'

type BaseMapContainerProps = {
	children: ReactNode
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
	tileUrl: string
	minZoom?: number
	zoom?: number
	extraTileProps?: Partial<ComponentProps<typeof TileLayer>>
}

export default function BaseMapContainer({
	children,
	imageWidth,
	imageHeight,
	fullMaxLevel,
	tileUrl,
	minZoom = 4,
	zoom = 10,
	extraTileProps,
}: BaseMapContainerProps) {
	return (
		<MapContainer
			center={[0, 0]}
			crs={L.CRS.Simple}
			maxZoom={fullMaxLevel}
			minZoom={minZoom}
			style={{ width: '100%', height: '100%' }}
			zoom={zoom}
			zoomControl={false}
		>
			<TileLayer
				maxNativeZoom={fullMaxLevel}
				noWrap
				tileSize={256}
				url={tileUrl}
				{...extraTileProps}
			/>
			{children}
		</MapContainer>
	)
}
