'use client'

import L, { type LeafletMouseEvent } from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { MarkerEditorEngine } from './engine'
import {
	latLngToTile as defaultLatLngToTile,
	tileToLatLng as defaultTileToLatLng,
} from './lib/leafletCoords'
import type { RenderPoint } from './types'

type SelectionRingLayerProps = {
	engine: MarkerEditorEngine
	points: RenderPoint[]
	invertZ?: boolean
	tileToLatLng?: (tileX: number, tileZ: number) => [number, number]
	latLngToTile?: (
		lat: number,
		lng: number
	) => { tileX: number; tileZ: number }
}

const RING_SIZE = 34

function ringIcon(): L.DivIcon {
	return L.divIcon({
		className: '',
		html: `<div style="width:${RING_SIZE}px;height:${RING_SIZE}px;background:transparent;border:2px solid #74e4ff;border-radius:9999px;box-shadow:0 0 0 1px rgba(0,0,0,0.55), 0 0 8px rgba(116,228,255,0.8);pointer-events:none;"></div>`,
		iconSize: [RING_SIZE, RING_SIZE],
		iconAnchor: [RING_SIZE / 2, RING_SIZE / 2],
	})
}

export default function SelectionRingLayer({
	engine,
	points,
	invertZ = false,
	tileToLatLng: customTileToLatLng,
	latLngToTile: customLatLngToTile,
}: SelectionRingLayerProps) {
	const map = useMap()
	const layerRef = useRef<L.LayerGroup | null>(null)
	const markersRef = useRef<Map<string, L.Marker>>(new Map())

	const selected = useMemo(
		() => points.filter((point) => point.selected),
		[points]
	)

	useEffect(() => {
		const layer = L.layerGroup().addTo(map)
		layerRef.current = layer
		return () => {
			layer.clearLayers()
			map.removeLayer(layer)
			markersRef.current.clear()
		}
	}, [map])

	useEffect(() => {
		const layer = layerRef.current
		if (!layer) return
		const markers = markersRef.current
		const seen = new Set<string>()
		const toLatLng =
			customTileToLatLng ??
			((x: number, z: number) => defaultTileToLatLng(x, z, invertZ))
		const toTile =
			customLatLngToTile ??
			((lat: number, lng: number) =>
				defaultLatLngToTile(lat, lng, invertZ))

		for (const point of selected) {
			seen.add(point.id)
			const [lat, lng] = toLatLng(point.tileX, point.tileZ)
			let marker = markers.get(point.id)

			if (!marker) {
				marker = L.marker([lat, lng], {
					interactive: true,
					draggable: true,
					icon: ringIcon(),
					pane: 'markerPane',
				})
				marker.addTo(layer)
				markers.set(point.id, marker)

				marker.on('click', (event: LeafletMouseEvent) => {
					L.DomEvent.stopPropagation(event.originalEvent)
					engine.selectPoint(point.id, event.originalEvent.shiftKey)
				})
				marker.on('dragstart', () => {
					engine.dragStart(point.id)
				})
				marker.on('drag', (event: L.LeafletEvent) => {
					const dragged = event.target as L.Marker
					const ll = dragged.getLatLng()
					const tile = toTile(ll.lat, ll.lng)
					engine.dragTo(tile.tileX, tile.tileZ)
				})
				marker.on('dragend', () => {
					engine.dragEnd()
				})
			}

			marker.setLatLng([lat, lng])
		}

		for (const [id, marker] of markers) {
			if (!seen.has(id)) {
				layer.removeLayer(marker)
				markers.delete(id)
			}
		}
	}, [selected, invertZ, engine, customTileToLatLng, customLatLngToTile])

	return null
}
