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
import { cn } from '@/lib/cn'

type HoverCardContextValue = {
	open: boolean
	setOpen: (v: boolean) => void
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

		const handleEnter = () => {
			clearTimers()
			openTimer.current = window.setTimeout(() => {
				setOpen(true)
			}, openDelay)
		}

		const handleLeave = () => {
			clearTimers()
			closeTimer.current = window.setTimeout(() => {
				setOpen(false)
			}, closeDelay)
		}

		useEffect(() => {
			return () => clearTimers()
		}, [clearTimers])

		return (
			<HoverCardContext.Provider value={{ open, setOpen }}>
				<div
					className={cn('relative inline-block', className)}
					onMouseEnter={handleEnter}
					onMouseLeave={handleLeave}
					ref={ref}
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
				className={cn(!asChild && 'inline-block cursor-pointer', className)}
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

const HoverCardContent = forwardRef<HTMLDivElement, ContentProps>(
	function HoverCardContent(
		{
			className,
			asChild = false,
			side = 'bottom',
			align = 'center',
			sideOffset = 8,
			children,
			...props
		},
		ref
	) {
		const { open } = useHoverCard()
		const id = useId()

		const axis = side === 'top' || side === 'bottom' ? 'y' : 'x'
		const sign = side === 'top' || side === 'left' ? 1 : -1

		const sideStyle: React.CSSProperties =
			side === 'bottom'
				? { top: `calc(100% + ${sideOffset}px)` }
				: side === 'top'
					? { bottom: `calc(100% + ${sideOffset}px)` }
					: side === 'right'
						? { left: `calc(100% + ${sideOffset}px)` }
						: { right: `calc(100% + ${sideOffset}px)` }

		const alignClass =
			side === 'top' || side === 'bottom'
				? align === 'start'
					? 'left-0'
					: align === 'end'
						? 'right-0'
						: 'left-1/2 -translate-x-1/2'
				: align === 'start'
					? 'top-0'
					: align === 'end'
						? 'bottom-0'
						: 'top-1/2 -translate-y-1/2'

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

		const contentProps = {
			...props,
			className: cn(
				'absolute z-50',
				alignClass,
				'w-64 rounded-lg border-2 border-border/60 bg-background p-4 shadow-md',
				className
			),
			id: `hover-card-content-${id}`,
			role: 'dialog',
			style: {
				...sideStyle,
				...props.style,
			},
			ref,
		}

		return (
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
			</AnimatePresence>
		)
	}
)

export const HoverCard = {
	Root: HoverCardRoot,
	Trigger: HoverCardTrigger,
	Content: HoverCardContent,
}
