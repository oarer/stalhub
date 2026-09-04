'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Slider from '@/components/ui/Slider'
import { cn } from '@/lib/cn'

type EditorTool = 'crop' | 'brush' | 'fill'

const PALETTE = [
	'#000000',
	'#ffffff',
	'#ef4444',
	'#f97316',
	'#facc15',
	'#22c55e',
	'#3b82f6',
	'#8b5cf6',
	'#ec4899',
	'#14b8a6',
]

const MAX_DIMENSION = 2400
const MIN_CROP_SIZE = 8
const UNDO_LIMIT = 25

interface CropBox {
	x: number
	y: number
	w: number
	h: number
}

interface ImageEditorModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	file: File | null
	aspectRatio?: number
	isUploading?: boolean
	onConfirm: (file: File) => void
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file)
		const img = new Image()
		img.onload = () => {
			URL.revokeObjectURL(url)
			resolve(img)
		}
		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('Failed to load image'))
		}
		img.src = url
	})
}

function floodFill(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	fill: [number, number, number, number],
	tolerance: number
): void {
	const { width: w, height: h } = ctx.canvas
	const x0 = Math.min(w - 1, Math.max(0, Math.round(x)))
	const y0 = Math.min(h - 1, Math.max(0, Math.round(y)))

	const imageData = ctx.getImageData(0, 0, w, h)
	const data = imageData.data

	const idx = (y0 * w + x0) * 4
	const r0 = data[idx]
	const g0 = data[idx + 1]
	const b0 = data[idx + 2]

	const [fr, fg, fb, fa] = fill

	if (r0 === fr && g0 === fg && b0 === fb) return

	const matches = (r: number, g: number, b: number) =>
		Math.abs(r - r0) <= tolerance &&
		Math.abs(g - g0) <= tolerance &&
		Math.abs(b - b0) <= tolerance

	const stack: number[] = [x0, y0]

	while (stack.length > 0) {
		const cy = stack.pop() as number
		const cx = stack.pop() as number
		const ci = (cy * w + cx) * 4

		if (!matches(data[ci], data[ci + 1], data[ci + 2])) continue

		let left = cx
		let right = cx

		while (
			left > 0 &&
			matches(
				data[(cy * w + left - 1) * 4],
				data[(cy * w + left - 1) * 4 + 1],
				data[(cy * w + left - 1) * 4 + 2]
			)
		)
			left--
		while (
			right < w - 1 &&
			matches(
				data[(cy * w + right + 1) * 4],
				data[(cy * w + right + 1) * 4 + 1],
				data[(cy * w + right + 1) * 4 + 2]
			)
		)
			right++

		for (let px = left; px <= right; px++) {
			const pi = (cy * w + px) * 4
			data[pi] = fr
			data[pi + 1] = fg
			data[pi + 2] = fb
			data[pi + 3] = fa
		}

		if (cy > 0) {
			for (let px = left; px <= right; px++) {
				const pi = ((cy - 1) * w + px) * 4
				if (matches(data[pi], data[pi + 1], data[pi + 2])) {
					stack.push(px, cy - 1)
				}
			}
		}
		if (cy < h - 1) {
			for (let px = left; px <= right; px++) {
				const pi = ((cy + 1) * w + px) * 4
				if (matches(data[pi], data[pi + 1], data[pi + 2])) {
					stack.push(px, cy + 1)
				}
			}
		}
	}

	ctx.putImageData(imageData, 0, 0)
}

function parseHex(color: string): [number, number, number, number] {
	const clean = color.replace('#', '')
	const r = parseInt(clean.slice(0, 2), 16)
	const g = parseInt(clean.slice(2, 4), 16)
	const b = parseInt(clean.slice(4, 6), 16)
	return [
		Number.isFinite(r) ? r : 0,
		Number.isFinite(g) ? g : 0,
		Number.isFinite(b) ? b : 0,
		255,
	]
}

