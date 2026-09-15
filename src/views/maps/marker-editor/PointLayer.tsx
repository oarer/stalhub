'use client'

import {
	type MarkerPointerEvent,
	WebGLMarker,
	WebGLMarkerLayer,
	type WebGLMarkerLayer as WebGLMarkerLayerType,
} from '@oarer/leaflet-webgl-markers'
import type { LeafletMouseEvent } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { MarkerEditorEngine } from './engine'
import {
	ATLAS_COLUMNS,
	ATLAS_ROWS,
	drawIconAtlas,
	pointToFrame,
	waitAtlasMap,
} from './lib/iconAtlas'
import { tileToLatLng as defaultTileToLatLng } from './lib/leafletCoords'
import { hexToRgb, selectColor } from './lib/webgl'
import type { RenderPoint } from './types'

type PointLayerProps = {
	engine: MarkerEditorEngine
	points: RenderPoint[]
	highPerf: boolean
	invertZ?: boolean

	tileToLatLng?: (tileX: number, tileZ: number) => [number, number]

	mapClickClearSupressedRef?: { current: boolean }
}

const MARKER_CLICK_GUARD_MS = 150

async function installAtlas(layer: WebGLMarkerLayerType) {
	try {
		await waitAtlasMap()
	} catch {
		return
	}
	const canvas = drawIconAtlas()
	if (!canvas) return
	layer.setAtlas({
		textureUrl: canvas.toDataURL(),
		columns: ATLAS_COLUMNS,
		rows: ATLAS_ROWS,
	})
}

export default function PointLayer({
	engine,
	points,
	highPerf,
	invertZ = false,
	tileToLatLng: customTileToLatLng,
	mapClickClearSupressedRef,
}: PointLayerProps) {
	const map = useMap()
	const layerRef = useRef<WebGLMarkerLayerType | null>(null)
	const markersRef = useRef<Map<string, WebGLMarker>>(new Map())
	const lastMarkerHitRef = useRef(0)

	useEffect(() => {
		const markerLayer = new WebGLMarkerLayer({
			iconSize: 24,
			atlasColumns: ATLAS_COLUMNS,
			atlasRows: ATLAS_ROWS,
		})
		markerLayer.addTo(map)
		layerRef.current = markerLayer
		void installAtlas(markerLayer)

		const onMarkerClick = (event: MarkerPointerEvent) => {
			lastMarkerHitRef.current = performance.now()
			const id = event.marker.data as string
			engine.selectPoint(id, Boolean(event.originalEvent?.shiftKey))
		}

		const onMapClick = (event: LeafletMouseEvent) => {
			if (event.originalEvent.shiftKey) return
			if (mapClickClearSupressedRef?.current) return
			if (
				performance.now() - lastMarkerHitRef.current <
				MARKER_CLICK_GUARD_MS
			) {
				return
			}
			engine.clearSelection()
		}

		const onMouseOver = () => {
			map.getContainer().style.cursor = 'pointer'
		}
		const onMouseOut = () => {
			map.getContainer().style.cursor = ''
		}
		const onError = (event: { stage: string; message: string }) => {
			console.error('WebGL markers:', event.stage, event.message)
		}

		markerLayer.on('click', onMarkerClick)
		markerLayer.on('mouseover', onMouseOver)
		markerLayer.on('mouseout', onMouseOut)
		markerLayer.on('error', onError)
		map.on('click', onMapClick)

		return () => {
			map.off('click', onMapClick)
			markerLayer.remove()
			layerRef.current = null
			markersRef.current.clear()
		}
	}, [map, engine, mapClickClearSupressedRef])

	useEffect(() => {
		const markerLayer = layerRef.current
		if (!markerLayer) return
		const markers = markersRef.current
		const seen = new Set<string>()
		const baseSize = highPerf ? 10 : 26
		const toLatLng =
			customTileToLatLng ??
			((x: number, z: number) => defaultTileToLatLng(x, z, invertZ))

		for (const point of points) {
			const id = point.id
			seen.add(id)
			const [lat, lng] = toLatLng(point.tileX, point.tileZ)
			const baseColor = hexToRgb(point.colorHex)
			const color = point.selected ? selectColor(baseColor) : baseColor
			const size = point.selected ? baseSize + 8 : baseSize
			const frame = pointToFrame(point.iconIndex, highPerf)

			const existing = markers.get(id)
			if (existing) {
				markerLayer.updateMarker(existing.id, {
					latlng: [lat, lng],
					color,
					size,
					frame,
				})
			} else {
				const marker = new WebGLMarker({
					latlng: [lat, lng],
					color,
					size,
					frame,
					data: id,
				})
				markerLayer.addMarker(marker)
				markers.set(id, marker)
			}
		}

		for (const [id, marker] of markers) {
			if (!seen.has(id)) {
				markerLayer.removeMarker(marker.id)
				markers.delete(id)
			}
		}
	}, [points, highPerf, invertZ, customTileToLatLng])

	return null
}
