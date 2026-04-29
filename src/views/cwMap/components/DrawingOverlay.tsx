import L from 'leaflet'
import { useCallback, useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

import type { DrawElement, LatLng, Tool } from '../types'
import { toLeaflet, toPlain } from '../utils'

interface DrawingOverlayProps {
	tool: Tool
	color: string
	lineWidth: number
	elements: DrawElement[]
	setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>
	currentElement: DrawElement | null
	setCurrentElement: React.Dispatch<React.SetStateAction<DrawElement | null>>
	markerPreset: string
	onPlaceMarker: (latlng: LatLng) => void
	onAddElement: (element: DrawElement) => void
}

export function DrawingOverlay({
	tool,
	color,
	lineWidth,
	elements,
	setElements,
	currentElement,
	setCurrentElement,
	onPlaceMarker,
	onAddElement,
}: DrawingOverlayProps) {
	const map = useMap()
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const isDrawingRef = useRef(false)
	const currentRef = useRef(currentElement)
	currentRef.current = currentElement
	const elementsRef = useRef(elements)
	elementsRef.current = elements
	const toolRef = useRef(tool)
	toolRef.current = tool
	const colorRef = useRef(color)
	colorRef.current = color
	const lineWidthRef = useRef(lineWidth)
	lineWidthRef.current = lineWidth

	const drawArrowHead = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			fromX: number,
			fromY: number,
			toX: number,
			toY: number,
			headLen: number,
			fillColor: string
		) => {
			const angle = Math.atan2(toY - fromY, toX - fromX)
			ctx.fillStyle = fillColor
			ctx.beginPath()
			ctx.moveTo(toX, toY)
			ctx.lineTo(
				toX - headLen * Math.cos(angle - Math.PI / 6),
				toY - headLen * Math.sin(angle - Math.PI / 6)
			)
			ctx.lineTo(
				toX - headLen * Math.cos(angle + Math.PI / 6),
				toY - headLen * Math.sin(angle + Math.PI / 6)
			)
			ctx.closePath()
			ctx.fill()
		},
		[]
	)

	const redraw = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const size = map.getSize()
		const dpr = window.devicePixelRatio || 1
		const needW = Math.floor(size.x * dpr)
		const needH = Math.floor(size.y * dpr)
		if (canvas.width !== needW || canvas.height !== needH) {
			canvas.width = needW
			canvas.height = needH
			canvas.style.width = `${size.x}px`
			canvas.style.height = `${size.y}px`
		}
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
		ctx.clearRect(0, 0, size.x, size.y)

		const allElements = [...elementsRef.current]
		if (currentRef.current) allElements.push(currentRef.current)

		for (const el of allElements) {
			if (el.points.length < 2) continue

			const screenPts = el.points.map((p) =>
				map.latLngToContainerPoint(toLeaflet(p))
			)

			ctx.lineCap = 'round'
			ctx.lineJoin = 'round'
			ctx.strokeStyle = el.color
			ctx.lineWidth = el.width

			if (el.type === 'arrow') {
				const from = screenPts[0]
				const to = screenPts[screenPts.length - 1]
				const headLen = Math.max(12, el.width * 3)
				const angle = Math.atan2(to.y - from.y, to.x - from.x)
				const sx = to.x - headLen * 0.4 * Math.cos(angle)
				const sy = to.y - headLen * 0.4 * Math.sin(angle)
				ctx.beginPath()
				ctx.moveTo(from.x, from.y)
				ctx.lineTo(sx, sy)
				ctx.stroke()
				drawArrowHead(
					ctx,
					from.x,
					from.y,
					to.x,
					to.y,
					headLen,
					el.color
				)
			} else if (el.type === 'line') {
				const from = screenPts[0]
				const to = screenPts[screenPts.length - 1]
				ctx.beginPath()
				ctx.moveTo(from.x, from.y)
				ctx.lineTo(to.x, to.y)
				ctx.stroke()
			} else if (el.type === 'rect') {
				const from = screenPts[0]
				const to = screenPts[screenPts.length - 1]
				ctx.beginPath()
				ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y)
				ctx.stroke()
			} else if (el.type === 'circle') {
				const from = screenPts[0]
				const to = screenPts[screenPts.length - 1]
				const rx = Math.abs(to.x - from.x)
				const ry = Math.abs(to.y - from.y)
				const r = Math.max(rx, ry)
				ctx.beginPath()
				ctx.arc(from.x, from.y, r, 0, Math.PI * 2)
				ctx.stroke()
			} else {
				ctx.beginPath()
				ctx.moveTo(screenPts[0].x, screenPts[0].y)
				for (let i = 1; i < screenPts.length; i++) {
					ctx.lineTo(screenPts[i].x, screenPts[i].y)
				}
				ctx.stroke()
			}
		}
	}, [map, drawArrowHead])

	useEffect(() => {
		const container = map.getContainer()
		const canvas = document.createElement('canvas')
		canvas.style.position = 'absolute'
		canvas.style.top = '0'
		canvas.style.left = '0'
		canvas.style.pointerEvents = 'none'
		canvas.style.zIndex = '450'
		container.appendChild(canvas)
		canvasRef.current = canvas

		const onMapMove = () => redraw()
		map.on('move zoom moveend zoomend viewreset resize', onMapMove)
		redraw()

		return () => {
			map.off('move zoom moveend zoomend viewreset resize', onMapMove)
			if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
		}
	}, [map, redraw])

	useEffect(() => {
		const container = map.getContainer()

		const getLatLng = (e: PointerEvent) => {
			const rect = container.getBoundingClientRect()
			const point = L.point(e.clientX - rect.left, e.clientY - rect.top)
			return map.containerPointToLatLng(point)
		}

		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return
			const t = toolRef.current
			if (t === 'pan') return

			const latlng = getLatLng(e)

			if (t === 'marker') {
				e.stopPropagation()
				e.preventDefault()
				onPlaceMarker(toPlain(latlng))
				return
			}

			if (t === 'eraser') {
				e.stopPropagation()
				e.preventDefault()
				const clickPt = map.latLngToContainerPoint(latlng)
				const threshold = Math.max(15, lineWidthRef.current * 3)
				const idx = elementsRef.current.findIndex((el) =>
					el.points.some((p) => {
						const pt = map.latLngToContainerPoint(toLeaflet(p))
						return (
							Math.hypot(pt.x - clickPt.x, pt.y - clickPt.y) <
							threshold
						)
					})
				)
				if (idx >= 0) {
					setElements((prev) => prev.filter((_, i) => i !== idx))
				}
				return
			}

			e.stopPropagation()
			e.preventDefault()
			map.dragging.disable()
			isDrawingRef.current = true
			container.setPointerCapture(e.pointerId)

			const typeMap: Record<string, DrawElement['type']> = {
				pen: 'stroke',
				arrow: 'arrow',
				line: 'line',
				rect: 'rect',
				circle: 'circle',
			}

			const newEl: DrawElement = {
				id: genId(),
				type: typeMap[t] ?? 'stroke',
				points: [toPlain(latlng)],
				color: colorRef.current,
				width: lineWidthRef.current,
			}
			setCurrentElement(newEl)
		}

		const onMove = (e: PointerEvent) => {
			if (!isDrawingRef.current) return
			const latlng = getLatLng(e)
			const plain = toPlain(latlng)
			setCurrentElement((prev) => {
				if (!prev) return prev
				const twoPointTypes = ['arrow', 'line', 'rect', 'circle']
				if (twoPointTypes.includes(prev.type)) {
					return { ...prev, points: [prev.points[0], plain] }
				}
				return { ...prev, points: [...prev.points, plain] }
			})
		}

		const onUp = () => {
			if (!isDrawingRef.current) return
			isDrawingRef.current = false
			map.dragging.enable()
			const finished = currentRef.current
			if (finished && finished.points.length >= 2) {
				setElements((prev) => [...prev, finished])
				onAddElement(finished)
			}
			setCurrentElement(null)
		}

		container.addEventListener('pointerdown', onDown, { capture: true })
		container.addEventListener('pointermove', onMove)
		container.addEventListener('pointerup', onUp)
		container.addEventListener('pointercancel', onUp)

		return () => {
			container.removeEventListener('pointerdown', onDown, {
				capture: true,
			})
			container.removeEventListener('pointermove', onMove)
			container.removeEventListener('pointerup', onUp)
			container.removeEventListener('pointercancel', onUp)
		}
	}, [map, setElements, setCurrentElement, onPlaceMarker, onAddElement])

	useEffect(() => {
		const container = map.getContainer()
		const cursorMap: Record<string, string> = {
			pen: 'crosshair',
			arrow: 'crosshair',
			line: 'crosshair',
			rect: 'crosshair',
			circle: 'crosshair',
			eraser: 'pointer',
			marker: 'copy',
			pan: '',
		}
		container.style.cursor = cursorMap[tool] ?? ''
		return () => {
			container.style.cursor = ''
		}
	}, [tool, map])

	return null
}

function genId(): string {
	return Math.random().toString(36).slice(2, 10)
}
