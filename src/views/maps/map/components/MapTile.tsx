'use client'

import { useMemo, useRef } from 'react'

import { MapContainer, TileLayer } from 'react-leaflet'

import L from 'leaflet'

/* eslint-disable import/order */
import ZoomControl from './ZoomControl'
import CanvasLayer from './CanvasLayer'
import SetImageBounds from './SetImageBounds'
import ServerMarkers from './ServerMarkers'
import { useMarkersFile } from '@/hooks/useMarkersFile'
import { serverMarkersToGeoJSON } from './serverToGeoJSON'
import Sidebar from '@/components/ui/sideBar/SideBar'
/* eslint-enable import/order */

import 'leaflet-draw/dist/leaflet.draw.css'
import '@/shared/styles/map.css'

import type { MarkerClusterFull } from '@/types/map.type'

type TileMapProps = {
	url: string
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
	markersUrl?: string
}

export default function MapTile({
	url,
	imageWidth,
	imageHeight,
	fullMaxLevel,
	markersUrl,
}: TileMapProps) {
	const {
		markersFile,
		visibleClusterIds,
		visibleGroupKeys,
		toggleCluster,
		toggleGroup,
		showAll,
		hideAll,
	} = useMarkersFile(markersUrl)

	const featureGroupRef = useRef<L.FeatureGroup | null>(null)

	const handleExport = () => {
		const serverGeo = serverMarkersToGeoJSON(
			markersFile,
			imageWidth,
			imageHeight
		)

		let drawnGeo: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: [],
		}

		try {
			if (featureGroupRef.current) {
				drawnGeo =
					featureGroupRef.current.toGeoJSON() as GeoJSON.FeatureCollection
			}
		} catch (err) {
			console.warn('failed to get drawn GeoJSON', err)
		}

		const combined: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				...(drawnGeo.features ?? []),
				...(serverGeo.features ?? []),
			],
		}

		const blob = new Blob([JSON.stringify(combined, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'markers.geojson'
		a.click()
		URL.revokeObjectURL(url)
	}

	const clusterList = useMemo(
		() => markersFile?.markers_clusters ?? [],
		[markersFile]
	)

	return (
		<div
			style={{
				width: '100%',
				height: '100vh',
				position: 'relative',
				paddingTop: '104px',
				zIndex: 0,
			}}
		>
			<Sidebar
				clusterList={clusterList as MarkerClusterFull[]}
				hideAll={hideAll}
				onExport={handleExport}
				showAll={showAll}
				toggleCluster={toggleCluster}
				toggleGroup={toggleGroup}
				visibleClusterIds={visibleClusterIds}
				visibleGroupKeys={visibleGroupKeys}
			/>

			<MapContainer
				center={[0, 0]}
				crs={L.CRS.Simple}
				maxZoom={fullMaxLevel}
				minZoom={4}
				style={{ width: '100%', height: '100%' }}
				zoom={10}
				zoomControl={false}
			>
				<ZoomControl />

				<TileLayer
					maxNativeZoom={fullMaxLevel}
					noWrap
					tileSize={256}
					url={url}
				/>

				<SetImageBounds
					fullMaxLevel={fullMaxLevel}
					imageHeight={imageHeight}
					imageWidth={imageWidth}
				/>

				<CanvasLayer
					draw={(ctx) => {
						ctx.imageSmoothingEnabled = false
					}}
				/>

				<ServerMarkers
					fullMaxLevel={fullMaxLevel}
					imageHeight={imageHeight}
					imageWidth={imageWidth}
					markersFile={markersFile}
					visibleClusterIds={visibleClusterIds}
					visibleGroupKeys={visibleGroupKeys}
				/>
			</MapContainer>
		</div>
	)
}
