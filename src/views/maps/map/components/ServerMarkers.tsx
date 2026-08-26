'use client'

import L from 'leaflet'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'
import { useEffect, useMemo } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { getLocale } from '@/lib/getLocale'
import type { Locale } from '@/types/item.type'
import type { MarkersFile } from '@/types/map.type'
import { isPixelCoord } from '@/types/map.type'

type Props = {
	markersFile: MarkersFile | null
	visibleClusterIds: Set<number>
	visibleGroupKeys: Set<string>
	imageWidth: number
	imageHeight: number
	fullMaxLevel: number
}

function getLocalized(
	maybeLocalized: Record<string, string> | undefined,
	lang: Locale
): string | undefined {
	if (!maybeLocalized) return undefined
	return maybeLocalized[lang] ?? maybeLocalized.ru ?? maybeLocalized.en
}

function getIconSize(image?: string): [number, number] {
	const match = image?.match(/_(\d+)x(\d+)\./)
	return match ? [Number(match[1]), Number(match[2])] : [22, 22]
}

function escapeHtml(value: string): string {
	return value.replace(
		/[&<>"']/g,
		(char) =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
			})[char] ?? char
	)
}

export default function ServerMarkers({
	markersFile,
	visibleClusterIds,
	visibleGroupKeys,
	imageWidth,
	imageHeight,
	fullMaxLevel,
}: Props) {
	const map = useMap()
	const lang = getLocale()
	const t = useTranslations()

	if (!markersFile?.markers_clusters) return null

	const out: JSX.Element[] = []

	for (const cluster of markersFile.markers_clusters) {
		if (!visibleClusterIds.has(cluster.id)) continue

		for (const group of cluster.markers) {
			const groupKey = `${cluster.id}_${group.id}`
			if (!visibleGroupKeys.has(groupKey)) continue

			for (const p of group.markers) {
				const coords = p.coordinates
				const isPixel =
					typeof imageWidth === 'number' &&
					typeof imageHeight === 'number' &&
					isPixelCoord(coords, imageWidth, imageHeight)

				const pos: L.LatLngExpression = isPixel
					? map.unproject([coords.lng, coords.lat], fullMaxLevel)
					: L.latLng(coords.lat, coords.lng)

				const icon = L.icon({
					iconUrl:
						p.iconUrl ??
						group.settings?.image ??
						'/default-icon.png',
					iconAnchor: (() => {
						const [width, height] = getIconSize(
							p.iconUrl ?? group.settings?.image
						)
						return [width / 2, height] as [number, number]
					})(),
					iconSize: getIconSize(p.iconUrl ?? group.settings?.image),
					popupAnchor: [
						0,
						-getIconSize(p.iconUrl ?? group.settings?.image)[1],
					],
					className: 'custom-marker',
				})

				const title =
					getLocalized(group.name, lang) || group.slug || 'marker'
				const desc = getLocalized(p.description, lang) || p.popup || ''

				out.push(
					<Marker
						eventHandlers={{
							click: () =>
								window.dispatchEvent(
									new CustomEvent('map-calibration-marker', {
										detail: {
											id: p.id ?? '',
											clusterId: cluster.id,
											groupId: group.id,
											sourceX: coords.lng,
											targetX: 0,
											sourceY: coords.lat,
											targetY: 0,
										},
									})
								),
						}}
						icon={icon}
						key={`${cluster.id}-${group.id}-${p.id ?? `${(pos as L.LatLng).lat}-${(pos as L.LatLng).lng}`}`}
						position={pos}
					>
						<Popup>
							<b style={p.color ? { color: p.color } : undefined}>
								{title}
							</b>
							<br />
							{desc}
							{p.popupImage && (
								<img
									alt={title}
									className="mt-2 max-w-full rounded"
									src={p.popupImage}
								/>
							)}
							<hr />
							<small>
								{t('map.category')}{' '}
								{getLocalized(cluster.name, lang) ?? cluster.id}{' '}
								→ {getLocalized(group.name, lang) ?? group.slug}
							</small>
						</Popup>
					</Marker>
				)
			}

			if (group.polygons?.length)
				out.push(
					<PolygonLayer
						fullMaxLevel={fullMaxLevel}
						group={group}
						key={`${cluster.id}-${group.id}-polygons`}
						lang={lang}
						map={map}
					/>
				)
		}
	}

	return <>{out}</>
}

