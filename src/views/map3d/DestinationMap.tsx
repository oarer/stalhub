'use client'
import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'
import { mapAssetUrl } from './engine-static/static-source.ts'

type Point = { x: number; z: number }
export default function DestinationMap({
	map,
	position,
	onSelect,
}: {
	map: string
	position: Point
	onSelect: (x: number, z: number) => void
}) {
	const canvas = useRef<HTMLCanvasElement>(null),
		selection = useRef(position),
		callback = useRef(onSelect)
	const navigation = useRef({ ...position, scale: 0.6 }),
		redraw = useRef<() => void>(() => undefined),
		skipCenter = useRef(false)
	const [failed, setFailed] = useState(false)
	useEffect(() => {
		selection.current = position
		callback.current = onSelect
	}, [position, onSelect])
	useEffect(() => {
		if (skipCenter.current) skipCenter.current = false
		else if (Number.isFinite(position.x) && Number.isFinite(position.z)) {
			navigation.current.x = position.x
			navigation.current.z = position.z
		}
		redraw.current()
	}, [position.x, position.z])
	useEffect(() => {
		const el = canvas.current
		if (!el) return
		const ctx = el.getContext('2d')
		if (!ctx) return
		let width = 1,
			height = 1,
			frame = 0,
			dead = false
		const images = new Map<string, HTMLImageElement>(),
			abort = new AbortController()
		let drag:
			| {
					x: number
					y: number
					startX: number
					startY: number
					moved: boolean
			  }
			| undefined
		const local = (e: MouseEvent) => {
			const box = el.getBoundingClientRect()
			return { x: e.clientX - box.left, y: e.clientY - box.top }
		}
		const world = (x: number, y: number) => ({
			x:
				navigation.current.x +
				(x - width / 2) / navigation.current.scale,
			z:
				navigation.current.z +
				(y - height / 2) / navigation.current.scale,
		})
		const draw = () => {
			if (!frame && !dead)
				frame = requestAnimationFrame(() => {
					frame = 0
					const n = navigation.current
					ctx.clearRect(0, 0, width, height)
					ctx.fillStyle = '#19282c'
					ctx.fillRect(0, 0, width, height)
					const a = world(0, 0),
						b = world(width, height)
					for (
						let z = Math.floor(a.z / 512);
						z <= Math.floor(b.z / 512);
						z++
					)
						for (
							let x = Math.floor(a.x / 512);
							x <= Math.floor(b.x / 512);
							x++
						) {
							const key = `${x},${z}`
							let img = images.get(key)
							if (!img) {
								img = new Image()
								images.set(key, img)
								img.onload = draw
								img.onerror = () => {
									if (!dead) setFailed(true)
								}
								img.crossOrigin = 'anonymous'
								const target = img
								void mapAssetUrl(
									`/api/map3d/maps/${encodeURIComponent(map)}/tile/${x}/${z}`
								)
									.then((url) => {
										if (!dead) target.src = url
									})
									.catch(() => {
										if (!dead) setFailed(true)
									})
							}
							if (img.complete && img.naturalWidth)
								ctx.drawImage(
									img,
									(x * 512 - n.x) * n.scale + width / 2,
									(z * 512 - n.z) * n.scale + height / 2,
									512 * n.scale,
									512 * n.scale
								)
						}
					if (images.size > 96) {
						const visible = new Set<string>()
						for (
							let z = Math.floor(a.z / 512);
							z <= Math.floor(b.z / 512);
							z++
						)
							for (
								let x = Math.floor(a.x / 512);
								x <= Math.floor(b.x / 512);
								x++
							)
								visible.add(`${x},${z}`)
						for (const key of images.keys())
							if (!visible.has(key) && images.size > 64)
								images.delete(key)
					}
					const px =
							(selection.current.x - n.x) * n.scale + width / 2,
						py = (selection.current.z - n.z) * n.scale + height / 2
					ctx.beginPath()
					ctx.arc(px, py, 10, 0, Math.PI * 2)
					ctx.fillStyle = '#bceafa'
					ctx.fill()
					ctx.lineWidth = 3
					ctx.strokeStyle = '#182f38'
					ctx.stroke()
					ctx.beginPath()
					ctx.arc(px, py, 3, 0, Math.PI * 2)
					ctx.fillStyle = '#182f38'
					ctx.fill()
					ctx.fillStyle = '#fff'
					ctx.font = '12px sans-serif'
					ctx.fillText(
						`${Math.round(100 / n.scale)} м`,
						16,
						height - 16
					)
					ctx.strokeStyle = '#fff'
					ctx.lineWidth = 2
					ctx.beginPath()
					ctx.moveTo(16, height - 35)
					ctx.lineTo(116, height - 35)
					ctx.stroke()
				})
		}
		redraw.current = draw
		setFailed(false)
		const opts = { signal: abort.signal }
		el.addEventListener(
			'pointerdown',
			(e) => {
				if (e.button !== 0) return
				const p = local(e)
				drag = { ...p, startX: p.x, startY: p.y, moved: false }
				el.setPointerCapture(e.pointerId)
			},
			opts
		)
		el.addEventListener(
			'pointermove',
			(e) => {
				if (!drag) return
				const p = local(e)
				drag.moved ||=
					Math.hypot(p.x - drag.startX, p.y - drag.startY) > 5
				if (drag.moved) {
					navigation.current.x -=
						(p.x - drag.x) / navigation.current.scale
					navigation.current.z -=
						(p.y - drag.y) / navigation.current.scale
					draw()
				}
				drag.x = p.x
				drag.y = p.y
			},
			opts
		)
		el.addEventListener(
			'pointerup',
			(e) => {
				if (drag && !drag.moved) {
					const p = local(e),
						chosen = world(p.x, p.y)
					skipCenter.current = true
					callback.current(chosen.x, chosen.z)
				}
				drag = undefined
			},
			opts
		)
		el.addEventListener(
			'pointercancel',
			() => {
				drag = undefined
			},
			opts
		)
		el.addEventListener(
			'wheel',
			(e) => {
				e.preventDefault()
				const p = local(e),
					before = world(p.x, p.y)
				navigation.current.scale = Math.max(
					0.18,
					Math.min(
						4,
						navigation.current.scale * Math.exp(-e.deltaY * 0.0015)
					)
				)
				const after = world(p.x, p.y)
				navigation.current.x += before.x - after.x
				navigation.current.z += before.z - after.z
				draw()
			},
			{ ...opts, passive: false }
		)
		el.addEventListener(
			'keydown',
			(e) => {
				const n = navigation.current,
					step = 80 / n.scale
				if (e.key === 'Enter') {
					callback.current(n.x, n.z)
					return
				}
				const directions: Record<string, Point> = {
					ArrowLeft: { x: -step, z: 0 },
					ArrowRight: { x: step, z: 0 },
					ArrowUp: { x: 0, z: -step },
					ArrowDown: { x: 0, z: step },
				}
				if (directions[e.key]) {
					e.preventDefault()
					n.x += directions[e.key].x
					n.z += directions[e.key].z
					draw()
				}
			},
			opts
		)
		const observer = new ResizeObserver(() => {
			const box = el.getBoundingClientRect()
			width = box.width
			height = box.height
			const dpr = Math.min(devicePixelRatio, 2)
			el.width = Math.round(width * dpr)
			el.height = Math.round(height * dpr)
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			draw()
		})
		observer.observe(el)
		return () => {
			dead = true
			abort.abort()
			observer.disconnect()
			cancelAnimationFrame(frame)
			for (const image of images.values()) {
				image.onload = null
				image.onerror = null
			}
			images.clear()
			redraw.current = () => undefined
		}
	}, [map])
	return (
		<div className="relative h-[clamp(200px,26vw,390px)] bg-card">
			<canvas
				aria-label="Место появления: перетащите карту, нажмите на нужную точку. Стрелки двигают карту, Enter выбирает центр."
				className="block w-full cursor-grab touch-none focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-[-3px] active:cursor-grabbing"
				ref={canvas}
				tabIndex={0}
			/>
			<div className="absolute top-3 right-3 flex flex-col gap-1">
				<button
					aria-label="Приблизить карту"
					className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-card text-foreground"
					onClick={() => {
						navigation.current.scale = Math.min(
							4,
							navigation.current.scale * 1.5
						)
						redraw.current()
					}}
					type="button"
				>
					<Icon icon="lucide:plus" />
				</button>
				<button
					aria-label="Отдалить карту"
					className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-card text-foreground"
					onClick={() => {
						navigation.current.scale = Math.max(
							0.18,
							navigation.current.scale / 1.5
						)
						redraw.current()
					}}
					type="button"
				>
					<Icon icon="lucide:minus" />
				</button>
				<button
					aria-label="Показать выбранную точку"
					className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-card text-foreground"
					onClick={() => {
						navigation.current.x = position.x
						navigation.current.z = position.z
						redraw.current()
					}}
					type="button"
				>
					<Icon icon="lucide:locate-fixed" />
				</button>
			</div>
			<p className="pointer-events-none absolute top-3 left-3 m-0 max-w-[calc(100%-72px)] rounded-lg bg-card px-2.5 py-2 text-[11px] text-foreground">
				{failed
					? 'Часть карты недоступна. Можно выбрать точку или ввести координаты.'
					: 'Перетаскивайте карту · нажмите, чтобы выбрать место'}
			</p>
		</div>
	)
}
