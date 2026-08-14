'use client'

import { Slot } from '@radix-ui/react-slot'
import { AnimatePresence, motion } from 'motion/react'
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

type Position = 'top' | 'bottom' | 'left' | 'right'

type TooltipContextValue = {
	open: boolean
	setOpen: (open: boolean) => void
	position: Position
	triggerRef: React.RefObject<HTMLDivElement | null>
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined)

function TooltipRoot({
	children,
	position = 'top',
	delay = 200,
	closeDelay = 100,
	className,
}: {
	children: ReactNode
	position?: Position
	delay?: number
	closeDelay?: number
	className?: string
}) {
	const [open, setOpenState] = useState(false)
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
	const triggerRef = useRef<HTMLDivElement>(null)

	const handleOpen = useCallback(
		(value: boolean) => {
			if (timeout.current) {
				clearTimeout(timeout.current)
				timeout.current = null
			}

			if (value) {
				timeout.current = setTimeout(() => setOpenState(true), delay)
			} else {
				timeout.current = setTimeout(
					() => setOpenState(false),
					closeDelay
				)
			}
		},
		[delay, closeDelay]
	)

	useEffect(() => {
		return () => {
			if (timeout.current) {
				clearTimeout(timeout.current)
				timeout.current = null
			}
		}
	}, [])

	return (
		<TooltipContext.Provider
			value={{ open, setOpen: handleOpen, position, triggerRef }}
		>
			<div className={cn('inline-flex', className)} ref={triggerRef}>
				{children}
			</div>
		</TooltipContext.Provider>
	)
}

function useTooltip() {
	const ctx = useContext(TooltipContext)
	if (!ctx) {
		throw new Error('Tooltip components must be used within a Root')
	}
	return ctx
}

function TooltipTrigger({
	children,
	underline = true,
	asChild = false,
}: {
	children: ReactNode
	underline?: boolean
	asChild?: boolean
}) {
	const { setOpen } = useTooltip()

	const Comp = asChild ? Slot : 'span'

	return (
		<Comp
			className={cn(
				!asChild && underline && 'underline',
				'cursor-pointer'
			)}
			onBlur={() => setOpen(false)}
			onClick={() => setOpen(true)}
			onFocus={() => setOpen(true)}
			onPointerEnter={() => setOpen(true)}
			onPointerLeave={() => setOpen(false)}
			tabIndex={0}
		>
			{children}
		</Comp>
	)
}
function TooltipContent({ children }: { children: ReactNode }) {
	const { open, position, setOpen, triggerRef } = useTooltip()
	const tooltipRef = useRef<HTMLDivElement>(null)
	const [coords, setCoords] = useState<{ top: number; left: number } | null>(
		null
	)

	const updatePosition = useCallback(() => {
		const trigger = triggerRef.current
		const tooltip = tooltipRef.current
		if (!trigger || !tooltip) return

		const triggerRect = trigger.getBoundingClientRect()
		const tooltipWidth = tooltip.offsetWidth
		const tooltipHeight = tooltip.offsetHeight
		const gap = 8

		switch (position) {
			case 'top':
				setCoords({
					top: triggerRect.top - gap - tooltipHeight,
					left:
						triggerRect.left +
						triggerRect.width / 2 -
						tooltipWidth / 2,
				})
				break
			case 'bottom':
				setCoords({
					top: triggerRect.bottom + gap,
					left:
						triggerRect.left +
						triggerRect.width / 2 -
						tooltipWidth / 2,
				})
				break
			case 'left':
				setCoords({
					top:
						triggerRect.top +
						triggerRect.height / 2 -
						tooltipHeight / 2,
					left: triggerRect.left - gap - tooltipWidth,
				})
				break
			case 'right':
				setCoords({
					top:
						triggerRect.top +
						triggerRect.height / 2 -
						tooltipHeight / 2,
					left: triggerRect.right + gap,
				})
				break
		}
	}, [position, triggerRef])

	useLayoutEffect(() => {
		if (open) {
			updatePosition()
		} else {
			setCoords(null)
		}
	}, [open, updatePosition])

	useEffect(() => {
		if (!open) return

		window.addEventListener('scroll', updatePosition, true)
		window.addEventListener('resize', updatePosition)

		return () => {
			window.removeEventListener('scroll', updatePosition, true)
			window.removeEventListener('resize', updatePosition)
		}
	}, [open, updatePosition])

	const arrowClass = {
		top: 'top-full left-1/2 -translate-x-1/2  border-t-neutral-800 border-x-transparent border-b-transparent',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-800 border-x-transparent border-t-transparent',
		left: 'left-full top-1/2 -translate-y-1/2  border-l-neutral-800 border-y-transparent border-r-transparent',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-800 border-y-transparent border-l-transparent',
	}[position]

	const motion$ = {
		top: { y: 4 },
		bottom: { y: -4 },
		left: { x: 4 },
		right: { x: -4 },
	}[position]

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
					aria-hidden={!open}
					exit={{ opacity: 0, scale: 0.95, ...motion$ }}
					initial={{ opacity: 0, scale: 0.95, ...motion$ }}
					onPointerEnter={() => setOpen(true)}
					onPointerLeave={() => setOpen(false)}
					ref={tooltipRef}
					role="tooltip"
					style={{
						position: 'fixed',
						top: coords?.top ?? 0,
						left: coords?.left ?? 0,
						zIndex: 999999,
					}}
					transition={{ duration: 0.15 }}
				>
					<div className="wrap-break-word relative max-w-sm rounded-lg bg-white px-3 py-2 backdrop-blur-md dark:bg-neutral-800">
						<p className="font-semibold text-sm">{children}</p>
						<span
							className={`absolute h-0 w-0 border-8 ${arrowClass}`}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}

export const Tooltip = {
	Root: TooltipRoot,
	Trigger: TooltipTrigger,
	Content: TooltipContent,
}
