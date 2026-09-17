'use client'

import L from 'leaflet'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import Sidebar from '@/components/ui/sideBar/SideBar'

import SidebarActions from '@/components/ui/sideBar/SidebarActions'
import SidebarHeader from '@/components/ui/sideBar/SidebarHeader'
import ClusterItem from '@/components/ui/sideBar/СlusterItem'
import { useAtlasMarkers } from '@/hooks/useAtlasMarkers'
import { useMarkersFile } from '@/hooks/useMarkersFile'
import { filteredNameKey, filteredTypeKey } from '../lib/filteredMarkers'
import CalibrationTool from './CalibrationTool'
import CanvasLayer from './CanvasLayer'
import ConvertOverlay from './ConvertOverlay'
import FilteredWorldMarkers, { type SourceMarker } from './FilteredWorldMarkers'
import type { MapMode } from './MapModeTabs'
import MapModeTabs from './MapModeTabs'
import MarkerEditor from './MarkerEditor'
import ServerMarkers from './ServerMarkers'
import SetImageBounds from './SetImageBounds'
import { serverMarkersToGeoJSON } from './serverToGeoJSON'
import WorldMarkerEditor from './WorldMarkerEditor'
import WorldMarkerFilter from './WorldMarkerFilter'
import WorldMarkers from './WorldMarkers'
import ZoomControl from './ZoomControl'

import 'leaflet-draw/dist/leaflet.draw.css'
import '@/shared/styles/map.css'

import type { AtlasWaypoint, MarkerClusterFull } from '@/types/map.type'

type TileMapProps = {
	url: string
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
	markersUrl?: string
	mapName: string
	/** New-format world markers (atlas keys) instead of markers_clusters. */
	atlasMarkers?: boolean
}