export function ImageEditorModal({
	open,
	onOpenChange,
	title,
	file,
	aspectRatio,
	isUploading = false,
	onConfirm,
}: ImageEditorModalProps) {
	const t = useTranslations()

	const workingRef = useRef<HTMLCanvasElement | null>(null)
	const displayRef = useRef<HTMLCanvasElement | null>(null)
	const dstCtxRef = useRef<CanvasRenderingContext2D | null>(null)

	const [tool, setTool] = useState<EditorTool>('crop')
	const [color, setColor] = useState(PALETTE[0])
	const [brushSize, setBrushSize] = useState(18)
	const [crop, setCrop] = useState<CropBox | null>(null)
	const [undoStack, setUndoStack] = useState<ImageData[]>([])
	const undoStackRef = useRef<ImageData[]>([])
	const [selectionLocked, setSelectionLocked] = useState(false)
	const [loaded, setLoaded] = useState(false)

	const pointerDownRef = useRef(false)
	const dragStartRef = useRef<{ x: number; y: number } | null>(null)
	const lastPointRef = useRef<{ x: number; y: number } | null>(null)
	const originalRef = useRef<HTMLImageElement | null>(null)

	const pushUndo = useCallback(() => {
		const canvas = workingRef.current
		const ctx = canvas?.getContext('2d')
		if (!canvas || !ctx) return
		const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
		const next = [...undoStackRef.current, snapshot].slice(
			Math.max(0, undoStackRef.current.length + 1 - UNDO_LIMIT)
		)
		undoStackRef.current = next
		setUndoStack(next)
	}, [])

	// Render working canvas onto display canvas
	const renderDisplay = useCallback(() => {
		const src = workingRef.current
		const display = displayRef.current
		if (!src || !display) return
		const ctx = display.getContext('2d')
		if (!ctx) return

		const displayW = (display.width = src.width)
		const displayH = (display.height = src.height)

		ctx.clearRect(0, 0, displayW, displayH)
		ctx.drawImage(src, 0, 0, displayW, displayH)
		dstCtxRef.current = ctx
	}, [])

	const restoreOriginal = useCallback(() => {
		const img = originalRef.current
		const canvas = workingRef.current
		if (!img || !canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return
		pushUndo()
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.drawImage(img, 0, 0)
		setCrop(null)
		setSelectionLocked(false)
		undoStackRef.current = []
		setUndoStack([])
		renderDisplay()
	}, [pushUndo, renderDisplay])

	const undo = useCallback(() => {
		if (undoStackRef.current.length === 0) return
		const snapshot = undoStackRef.current[undoStackRef.current.length - 1]
		const canvas = workingRef.current
		const ctx = canvas?.getContext('2d')
		if (!canvas || !ctx) return
		ctx.putImageData(snapshot, 0, 0)
		undoStackRef.current = undoStackRef.current.slice(0, -1)
		setUndoStack(undoStackRef.current)
		setSelectionLocked(false)
		renderDisplay()
	}, [renderDisplay])

	// Load file into working canvas
	useEffect(() => {
		if (!open || !file) return
		let cancelled = false

		loadImageFromFile(file)
			.then((img) => {
				if (cancelled) return
				originalRef.current = img

				const scale = Math.min(
					1,
					MAX_DIMENSION /
						Math.max(img.naturalWidth, img.naturalHeight)
				)
				const w = Math.max(1, Math.round(img.naturalWidth * scale))
				const h = Math.max(1, Math.round(img.naturalHeight * scale))

				const canvas = document.createElement('canvas')
				canvas.width = w
				canvas.height = h
				const ctx = canvas.getContext('2d')
				if (!ctx) return
				ctx.drawImage(img, 0, 0, w, h)
				workingRef.current = canvas
				setLoaded(true)
				setCrop(null)
				setSelectionLocked(false)
				undoStackRef.current = []
				setUndoStack([])
				setTool('crop')
			})
			.catch(() => onOpenChange(false))

		return () => {
			cancelled = true
		}
	}, [open, file, onOpenChange])

	// Render working canvas onto display canvas
	useEffect(() => {
		if (!open || !loaded) return
		renderDisplay()
	}, [open, loaded, renderDisplay])

	// Draw crop overlay
	useEffect(() => {
		const src = workingRef.current
		const ctx = dstCtxRef.current
		const display = displayRef.current
		if (!src || !ctx || !display || tool !== 'crop' || !crop) return

		const { x, y, w, h } = crop

		ctx.clearRect(0, 0, display.width, display.height)
		ctx.drawImage(src, 0, 0, display.width, display.height)

		ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
		ctx.fillRect(0, 0, display.width, y)
		ctx.fillRect(0, y + h, display.width, display.height - (y + h))
		ctx.fillRect(0, y, x, h)
		ctx.fillRect(x + w, y, display.width - (x + w), h)

		ctx.strokeStyle = '#ffffff'
		ctx.lineWidth = 1.5
		ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5)

		ctx.fillStyle = '#ffffff'
		const handle = 6
		for (const [hx, hy] of [
			[0, 0],
			[w, 0],
			[0, h],
			[w, h],
		]) {
			ctx.fillRect(
				x + hx - handle / 2,
				y + hy - handle / 2,
				handle,
				handle
			)
		}
	}, [tool, crop])

	// Reset rendering state when tool becomes crop with no selection
	useEffect(() => {
		if (tool === 'crop' && !crop && !selectionLocked) {
			renderDisplay()
		}
	}, [tool, crop, selectionLocked, renderDisplay])

	const getWorkingPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
		const display = displayRef.current
		if (!display || !workingRef.current) return null
		const rect = display.getBoundingClientRect()
		const scaleX = workingRef.current.width / rect.width
		const scaleY = workingRef.current.height / rect.height
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		}
	}

	const clampCropToCanvas = (box: CropBox): CropBox => {
		const canvas = workingRef.current
		if (!canvas) return box
		const maxX = canvas.width
		const maxY = canvas.height
		const w = Math.min(box.w, maxX)
		const h = Math.min(box.h, maxY)
		const x = Math.max(0, Math.min(box.x, maxX - w))
		const y = Math.max(0, Math.min(box.y, maxY - h))
		return { x, y, w, h }
	}

	const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
		if (!loaded) return
		const point = getWorkingPoint(e)
		if (!point) return
		e.currentTarget.setPointerCapture(e.pointerId)
		pointerDownRef.current = true
		lastPointRef.current = point
		dragStartRef.current = point

		if (tool === 'brush') {
			pushUndo()
			const ctx = workingRef.current?.getContext('2d')
			if (!ctx) return
			ctx.beginPath()
			ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2)
			ctx.fillStyle = color
			ctx.fill()
		} else if (tool === 'fill') {
			pushUndo()
			const ctx = workingRef.current?.getContext('2d')
			if (!ctx) return
			floodFill(ctx, point.x, point.y, parseHex(color), 40)
			renderDisplay()
		} else if (tool === 'crop') {
			setCrop(null)
			setSelectionLocked(false)
		}
		renderDisplay()
	}

	const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
		if (!loaded || !pointerDownRef.current) return
		const point = getWorkingPoint(e)
		if (!point) return
		const canvas = workingRef.current
		if (!canvas) return

		if (tool === 'brush') {
			const ctx = canvas.getContext('2d')
			const last = lastPointRef.current ?? point
			if (!ctx) return
			ctx.strokeStyle = color
			ctx.lineWidth = brushSize
			ctx.lineCap = 'round'
			ctx.lineJoin = 'round'
			ctx.beginPath()
			ctx.moveTo(last.x, last.y)
			ctx.lineTo(point.x, point.y)
			ctx.stroke()
			lastPointRef.current = point
			renderDisplay()
			return
		}

		if (tool === 'crop') {
			const start = dragStartRef.current
			if (!start) return
			let w = point.x - start.x
			let h = point.y - start.y

			if (aspectRatio) {
				const absW = Math.abs(w)
				const absH = Math.abs(h)

				if (absW / aspectRatio > absH) {
					h = Math.sign(h || 1) * (absW / aspectRatio)
				} else {
					w = Math.sign(w || 1) * (absH * aspectRatio)
				}

				w = Math.max(MIN_CROP_SIZE, Math.abs(w))
				h = Math.max(w / aspectRatio, MIN_CROP_SIZE)
				if (h * aspectRatio > w) w = h * aspectRatio
			} else {
				w = Math.max(MIN_CROP_SIZE, Math.abs(w)) * Math.sign(w || 1)
				h = Math.max(MIN_CROP_SIZE, Math.abs(h)) * Math.sign(h || 1)
			}

			const box: CropBox = clampCropToCanvas({
				x: w >= 0 ? start.x : start.x + w,
				y: h >= 0 ? start.y : start.y + h,
				w: Math.abs(w),
				h: Math.abs(h),
			})
			setCrop(box)
		}
	}

	const handlePointerUp = () => {
		pointerDownRef.current = false
		dragStartRef.current = null
		lastPointRef.current = null
		if (tool === 'crop') {
			setSelectionLocked(true)
		}
	}

	const applyCrop = () => {
		if (!crop || !workingRef.current) return
		const src = workingRef.current
		const { x, y, w, h } = crop
		pushUndo()
		const next = document.createElement('canvas')
		next.width = Math.max(1, Math.round(w))
		next.height = Math.max(1, Math.round(h))
		const ctx = next.getContext('2d')
		if (!ctx) return
		ctx.drawImage(src, x, y, w, h, 0, 0, next.width, next.height)
		workingRef.current = next
		setCrop(null)
		setSelectionLocked(false)
		renderDisplay()
	}

	const exportFile = async () => {
		const canvas = workingRef.current
		if (!canvas) return
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/png')
		)
		if (!blob) return
		const name = (file?.name ?? 'image').replace(/\.[^.]+$/, '') + '.png'
		onConfirm(new File([blob], name, { type: 'image/png' }))
	}

	const tools: { key: EditorTool; icon: string; label: string }[] = [
		{
			key: 'crop',
			icon: 'lucide:crop',
			label: t('me.settings.editorCrop'),
		},
		{
			key: 'brush',
			icon: 'lucide:brush',
			label: t('me.settings.editorBrush'),
		},
		{
			key: 'fill',
			icon: 'lucide:droplet',
			label: t('me.settings.editorFill'),
		},
	]

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="max-w-3xl" fullScreen={false}>
				<Modal.Header className="pr-10">
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-3">
					{!loaded ? (
						<div className="flex h-64 items-center justify-center">
							<Icon
								className="animate-spin text-3xl"
								icon="lucide:loader-2"
							/>
						</div>
					) : (
						<>
							<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-accent/50 p-2">
								<div className="flex items-center gap-1">
									{tools.map((item) => (
										<Button
											className={cn(
												'gap-1.5',
												tool === item.key &&
													'bg-primary text-primary-foreground'
											)}
											key={item.key}
											onClick={() => setTool(item.key)}
											size="sm"
											variant="ghost"
										>
											<Icon
												className="text-lg"
												icon={item.icon}
											/>
											<span className="font-semibold text-xs">
												{item.label}
											</span>
										</Button>
									))}
								</div>

								<div className="flex items-center gap-1">
									<Button
										className="gap-1.5"
										disabled={undoStack.length === 0}
										onClick={undo}
										size="sm"
										variant="ghost"
									>
										<Icon
											className="text-lg"
											icon="lucide:undo-2"
										/>
										<span className="hidden font-semibold text-xs sm:inline">
											{t('me.settings.editorUndo')}
										</span>
									</Button>
									<Button
										className="gap-1.5"
										onClick={restoreOriginal}
										size="sm"
										variant="ghost"
									>
										<Icon
											className="text-lg"
											icon="lucide:rotate-ccw"
										/>
										<span className="hidden font-semibold text-xs sm:inline">
											{t('me.settings.editorReset')}
										</span>
									</Button>
								</div>
							</div>

							{(tool === 'brush' || tool === 'fill') && (
								<div className="flex flex-wrap items-center gap-3 rounded-lg bg-accent/50 p-2">
									<div className="flex items-center gap-1.5">
										<PALETTE_SWATCHES
											color={color}
											onSelect={setColor}
											palette={PALETTE}
										/>
										<label className="relative flex cursor-pointer items-center">
											<div
												className="size-6 rounded-full ring-2 ring-primary/50"
												style={{
													backgroundColor: color,
												}}
											/>
											<input
												className="sr-only"
												onChange={(e) =>
													setColor(e.target.value)
												}
												type="color"
												value={color}
											/>
										</label>
									</div>
									{tool === 'brush' && (
										<div className="flex min-w-40 flex-1 items-center gap-2">
											<Slider
												max={120}
												min={2}
												onValueChange={setBrushSize}
												step={1}
												value={brushSize}
											/>
											<span className="w-9 text-right font-semibold text-xs">
												{brushSize}
											</span>
										</div>
									)}
								</div>
							)}

							<div className="flex max-h-70 items-center justify-center overflow-hidden rounded-lg bg-neutral-800/50 p-2">
								<canvas
									className="max-h-70 max-w-full touch-none select-none"
									onPointerDown={handlePointerDown}
									onPointerMove={handlePointerMove}
									onPointerUp={handlePointerUp}
									ref={displayRef}
								/>
							</div>

							{tool === 'crop' && (
								<div className="flex items-center justify-between">
									<span className="font-semibold text-text-accent text-xs">
										{t('me.settings.editorCropHint')}
									</span>
									<Button
										disabled={!crop}
										onClick={applyCrop}
										size="sm"
										variant="secondary"
									>
										<Icon
											className="text-lg"
											icon="lucide:scissors"
										/>
										<span className="font-semibold text-xs">
											{t('me.settings.editorApplyCrop')}
										</span>
									</Button>
								</div>
							)}
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('me.settings.cancel')}</Modal.Close>
					<Button
						disabled={!loaded}
						loading={isUploading}
						onClick={exportFile}
						variant="primary"
					>
						<Icon className="text-lg" icon="lucide:check" />
						{t('me.settings.editorConfirm')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

function PALETTE_SWATCHES({
	palette,
	color,
	onSelect,
}: {
	palette: string[]
	color: string
	onSelect: (c: string) => void
}) {
	return (
		<>
			{palette.map((c) => (
				<button
					aria-label={`color ${c}`}
					className={cn(
						'size-6 cursor-pointer rounded-full ring-2 transition-transform hover:scale-110',
						color === c ? 'ring-primary' : 'ring-transparent'
					)}
					key={c}
					onClick={() => onSelect(c)}
					style={{ backgroundColor: c }}
					type="button"
				/>
			))}
		</>
	)
}
