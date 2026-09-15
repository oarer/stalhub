'use client'

import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { MarkerEditorEngine } from '@/views/maps/marker-editor/engine'
import type { RenderPoint } from '@/views/maps/marker-editor/types'

type BoxSelectLayerProps = {
	engine: MarkerEditorEngine
	points: RenderPoint[]
	tileToLatLng: (tileX: number, tileZ: number) => [number, number]
	suppressClearRef: { current: boolean }
}

function BoxSelectLayer({
	engine,
	points,
	tileToLatLng,
	suppressClearRef,
}: BoxSelectLayerProps) {
	const map = useMap()
	const stateRef = useRef({
		engine,
		points,
		tileToLatLng,
	})

	stateRef.current = { engine, points, tileToLatLng }

	useEffect(() => {
		map.boxZoom.disable()
		map.dragging.enable()

		let boxActive = false
		let start: L.LatLng | null = null
		let rect: L.Rectangle | null = null

		const onMouseDown = (e: L.LeafletMouseEvent) => {
			if (!e.originalEvent.shiftKey) return
			boxActive = true
			start = e.latlng
			suppressClearRef.current = true
			map.dragging.disable()
			rect = L.rectangle(L.latLngBounds(start, start), {
				color: '#74e4ff',
				weight: 1,
				fillOpacity: 0.15,
				interactive: false,
			}).addTo(map)
		}

		const onMouseMove = (e: L.LeafletMouseEvent) => {
			if (!boxActive || !start || !rect) return
			rect.setBounds(L.latLngBounds(start, e.latlng))
		}

		const onMouseUp = (e: L.LeafletMouseEvent) => {
			if (!boxActive) return
			boxActive = false
			map.dragging.enable()
			if (rect) {
				rect.remove()
				rect = null
			}
			const {
				engine: currentEngine,
				points: currentPoints,
				tileToLatLng: toLatLng,
			} = stateRef.current
			if (start) {
				const bounds = L.latLngBounds(start, e.latlng)
				const ids = currentPoints
					.filter((point) => {
						const ll = toLatLng(point.tileX, point.tileZ)
						return bounds.contains(L.latLng(ll[0], ll[1]))
					})
					.map((point) => point.id)
				currentEngine.selectIds(ids, Boolean(e.originalEvent.shiftKey))
				start = null
			}

			setTimeout(() => {
				suppressClearRef.current = false
			}, 80)
		}

		map.on('mousedown', onMouseDown)
		map.on('mousemove', onMouseMove)
		map.on('mouseup', onMouseUp)

		return () => {
			map.off('mousedown', onMouseDown)
			map.off('mousemove', onMouseMove)
			map.off('mouseup', onMouseUp)
			if (rect) rect.remove()
			map.boxZoom.enable()
			map.dragging.enable()
		}
	}, [map, suppressClearRef])

	return null
}

export default BoxSelectLayer