function PolygonLayer({
	group,
	fullMaxLevel,
	lang,
	map,
}: {
	group: NonNullable<
		MarkersFile['markers_clusters']
	>[number]['markers'][number]
	fullMaxLevel: number
	lang: Locale
	map: L.Map
}) {
	const polygons = useMemo(
		() =>
			(group.polygons ?? []).map((polygon) => ({
				...polygon,
				positions: polygon.points.map((point) =>
					map.unproject([point.lng, point.lat], fullMaxLevel)
				),
			})),
		[group, fullMaxLevel, map]
	)

	useEffect(() => {
		const layers = polygons.map((polygon) => {
			const layer = L.polygon(polygon.positions, {
				color: polygon.color ?? group.settings?.color ?? '#58A6FF',
				fillColor:
					polygon.fillColor ??
					polygon.color ??
					group.settings?.color ??
					'#58A6FF',
				fillOpacity: 0.25,
			})
			const handles: L.Marker[] = []
			const stopEditing = () => {
				for (const handle of handles) handle.removeFrom(map)
				handles.length = 0
			}
			const startEditing = () => {
				stopEditing()
				for (const position of layer.getLatLngs()[0] as L.LatLng[]) {
					const handle = L.marker(position, {
						draggable: true,
						icon: L.divIcon({
							className: 'map-polygon-handle',
							iconSize: [12, 12],
						}),
						zIndexOffset: 1000,
					})
					handle.on('drag', () => {
						const positions = handles.map((item) =>
							item.getLatLng()
						)
						layer.setLatLngs(positions)
					})
					handle.on('dragend', () => {
						const positions = handles.map((item) =>
							item.getLatLng()
						)
						window.dispatchEvent(
							new CustomEvent('map-editor-polygon-points', {
								detail: {
									polygonId: polygon.id ?? '',
									points: positions.map((point) => {
										const projected = map.project(
											point,
											fullMaxLevel
										)
										return {
											lat: projected.y,
											lng: projected.x,
										}
									}),
								},
							})
						)
					})
					handle.on('contextmenu', (event) => {
						event.originalEvent.preventDefault()
						if (handles.length <= 3) return
						const index = handles.indexOf(handle)
						if (index < 0) return
						handles.splice(index, 1)
						handle.removeFrom(map)
						const positions = handles.map((item) =>
							item.getLatLng()
						)
						layer.setLatLngs(positions)
						window.dispatchEvent(
							new CustomEvent('map-editor-polygon-points', {
								detail: {
									polygonId: polygon.id ?? '',
									points: positions.map((point) => {
										const projected = map.project(
											point,
											fullMaxLevel
										)
										return {
											lat: projected.y,
											lng: projected.x,
										}
									}),
								},
							})
						)
					})
					handle.addTo(map)
					handles.push(handle)
				}
			}
			const title =
				getLocalized(group.name, lang) || group.slug || 'polygon'
			const description =
				getLocalized(polygon.description, lang) || polygon.popup || ''
			const popupHtml = `<b>${escapeHtml(title)}</b><br />${escapeHtml(description)}`
			layer.bindTooltip(popupHtml, {
				permanent: false,
				direction: 'top',
				opacity: 0.95,
				sticky: true,
			})
			layer.bindPopup(popupHtml)
			layer.on('click', () =>
				window.dispatchEvent(
					new CustomEvent('map-editor-polygon', {
						detail: { polygonId: polygon.id ?? '' },
					})
				)
			)
			layer.on('edit', () => {
				const points = layer.getLatLngs()[0]
				if (!Array.isArray(points)) return
				window.dispatchEvent(
					new CustomEvent('map-editor-polygon-points', {
						detail: {
							polygonId: polygon.id ?? '',
							points: points.map((point) => {
								const projected = map.project(
									point as L.LatLng,
									fullMaxLevel
								)
								return { lat: projected.y, lng: projected.x }
							}),
						},
					})
				)
			})
			const onEditStart = (event: Event) => {
				const detail = (
					event as CustomEvent<{ polygonId: number | string }>
				).detail
				if (String(detail.polygonId) !== String(polygon.id ?? ''))
					return
				startEditing()
			}
			window.addEventListener('map-editor-edit-polygon', onEditStart)
			layer.addTo(map)
			const pattern = polygon.popup
				? addTextPattern(
						layer,
						polygon.popup,
						polygon.color ?? group.settings?.color ?? '#58A6FF'
					)
				: null
			return { layer, pattern, onEditStart, stopEditing }
		})

		return () => {
			for (const item of layers) {
				window.removeEventListener(
					'map-editor-edit-polygon',
					item.onEditStart
				)
				item.stopEditing()
				item.layer.removeFrom(map)
				item.pattern?.remove()
			}
		}
	}, [group, lang, map, polygons, fullMaxLevel])

	return null
}

function addTextPattern(
	layer: L.Polygon,
	text: string,
	color: string
): SVGElement | null {
	const path = layer.getElement() as SVGPathElement | undefined
	const svg = path?.ownerSVGElement
	if (!path || !svg) return null

	const defs =
		svg.querySelector('defs') ??
		svg.insertBefore(
			document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
			svg.firstChild
		)
	const pattern = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'pattern'
	)
	const patternId = `map-polygon-text-${Math.random().toString(36).slice(2)}`
	pattern.setAttribute('id', patternId)
	pattern.setAttribute('patternUnits', 'userSpaceOnUse')
	pattern.setAttribute('width', '140')
	pattern.setAttribute('height', '56')
	pattern.setAttribute('patternTransform', 'rotate(-45 70 28)')

	const background = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'rect'
	)
	background.setAttribute('width', '140')
	background.setAttribute('height', '56')
	background.setAttribute('fill', color)
	background.setAttribute('fill-opacity', '0.3')
	pattern.appendChild(background)

	const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
	label.setAttribute('x', '70')
	label.setAttribute('y', '34')
	label.setAttribute('text-anchor', 'middle')
	label.setAttribute('font-size', '14')
	label.setAttribute('font-family', 'sans-serif')
	label.setAttribute('font-weight', '600')
	label.setAttribute('fill', color)
	label.setAttribute('fill-opacity', '1')
	label.textContent = text
	pattern.appendChild(label)
	defs.appendChild(pattern)
	path.setAttribute('fill', `url(#${patternId})`)

	return pattern
}
