'use client'

import { Slot } from '@radix-ui/react-slot'
import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react'
import type React from 'react'
import {
	Children,
	cloneElement,
	createContext,
	forwardRef,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

type HoverCardContextValue = {
	open: boolean
	setOpen: (v: boolean) => void
	anchorRef: React.RefObject<HTMLDivElement | null>
	handleEnter: () => void
	handleLeave: () => void
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null)

function useHoverCard() {
	const ctx = useContext(HoverCardContext)
	if (!ctx) {
		throw new Error(
			'HoverCard compound components must be used within <HoverCard.Root>'
		)
	}
	return ctx
}

type RootProps = React.HTMLAttributes<HTMLDivElement> & {
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
	openDelay?: number
	closeDelay?: number
}

const HoverCardRoot = forwardRef<HTMLDivElement, RootProps>(
	function HoverCardRoot(
		{
			defaultOpen = false,
			open: controlledOpen,
			onOpenChange,
			openDelay = 200,
			closeDelay = 200,
			className,
			children,
			...props
		},
		ref
	) {
		const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
		const isControlled = controlledOpen !== undefined
		const open = isControlled ? controlledOpen : uncontrolledOpen
		const anchorRef = useRef<HTMLDivElement | null>(null)

		const setOpen = useCallback(
			(v: boolean) => {
				if (!isControlled) setUncontrolledOpen(v)
				onOpenChange?.(v)
			},
			[isControlled, onOpenChange]
		)

		const openTimer = useRef<number | null>(null)
		const closeTimer = useRef<number | null>(null)

		const clearTimers = useCallback(() => {
			if (openTimer.current) clearTimeout(openTimer.current)
			if (closeTimer.current) clearTimeout(closeTimer.current)
		}, [])

		const handleEnter = useCallback(() => {
			clearTimers()
			openTimer.current = window.setTimeout(() => {
				setOpen(true)
			}, openDelay)
		}, [clearTimers, openDelay, setOpen])

		const handleLeave = useCallback(() => {
			clearTimers()
			closeTimer.current = window.setTimeout(() => {
				setOpen(false)
			}, closeDelay)
		}, [clearTimers, closeDelay, setOpen])

		useEffect(() => {
			return () => clearTimers()
		}, [clearTimers])

		const setRootRefs = useCallback(
			(node: HTMLDivElement | null) => {
				anchorRef.current = node
				setRef(ref, node)
			},
			[ref]
		)

		return (
			<HoverCardContext.Provider
				value={{ open, setOpen, anchorRef, handleEnter, handleLeave }}
			>
				<div
					className={cn('relative inline-block', className)}
					onMouseEnter={handleEnter}
					onMouseLeave={handleLeave}
					ref={setRootRefs}
					{...props}
				>
					{children}
				</div>
			</HoverCardContext.Provider>
		)
	}
)

type TriggerProps = React.HTMLAttributes<HTMLDivElement> & {
	asChild?: boolean
}

const HoverCardTrigger = forwardRef<HTMLDivElement, TriggerProps>(
	function HoverCardTrigger({ asChild = false, className, ...props }, ref) {
		const Comp = asChild ? Slot : 'div'
		return (
			<Comp
				className={cn(
					!asChild && 'inline-block cursor-pointer',
					className
				)}
				data-slot="hover-card-trigger"
				ref={ref}
				{...props}
			/>
		)
	}
)

export type HoverCardSide = 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'center' | 'end'

function setRef(ref: React.Ref<unknown> | undefined, node: unknown) {
	if (typeof ref === 'function') ref(node)
	else if (ref != null) (ref as React.RefObject<unknown>).current = node
}

function getChildRef(child: React.ReactElement) {
	return (
		(child as React.ReactElement & { ref?: React.Ref<unknown> }).ref ??
		(child.props as { ref?: React.Ref<unknown> }).ref ??
		null
	)
}

const StableSlot = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
	function StableSlot({ children, ...props }, forwardedRef) {
		const child = Children.toArray(children)[0]

		const refs = useRef({
			forwarded: forwardedRef,
			child: isValidElement(child) ? getChildRef(child) : null,
		})
		refs.current.forwarded = forwardedRef
		if (isValidElement(child)) refs.current.child = getChildRef(child)

		const ref = useRef((node: unknown) => {
			setRef(refs.current.forwarded, node)
			setRef(refs.current.child, node)
		})

		if (!isValidElement(child)) return null

		return cloneElement(child, {
			...props,
			ref: ref.current,
		} as React.HTMLAttributes<HTMLElement> & {
			ref: React.Ref<unknown>
		})
	}
)

const MotionSlot = motion.create(StableSlot)

type ContentProps = Omit<HTMLMotionProps<'div'>, 'ref'> & {
	asChild?: boolean
	side?: HoverCardSide
	align?: Align
	sideOffset?: number
}

const VIEWPORT_MARGIN = 8

