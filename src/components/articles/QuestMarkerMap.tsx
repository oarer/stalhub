'use client'

import L from 'leaflet'
import { useEffect } from 'react'
import { CircleMarker, Popup, useMap } from 'react-leaflet'
import type { MapConfig } from '@/types/map.type'
import BaseMapContainer from '@/views/maps/map/components/BaseMapContainer'
import SetImageBounds from '@/views/maps/map/components/SetImageBounds'
import '@/shared/styles/map.css'

function Fit({ markers }: { markers: Array<{ x: number; y: number }> }) {
	const map = useMap()
	useEffect(() => {
		if (markers.length)
			map.fitBounds(L.latLngBounds(markers.map((m) => [m.y, m.x])), {
				padding: [32, 32],
				maxZoom: 11,
			})
	}, [map, markers])
	return null
}

export default function QuestMarkerMap({
	config,
	markers,
}: {
	config: MapConfig
	markers: Array<{ x: number; y: number; label?: string }>
}) {
	return (
		<BaseMapContainer
			fullMaxLevel={config.image.maxZoom}
			imageHeight={config.image.height}
			imageWidth={config.image.width}
			minZoom={4}
			tileUrl={config.url}
			zoom={7}
		>
			<SetImageBounds
				fullMaxLevel={config.image.maxZoom}
				imageHeight={config.image.height}
				imageWidth={config.image.width}
			/>
			<Fit markers={markers} />
			{markers.map((marker, index) => (
				<CircleMarker
					center={[marker.y, marker.x]}
					key={`${marker.x}-${marker.y}-${index}`}
					pathOptions={{ color: '#f59e0b', fillOpacity: 0.9 }}
					radius={8}
				>
					{marker.label && <Popup>{marker.label}</Popup>}
				</CircleMarker>
			))}
		</BaseMapContainer>
	)
}
