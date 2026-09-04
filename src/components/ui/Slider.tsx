'use client'

import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

interface SliderProps {
	className?: string
	disabled?: boolean
	max?: number
	min?: number
	onValueChange?: (value: number) => void
	step?: number
	value: number
}

export default function Slider({
	className,
	disabled = false,
	max = 100,
	min = 0,
	onValueChange,
	step = 1,
	value,
}: SliderProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	const onValueChangeRef = useRef(onValueChange)
	useEffect(() => {
		onValueChangeRef.current = onValueChange
	}, [onValueChange])

	const rafRef = useRef<number | null>(null)
	const pendingRef = useRef<number | null>(null)

	const flushUpdate = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current)
			rafRef.current = null
		}
		const pending = pendingRef.current
		if (pending === null) return
		pendingRef.current = null
		onValueChangeRef.current?.(pending)
	}, [])

	const scheduleUpdate = useCallback((v: number) => {
		pendingRef.current = v
		if (rafRef.current !== null) return
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null
			const pending = pendingRef.current
			if (pending === null) return
			pendingRef.current = null
			onValueChangeRef.current?.(pending)
		})
	}, [])

	useEffect(
		() => () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
		},
		[]
	)

	const clamp = useCallback(
		(v: number) => Math.max(min, Math.min(max, Number(v.toFixed(3)))),
		[max, min]
	)

	const percent = ((clamp(value) - min) / (max - min)) * 100

	const valueFromPointer = (clientX: number) => {
		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect || rect.width === 0) return value

		const ratio = (clientX - rect.left) / rect.width
		const raw = min + ratio * (max - min)
		const stepped = Math.round((raw - min) / step) * step + min

		return clamp(stepped)
	}

	const handlePointerDown = (e: React.PointerEvent) => {
		if (disabled) return

		e.preventDefault()
		containerRef.current?.setPointerCapture(e.pointerId)

		scheduleUpdate(valueFromPointer(e.clientX))
	}

	const handlePointerMove = (e: React.PointerEvent) => {
		if (disabled || !e.buttons) return

		scheduleUpdate(valueFromPointer(e.clientX))
	}

	const handlePointerEnd = (e: React.PointerEvent) => {
		if (disabled) return
		if (containerRef.current?.hasPointerCapture(e.pointerId)) {
			containerRef.current.releasePointerCapture(e.pointerId)
		}
		flushUpdate()
	}

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (disabled) return

			let next: number | null = null

			switch (e.key) {
				case 'ArrowRight':
				case 'ArrowUp':
					next = value + step
					break
				case 'ArrowLeft':
				case 'ArrowDown':
					next = value - step
					break
				case 'Home':
					next = min
					break
				case 'End':
					next = max
					break
				default:
					return
			}

			e.preventDefault()
			onValueChangeRef.current?.(clamp(next))
		},
		[clamp, disabled, max, min, step, value]
	)

	return (
		<div
			aria-disabled={disabled}
			aria-valuemax={max}
			aria-valuemin={min}
			aria-valuenow={value}
			className={cn(
				'group relative flex h-6 w-full cursor-pointer touch-none select-none items-center outline-none',
				disabled && 'cursor-not-allowed opacity-50',
				className
			)}
			onKeyDown={handleKeyDown}
			onPointerCancel={handlePointerEnd}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerEnd}
			ref={containerRef}
			role="slider"
			tabIndex={disabled ? -1 : 0}
		>
			<div className="relative h-1.5 w-full rounded-full bg-border-secondary">
				<div
					className="absolute inset-y-0 left-0 rounded-full bg-border/50"
					style={{ width: `${percent}%` }}
				/>
			</div>

			<div
				className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-border shadow-md transition-transform group-focus-within:scale-110 group-hover:scale-110"
				style={{ left: `${percent}%` }}
			/>
		</div>
	)
}