const HoverCardContent = forwardRef<HTMLDivElement, ContentProps>(
	function HoverCardContent(
		{
			className,
			asChild = false,
			side = 'bottom',
			align = 'center',
			sideOffset = 8,
			children,
			onMouseEnter,
			onMouseLeave,
			style,
			...props
		},
		ref
	) {
		const { open, anchorRef, handleEnter, handleLeave } = useHoverCard()
		const id = useId()
		const [mounted, setMounted] = useState(false)
		const [pos, setPos] = useState<{ left: number; top: number } | null>(
			null
		)
		const contentNodeRef = useRef<HTMLDivElement | null>(null)

		useEffect(() => {
			setMounted(true)
		}, [])

		useEffect(() => {
			if (!open) {
				setPos(null)
				return
			}
			let raf = 0
			const place = () => {
				cancelAnimationFrame(raf)
				raf = requestAnimationFrame(() => {
					const anchor = anchorRef.current?.getBoundingClientRect()
					const content =
						contentNodeRef.current?.getBoundingClientRect()
					if (!anchor || !content) return
					const vw = window.innerWidth
					const vh = window.innerHeight
					const m = VIEWPORT_MARGIN
					let left = 0
					let top = 0

					if (side === 'top' || side === 'bottom') {
						left =
							align === 'start'
								? anchor.left
								: align === 'end'
									? anchor.right - content.width
									: anchor.left +
										anchor.width / 2 -
										content.width / 2
						left = Math.min(
							Math.max(left, m),
							Math.max(vw - content.width - m, m)
						)

						top =
							side === 'bottom'
								? anchor.bottom + sideOffset
								: anchor.top - content.height - sideOffset
						if (
							side === 'bottom' &&
							top + content.height > vh - m &&
							anchor.top - content.height - sideOffset >= m
						) {
							top = anchor.top - content.height - sideOffset
						}
						if (
							side === 'top' &&
							top < m &&
							anchor.bottom + sideOffset + content.height <=
								vh - m
						) {
							top = anchor.bottom + sideOffset
						}
						top = Math.min(
							Math.max(top, m),
							Math.max(vh - content.height - m, m)
						)
					} else {
						top =
							align === 'start'
								? anchor.top
								: align === 'end'
									? anchor.bottom - content.height
									: anchor.top +
										anchor.height / 2 -
										content.height / 2
						top = Math.min(
							Math.max(top, m),
							Math.max(vh - content.height - m, m)
						)

						left =
							side === 'right'
								? anchor.right + sideOffset
								: anchor.left - content.width - sideOffset
						if (
							side === 'right' &&
							left + content.width > vw - m &&
							anchor.left - content.width - sideOffset >= m
						) {
							left = anchor.left - content.width - sideOffset
						}
						if (
							side === 'left' &&
							left < m &&
							anchor.right + sideOffset + content.width <= vw - m
						) {
							left = anchor.right + sideOffset
						}
						left = Math.min(
							Math.max(left, m),
							Math.max(vw - content.width - m, m)
						)
					}

					setPos((prev) =>
						prev &&
						Math.abs(prev.left - left) < 0.5 &&
						Math.abs(prev.top - top) < 0.5
							? prev
							: { left, top }
					)
				})
			}

			place()
			window.addEventListener('scroll', place, true)
			window.addEventListener('resize', place)
			const ro =
				typeof ResizeObserver !== 'undefined'
					? new ResizeObserver(place)
					: null
			if (contentNodeRef.current && ro) {
				ro.observe(contentNodeRef.current)
			}
			return () => {
				cancelAnimationFrame(raf)
				window.removeEventListener('scroll', place, true)
				window.removeEventListener('resize', place)
				ro?.disconnect()
			}
		}, [open, side, align, sideOffset, anchorRef])

		const axis = side === 'top' || side === 'bottom' ? 'y' : 'x'
		const sign = side === 'top' || side === 'left' ? 1 : -1

		const motionProps = {
			animate: {
				opacity: 1,
				scale: 1,
				[axis]: 0,
			},
			initial: {
				opacity: 0,
				scale: 0.95,
				[axis]: 4 * sign,
			},
			exit: {
				opacity: 0,
				scale: 0.95,
				[axis]: 4 * sign,
				pointerEvents: 'none' as const,
			},
			transition: {
				type: 'spring' as const,
				stiffness: 500,
				damping: 30,
				mass: 0.8,
			},
		}

		const setContentRefs = useCallback(
			(node: HTMLDivElement | null) => {
				contentNodeRef.current = node
				setRef(ref, node)
			},
			[ref]
		)

		const contentProps = {
			...props,
			className: cn(
				'z-50 max-h-[85vh] w-64 overflow-y-auto rounded-lg border-2 border-primary/60 bg-card p-4 shadow-md',
				className
			),
			id: `hover-card-content-${id}`,
			role: 'dialog',
			onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
				onMouseEnter?.(e)
				handleEnter()
			},
			onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
				onMouseLeave?.(e)
				handleLeave()
			},
			style: {
				position: 'fixed' as const,
				left: pos?.left ?? 0,
				top: pos?.top ?? 0,
				visibility: (pos ? 'visible' : 'hidden') as
					| 'visible'
					| 'hidden',
				...style,
			},
			ref: setContentRefs,
		}

		if (!mounted || typeof document === 'undefined') return null

		return createPortal(
			<AnimatePresence>
				{open ? (
					asChild ? (
						<MotionSlot
							key="content"
							{...motionProps}
							{...contentProps}
						>
							{children}
						</MotionSlot>
					) : (
						<motion.div
							key="content"
							{...motionProps}
							{...contentProps}
						>
							{children}
						</motion.div>
					)
				) : null}
			</AnimatePresence>,
			document.body
		)
	}
)

export const HoverCard = {
	Root: HoverCardRoot,
	Trigger: HoverCardTrigger,
	Content: HoverCardContent,
}