export default function MapTile({
	url,
	imageWidth,
	imageHeight,
	fullMaxLevel,
	markersUrl,
	atlasMarkers,
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
	} = useMarkersFile(atlasMarkers ? undefined : markersUrl)

	const { markers: atlasMarkersFile } = useAtlasMarkers(
		atlasMarkers && markersUrl ? markersUrl : ''
	)

	const t = useTranslations()
	const featureGroupRef = useRef<L.FeatureGroup | null>(null)

	const [mode, setMode] = useState<MapMode>('view')
	const [sidebarOpen, setSidebarOpen] = useState(true)

	useEffect(() => {
		if (mode === 'convert') setSidebarOpen(true)
	}, [mode])

	const [worldSpots, setWorldSpots] = useState<AtlasWaypoint[] | null>(null)
	useEffect(() => {
		if (atlasMarkersFile) setWorldSpots(atlasMarkersFile.spots)
	}, [atlasMarkersFile])

	const [hiddenIcons, setHiddenIcons] = useState<Set<string>>(new Set())
	const [markerSearch, setMarkerSearch] = useState('')
	const [selectedUuid, setSelectedUuid] = useState<string | null>(null)
	const [filteredMarkers, setFilteredMarkers] = useState<SourceMarker[]>([])
	const [hiddenFilteredTypes, setHiddenFilteredTypes] = useState<Set<string>>(
		new Set()
	)
	const [hiddenFilteredNames, setHiddenFilteredNames] = useState<Set<string>>(
		new Set()
	)

	useEffect(() => {
		void fetch('/markers/filtered.json')
			.then((response) => response.json())
			.then((data: unknown) => {
				if (Array.isArray(data)) {
					setFilteredMarkers(data)
					setHiddenFilteredTypes(
						new Set(
							data.map((item) =>
								filteredTypeKey(item as SourceMarker)
							)
						)
					)
				}
			})
			.catch((error) => console.error('Filtered map markers:', error))
	}, [])

	const filteredTypeGroups = useMemo(() => {
		const groups = new Map<string, Map<string, number>>()
		for (const marker of filteredMarkers) {
			const group = marker.g ?? 'unknown'
			const type = filteredTypeKey(marker)
			let types = groups.get(group)
			if (!types) {
				types = new Map()
				groups.set(group, types)
			}
			types.set(type, (types.get(type) ?? 0) + 1)
		}
		return [...groups.entries()]
			.map(([group, types]) => ({
				group,
				types: [...types.entries()].sort((a, b) => b[1] - a[1]),
				count: [...types.values()].reduce(
					(sum, value) => sum + value,
					0
				),
			}))
			.sort((a, b) => b.count - a.count)
	}, [filteredMarkers])

	const allowedModes: MapMode[] = ['view', 'convert', 'edit']

	const canEdit = mode === 'edit' && !atlasMarkers
	const canEditWorld = mode === 'edit' && atlasMarkers

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
			<Sidebar
				className="max-w-lg"
				id="map-editor-sidebar"
				onOpenChange={setSidebarOpen}
				open={sidebarOpen}
			>
				<MapModeTabs
					mode={mode}
					modes={allowedModes}
					onModeChange={setMode}
				/>

				{canEdit && (
					<>
						<SidebarHeader
							hasClusters={hasClusters}
							hideAll={hideAll}
							showAll={showAll}
						/>

						{hasClusters ? (
							<div className="flex flex-col gap-3">
								{(clusterList as MarkerClusterFull[]).map(
									(cluster) => (
										<ClusterItem
											cluster={cluster}
											isVisible={visibleClusterIds.has(
												cluster.id
											)}
											key={cluster.id}
											toggleCluster={toggleCluster}
											toggleGroup={toggleGroup}
											visibleGroupKeys={visibleGroupKeys}
										/>
									)
								)}
							</div>
						) : (
							<div className="flex items-center gap-2 py-4 text-sm">
								{t('map.noMarkers')}
							</div>
						)}

						<SidebarActions onExport={handleExport} />
					</>
				)}

				{atlasMarkers && worldSpots && mode !== 'convert' && (
					<WorldMarkerFilter
						filteredMarkers={filteredMarkers}
						filteredTypeGroups={filteredTypeGroups}
						hiddenFilteredNames={hiddenFilteredNames}
						hiddenFilteredTypes={hiddenFilteredTypes}
						hiddenIcons={hiddenIcons}
						onHiddenFilteredNamesChange={setHiddenFilteredNames}
						onHiddenFilteredTypesChange={setHiddenFilteredTypes}
						onHiddenIconsChange={setHiddenIcons}
						onSearchChange={setMarkerSearch}
						search={markerSearch}
						spots={worldSpots}
					/>
				)}
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

				{mode !== 'convert' && (
					<FilteredWorldMarkers
						markers={filteredMarkers.filter(
							(marker) =>
								!hiddenFilteredTypes.has(
									filteredTypeKey(marker)
								) &&
								!hiddenFilteredNames.has(
									filteredNameKey(marker)
								) &&
								`${marker.g ?? ''} ${marker.b ?? ''} ${marker.n ?? ''}`
									.toLowerCase()
									.includes(markerSearch.trim().toLowerCase())
						)}
					/>
				)}

				{mode !== 'convert' &&
					(atlasMarkers && markersUrl && worldSpots ? (
						<>
							<WorldMarkers
								editing={canEditWorld}
								fullMaxLevel={fullMaxLevel}
								hiddenIcons={hiddenIcons}
								search={markerSearch}
								selectedUuid={selectedUuid}
								spots={worldSpots}
							/>
							{canEditWorld && (
								<WorldMarkerEditor
									fullMaxLevel={fullMaxLevel}
									onSelect={setSelectedUuid}
									selectedUuid={selectedUuid}
									setSpots={(update) =>
										setWorldSpots((current) =>
											current ? update(current) : current
										)
									}
									spots={worldSpots}
								/>
							)}
						</>
					) : (
						<>
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

							{canEdit && (
								<MarkerEditor
									fullMaxLevel={fullMaxLevel}
									markersFile={markersFile}
									setMarkersFile={setMarkersFile}
								/>
							)}
						</>
					))}

				{mode === 'convert' && (
					<ConvertOverlay fullMaxLevel={fullMaxLevel} />
				)}
			</MapContainer>
		</div>
	)
}
