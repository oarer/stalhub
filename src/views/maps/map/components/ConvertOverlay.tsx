'use client'

import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import BoxSelectLayer from '@/views/maps/marker-editor/BoxSelectLayer'
import EngineControls from '@/views/maps/marker-editor/EngineControls'
import { MarkerEditorEngine } from '@/views/maps/marker-editor/engine'
import PointLayer from '@/views/maps/marker-editor/PointLayer'
import SelectionRingLayer from '@/views/maps/marker-editor/SelectionRingLayer'
import type { UiSnapshot } from '@/views/maps/marker-editor/types'

const WORLD_COORD_SCALE = 512
const WORLD_COORD_OFFSET_X = 11776
const WORLD_COORD_OFFSET_Z = 5632

function worldTileToLatLng(
	map: L.Map,
	tileX: number,
	tileZ: number,
	fullMaxLevel: number
): [number, number] {
	const px = tileX * WORLD_COORD_SCALE + WORLD_COORD_OFFSET_X
	const py = tileZ * WORLD_COORD_SCALE + WORLD_COORD_OFFSET_Z
	const ll = map.unproject([px, py], fullMaxLevel)
	return [ll.lat, ll.lng]
}

function worldLatLngToTile(
	map: L.Map,
	lat: number,
	lng: number,
	fullMaxLevel: number
): { tileX: number; tileZ: number } {
	const ll = L.latLng(lat, lng)
	const px = map.project(ll, fullMaxLevel).x
	const py = map.project(ll, fullMaxLevel).y
	return {
		tileX: (px - WORLD_COORD_OFFSET_X) / WORLD_COORD_SCALE,
		tileZ: (py - WORLD_COORD_OFFSET_Z) / WORLD_COORD_SCALE,
	}
}

function ConvertPanel({
	engineOf,
	ui,
	portalTarget,
}: {
	engineOf: () => MarkerEditorEngine | null
	ui: UiSnapshot
	portalTarget: HTMLElement
}) {
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	return mounted
		? createPortal(
				<EngineControls engineOf={engineOf} ui={ui} />,
				portalTarget
			)
		: null
}

export default function ConvertOverlay({
	fullMaxLevel,
}: {
	fullMaxLevel: number
}) {
	const map = useMap()
	const engineRef = useRef<MarkerEditorEngine | null>(null)
	const [ui, setUi] = useState<UiSnapshot | null>(null)
	const suppressClearRef = useRef(false)

	const portalTarget =
		typeof document !== 'undefined'
			? document.getElementById('map-editor-sidebar')
			: null

	useEffect(() => {
		const engine = new MarkerEditorEngine()
		engineRef.current = engine
		engine.onUi = (snapshot) => setUi(snapshot)

		const onKeyDown = (e: KeyboardEvent) => engine.onKeyDown(e)
		window.addEventListener('keydown', onKeyDown)

		const reportView = () => {
			const center = map.getCenter()
			const projected = map.project(center, fullMaxLevel)
			const worldX = projected.x - WORLD_COORD_OFFSET_X
			const worldZ = projected.y - WORLD_COORD_OFFSET_Z
			engine.onViewChange(
				-worldZ / WORLD_COORD_SCALE,
				worldX / WORLD_COORD_SCALE,
				map.getZoom()
			)
		}
		reportView()
		map.on('moveend', reportView)

		return () => {
			map.off('moveend', reportView)
			window.removeEventListener('keydown', onKeyDown)
			engine.onUi = null
			engineRef.current = null
		}
	}, [map, fullMaxLevel])

	const tileToLatLng = useMemo(
		() => (tileX: number, tileZ: number) =>
			worldTileToLatLng(map, tileX, tileZ, fullMaxLevel),
		[map, fullMaxLevel]
	)

	const latLngToTile = useMemo(
		() => (lat: number, lng: number) =>
			worldLatLngToTile(map, lat, lng, fullMaxLevel),
		[map, fullMaxLevel]
	)

	return (
		<>
			{ui && (
				<>
					<BoxSelectLayer
						engine={engineRef.current!}
						points={ui.points}
						suppressClearRef={suppressClearRef}
						tileToLatLng={tileToLatLng}
					/>
					<PointLayer
						engine={engineRef.current!}
						highPerf={ui.highPerf}
						invertZ={false}
						mapClickClearSupressedRef={suppressClearRef}
						points={ui.points}
						tileToLatLng={tileToLatLng}
					/>
					<SelectionRingLayer
						engine={engineRef.current!}
						invertZ={false}
						latLngToTile={latLngToTile}
						points={ui.points}
						tileToLatLng={tileToLatLng}
					/>
				</>
			)}
			{ui && portalTarget && (
				<ConvertPanel
					engineOf={() => engineRef.current}
					portalTarget={portalTarget}
					ui={ui}
				/>
			)}
		</>
	)
}
