'use client'

import L from 'leaflet'
import { useCallback, useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'

import { Accordion } from '@/components/ui/Accordion'
import Sidebar from '@/components/ui/sideBar/SideBar'

import '@/shared/styles/map.css'
import { CheckBox } from '@/components/ui/CheckBox'
import SetImageBounds from '@/views/maps/map/components/SetImageBounds'
import { DrawingOverlay, MarkerLayer } from './components'
import { useKeyboardShortcuts } from './components/hooks'
import {
	ActionButtons,
	MapSelector,
	MarkerSelector,
	StyleControls,
	ToolPalette,
} from './components/sidebar'
import {
	type DrawElement,
	type HistoryEntry,
	type LatLng,
	MAPS,
	MARKER_PRESETS,
	type MapDef,
	type MapMarker,
	type Tool,
} from './types'
import { genId } from './utils'

export default function CWMapEditor() {
	const [selectedMapKey, setSelectedMapKey] = useState(MAPS[0].key)
	const [tool, setTool] = useState<Tool>('pen')
	const [color, setColor] = useState('#ef4444')
	const [lineWidth, setLineWidth] = useState(3)
	const [elements, setElements] = useState<DrawElement[]>([])
	const [currentElement, setCurrentElement] = useState<DrawElement | null>(
		null
	)
	const [markers, setMarkers] = useState<MapMarker[]>([])
	const [selectedMarkerPreset, setSelectedMarkerPreset] = useState(
		MARKER_PRESETS[0].key
	)
	const [mapKey, setMapKey] = useState(0)
	const [showLetterMarkers, setShowLetterMarkers] = useState(true)
	const [, setHistory] = useState<HistoryEntry[]>([])

	const selectedMap: MapDef =
		MAPS.find((m) => m.key === selectedMapKey) ?? MAPS[0]
	const tileUrl = `http://localhost:3000/maps/cw/${selectedMap.key}/tiles/{z}/{x}/{y}.png`

	useEffect(() => {
		if (showLetterMarkers && selectedMap.letterMarkers) {
			const letterMarkers: MapMarker[] = selectedMap.letterMarkers.map(
				(letter) => ({
					id: `letter-${letter.letter}`,
					position: { lat: letter.lat, lng: letter.lng },
					preset: `point_${letter.letter.toLowerCase()}`,
				})
			)
			setMarkers((prev) => {
				const filtered = prev.filter((m) => !m.id.startsWith('letter-'))
				return [...filtered, ...letterMarkers]
			})
		} else {
			setMarkers((prev) =>
				prev.filter((m) => !m.id.startsWith('letter-'))
			)
		}
	}, [showLetterMarkers, selectedMap])

	const switchMap = (key: string) => {
		setSelectedMapKey(key)
		setElements([])
		setCurrentElement(null)
		setMarkers([])
		setHistory([])
		setMapKey((k) => k + 1)
		if (showLetterMarkers) {
			const newMap = MAPS.find((m) => m.key === key)
			if (newMap?.letterMarkers) {
				const letterMarkers: MapMarker[] = newMap.letterMarkers.map(
					(letter, i) => ({
						id: `letter-${letter.letter}-${i}`,
						position: letter,
						preset: `point_${letter.letter.toLowerCase()}`,
					})
				)
				setMarkers(letterMarkers)
			}
		}
	}

	const placeMarker = useCallback(
		(latlng: LatLng) => {
			const newMarker: MapMarker = {
				id: genId(),
				position: latlng,
				preset: selectedMarkerPreset,
			}
			setMarkers((prev) => [...prev, newMarker])
			setHistory((prev) => [
				...prev,
				{ type: 'add_marker', marker: newMarker },
			])
		},
		[selectedMarkerPreset]
	)

	const removeMarker = useCallback((id: string) => {
		setMarkers((prev) => prev.filter((m) => m.id !== id))
	}, [])

	const undo = useCallback(() => {
		setHistory((prev) => {
			if (prev.length === 0) return prev
			const last = prev[prev.length - 1]
			if (last.type === 'add_element') {
				setElements((els) =>
					els.filter((e) => e.id !== last.element.id)
				)
			} else if (last.type === 'add_marker') {
				setMarkers((ms) => ms.filter((m) => m.id !== last.marker.id))
			}
			return prev.slice(0, -1)
		})
	}, [])

	const clearAll = useCallback(() => {
		setElements([])
		setCurrentElement(null)
		setMarkers([])
		setHistory([])
	}, [])

	const saveToLocal = useCallback(() => {
		const data = JSON.stringify({
			elements,
			markers,
			map: selectedMapKey,
		})
		localStorage.setItem('CW-map', data)
	}, [elements, markers, selectedMapKey])

	const loadFromLocal = useCallback(() => {
		const raw = localStorage.getItem('CW-map')
		if (!raw) return
		try {
			const parsed = JSON.parse(raw)
			if (parsed.elements) setElements(parsed.elements)
			if (parsed.markers) setMarkers(parsed.markers)
			if (parsed.map) {
				setSelectedMapKey(parsed.map)
				setMapKey((k) => k + 1)
			}
		} catch {
			// Intentionally empty - failed load silently ignored
		}
	}, [])

	useKeyboardShortcuts({ undo, saveToLocal })

	const accordionItems = [
		{
			key: 'map',
			title: selectedMap.name,
			icon: 'lucide:map',
			content: (
				<>
					<MapSelector
						onSelect={switchMap}
						selectedMapKey={selectedMapKey}
					/>
					<div className="mt-2 flex items-center gap-2 px-2">
						<CheckBox
							checked={showLetterMarkers}
							id="showLetters"
							label="Базовые точки"
							onCheckedChange={(checked) =>
								setShowLetterMarkers(checked)
							}
						/>
					</div>
				</>
			),
		},
		{
			key: 'tools',
			title: 'Инструменты',
			icon: 'lucide:wrench',
			content: <ToolPalette onSelect={setTool} selectedTool={tool} />,
		},
		{
			key: 'markers',
			title: 'Метки',
			icon: 'lucide:map-pin',
			content: (
				<MarkerSelector
					onSelect={setSelectedMarkerPreset}
					onToolChange={setTool}
					selectedPreset={selectedMarkerPreset}
				/>
			),
		},
		{
			key: 'style',
			title: 'Стиль',
			icon: 'lucide:palette',
			content: (
				<StyleControls
					color={color}
					lineWidth={lineWidth}
					onColorChange={setColor}
					onLineWidthChange={setLineWidth}
				/>
			),
		},
	]

	return (
		<div className="relative flex-1">
			<Sidebar>
				<Accordion
					className="gap-1!"
					defaultExpandedKeys={['tools']}
					items={accordionItems}
					selectionMode="multiple"
					size="sm"
					variant={'ghost'}
				/>

				<ActionButtons
					onClear={clearAll}
					onLoad={loadFromLocal}
					onSave={saveToLocal}
					onUndo={undo}
				/>
			</Sidebar>

			<div
				style={{
					width: '100%',
					height: 'calc(100vh - 112px)',
					position: 'relative',
					zIndex: 0,
				}}
			>
				<MapContainer
					center={[0, 0]}
					crs={L.CRS.Simple}
					key={mapKey}
					maxZoom={selectedMap.maxZoom}
					minZoom={0}
					style={{ width: '100%', height: '100%' }}
					zoom={10}
					zoomControl={false}
					zoomSnap={0}
				>
					<TileLayer
						maxNativeZoom={selectedMap.maxZoom}
						noWrap
						tileSize={256}
						url={tileUrl}
					/>

					<SetImageBounds
						fullMaxLevel={selectedMap.fullMaxLevel}
						imageHeight={selectedMap.imageHeight}
						imageWidth={selectedMap.imageWidth}
						padding={0.1}
						viscosity={0.8}
					/>

					<DrawingOverlay
						color={color}
						currentElement={currentElement}
						elements={elements}
						lineWidth={lineWidth}
						markerPreset={selectedMarkerPreset}
						onAddElement={(el) =>
							setHistory((prev) => [
								...prev,
								{ type: 'add_element', element: el },
							])
						}
						onPlaceMarker={placeMarker}
						setCurrentElement={setCurrentElement}
						setElements={setElements}
						tool={tool}
					/>

					<MarkerLayer markers={markers} onRemove={removeMarker} />
				</MapContainer>
			</div>
		</div>
	)
}
