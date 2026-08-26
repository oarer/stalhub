'use client'

import L from 'leaflet'
import { useTranslations } from 'next-intl'
import { useMemo, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import Sidebar from '@/components/ui/sideBar/SideBar'
import SidebarActions from '@/components/ui/sideBar/SidebarActions'
import SidebarHeader from '@/components/ui/sideBar/SidebarHeader'
import ClusterItem from '@/components/ui/sideBar/СlusterItem'
import { useMarkersFile } from '@/hooks/useMarkersFile'
import CalibrationTool from './CalibrationTool'
import CanvasLayer from './CanvasLayer'
import MarkerEditor from './MarkerEditor'
import ServerMarkers from './ServerMarkers'
import SetImageBounds from './SetImageBounds'
import { serverMarkersToGeoJSON } from './serverToGeoJSON'
import ZoomControl from './ZoomControl'

import 'leaflet-draw/dist/leaflet.draw.css'
import '@/shared/styles/map.css'

import type { MarkerClusterFull } from '@/types/map.type'

type TileMapProps = {
	url: string
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
	markersUrl?: string
	mapName: string
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
		setMarkersFile,
	} = useMarkersFile(markersUrl)

	const t = useTranslations()
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
		const blobUrl = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = blobUrl
		a.download = 'markers.geojson'
		a.click()
		URL.revokeObjectURL(blobUrl)
	}

	const clusterList = useMemo(
		() => markersFile?.markers_clusters ?? [],
		[markersFile]
	)

	const hasClusters = clusterList && clusterList.length > 0

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
			<Sidebar className="max-w-lg" id="map-editor-sidebar">
				<SidebarHeader
					hasClusters={hasClusters}
					hideAll={hideAll}
					showAll={showAll}
				/>

				{hasClusters ? (
					<div className="flex flex-col gap-3">
						{(clusterList as MarkerClusterFull[]).map((cluster) => (
							<ClusterItem
								cluster={cluster}
								isVisible={visibleClusterIds.has(cluster.id)}
								key={cluster.id}
								toggleCluster={toggleCluster}
								toggleGroup={toggleGroup}
								visibleGroupKeys={visibleGroupKeys}
							/>
						))}
					</div>
				) : (
					<div className="flex items-center gap-2 py-4 text-sm">
						{t('map.noMarkers')}
					</div>
				)}

				<SidebarActions onExport={handleExport} />
			</Sidebar>

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
					padding={0.1}
					viscosity={0.8}
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

				<CalibrationTool
					fullMaxLevel={fullMaxLevel}
					imageHeight={imageHeight}
					imageWidth={imageWidth}
					markersFile={markersFile}
				/>

				<MarkerEditor
					fullMaxLevel={fullMaxLevel}
					markersFile={markersFile}
					setMarkersFile={setMarkersFile}
				/>
			</MapContainer>
		</div>
	)
}
