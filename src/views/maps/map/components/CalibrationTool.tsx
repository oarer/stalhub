'use client'

import { useEffect, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import type { MarkersFile } from '@/types/map.type'

type CalibrationPoint = {
	id: number | string
	sourceX: number
	sourceY: number
	targetX: number
	targetY: number
}

type Axis = 'x' | 'y'

type Props = {
	markersFile: MarkersFile | null
	fullMaxLevel: number
	imageHeight: number
	imageWidth: number
}

export default function CalibrationTool({
	markersFile,
	fullMaxLevel,
	imageHeight,
	imageWidth,
}: Props) {
	const map = useMap()
	const [enabled, setEnabled] = useState(false)
	const [axis, setAxis] = useState<Axis>('y')
	const [selected, setSelected] = useState<CalibrationPoint | null>(null)
	const [points, setPoints] = useState<CalibrationPoint[]>([])
	const [message, setMessage] = useState('')

	useEffect(() => {
		const container = map.getContainer()
		const onMarkerSelect = (event: Event) => {
			const detail = (event as CustomEvent<CalibrationPoint>).detail
			setSelected({ ...detail, targetX: 0, targetY: 0 })
			setMessage(
				`Теперь кликни по правильному месту выбранной метки (ось ${axis.toUpperCase()})`
			)
		}
		container.classList.toggle('map-calibration-mode', enabled)
		map.setMaxZoom(enabled ? fullMaxLevel + 3 : fullMaxLevel)
		window.addEventListener('map-calibration-marker', onMarkerSelect)
		return () => {
			container.classList.remove('map-calibration-mode')
			map.setMaxZoom(fullMaxLevel)
			window.removeEventListener('map-calibration-marker', onMarkerSelect)
		}
	}, [axis, enabled, fullMaxLevel, map])

	useMapEvents({
		click(event) {
			if (!enabled || !selected) return
			const projected = map.project(event.latlng, fullMaxLevel)
			setPoints((current) =>
				[
					...current,
					{
						...selected,
						targetX: projected.x,
						targetY: projected.y,
					},
				].slice(-2)
			)
			setSelected(null)
			setMessage(`Точка ${points.length + 1} сохранена`)
		},
	})

	const download = () => {
		if (!markersFile || points.length !== 2) return
		const [a, b] = points
		const sourceA = axis === 'x' ? a.sourceX : a.sourceY
		const sourceB = axis === 'x' ? b.sourceX : b.sourceY
		const targetA = axis === 'x' ? a.targetX : a.targetY
		const targetB = axis === 'x' ? b.targetX : b.targetY
		if (sourceA === sourceB) {
			setMessage(
				`Нужны две метки с разными координатами ${axis.toUpperCase()}`
			)
			return
		}
		const scale = (targetB - targetA) / (sourceB - sourceA)
		const transform = (source: number) =>
			targetA + (source - sourceA) * scale
		const output = structuredClone(markersFile)
		for (const cluster of output.markers_clusters ?? []) {
			for (const group of cluster.markers) {
				for (const marker of group.markers)
					marker.coordinates[axis === 'x' ? 'lng' : 'lat'] =
						transform(
							marker.coordinates[axis === 'x' ? 'lng' : 'lat']
						)
				for (const polygon of group.polygons ?? [])
					for (const vertex of polygon.points)
						vertex[axis === 'x' ? 'lng' : 'lat'] = transform(
							vertex[axis === 'x' ? 'lng' : 'lat']
						)
			}
		}
		output.image = {
			...output.image,
			width: imageWidth,
			height: imageHeight,
		}
		const blob = new Blob([JSON.stringify(output, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'markers-calibrated.json'
		link.click()
		URL.revokeObjectURL(url)
		setMessage(
			`Готово: scale${axis.toUpperCase()}=${scale.toFixed(6)}. Файл скачан`
		)
	}

	return (
		<div className="pointer-events-auto absolute right-3 bottom-12 z-1000 flex max-w-80 flex-col gap-2 rounded-md bg-card/90 p-3 text-xs shadow-lg ring-1 ring-primary/30 backdrop-blur-md">
			<button
				className="rounded bg-primary px-2 py-1 text-primary-foreground"
				onClick={() => setEnabled((value) => !value)}
				type="button"
			>
				Калибровка
			</button>
			{enabled && (
				<>
					<div className="flex gap-1">
						{(['x', 'y'] as Axis[]).map((value) => (
							<button
								className="rounded bg-secondary px-2 py-1 disabled:opacity-50"
								disabled={axis === value}
								key={value}
								onClick={() => {
									setAxis(value)
									setPoints([])
									setSelected(null)
									setMessage('Контрольные точки сброшены')
								}}
								type="button"
							>
								Калибровать {value.toUpperCase()}
							</button>
						))}
					</div>
					<p>
						Увеличь масштаб при необходимости. Нажми на саму иконку
						метки, затем кликни по правильному месту по оси{' '}
						{axis.toUpperCase()}. Повтори для второй метки.
					</p>
					<p>Контрольных точек: {points.length}/2</p>
					{selected && (
						<p className="text-primary">
							Ожидается правильное место выбранной метки
						</p>
					)}
					<button
						className="rounded bg-secondary px-2 py-1 disabled:opacity-50"
						disabled={points.length !== 2}
						onClick={download}
						type="button"
					>
						Скачать пересчитанный JSON
					</button>
				</>
			)}
			{message && <p>{message}</p>}
		</div>
	)
}
