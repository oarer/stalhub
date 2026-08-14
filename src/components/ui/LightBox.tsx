'use client'

import { Icon } from '@iconify/react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'motion/react'
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { Button, type buttonVariants } from './Button'

interface LightBoxContextType {
	isOpen: boolean
	open: () => void
	close: () => void
}

const LightBoxContext = createContext<LightBoxContextType | null>(null)

function useLightBox() {
	const ctx = useContext(LightBoxContext)
	if (!ctx)
		throw new Error(
			'LightBox components must be used inside <LightBox.Root>'
		)
	return ctx
}

interface RootProps {
	children: ReactNode
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function LightBoxRoot({
	children,
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
}: RootProps) {
	const [isOpen, setIsOpen] = useState<boolean>(
		typeof controlledOpen === 'boolean' ? controlledOpen : !!defaultOpen
	)

	useEffect(() => {
		if (typeof controlledOpen === 'boolean') {
			setIsOpen(controlledOpen)
		}
	}, [controlledOpen])

	// biome-ignore lint: useExhaustiveDependencies
	useEffect(() => {
		onOpenChange?.(isOpen)
	}, [isOpen])

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => setIsOpen(false), [])

	return (
		<LightBoxContext.Provider value={{ isOpen, open, close }}>
			{children}
		</LightBoxContext.Provider>
	)
}

interface TriggerProps {
	children: ReactNode
	className?: string
	variant?: VariantProps<typeof buttonVariants>['variant']
	asChild?: boolean
}

export function LightBoxTrigger({
	children,
	className,
	variant = 'outline',
	asChild = false,
}: TriggerProps) {
	const { open } = useLightBox()
	const Comp = asChild ? Slot : Button

	return (
		<Comp
			className={cn('cursor-pointer font-semibold', className)}
			onClick={open}
			variant={variant}
		>
			{children}
		</Comp>
	)
}

interface ContentProps {
	src: string
	alt?: string
	className?: string
	zoom?: boolean
	closeOnBackdrop?: boolean
}

export function LightBoxContent({
	src,
	alt = '',
	className,
	zoom = true,
	closeOnBackdrop = true,
}: ContentProps) {
	const { isOpen, close } = useLightBox()
	const [scale, setScale] = useState(1)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const dragging = useRef(false)
	const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })

	const reset = () => {
		setScale(1)
		setPosition({ x: 0, y: 0 })
	}

	useEffect(() => {
		if (!isOpen) return
		setScale(1)
		setPosition({ x: 0, y: 0 })
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
			if (e.key === '+' || e.key === '=')
				setScale((s) => Math.min(4, s + 0.25))
			if (e.key === '-' || e.key === '_')
				setScale((s) => Math.max(1, s - 0.25))
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [isOpen, close])

	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [isOpen])

	if (typeof document === 'undefined') return null

	const onWheel = (e: React.WheelEvent) => {
		if (!zoom) return
		e.preventDefault()
		setScale((s) => Math.min(4, Math.max(1, s - e.deltaY * 0.001)))
	}

	const onPointerDown = (e: React.PointerEvent) => {
		if (scale <= 1) return
		dragging.current = true
		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
			px: position.x,
			py: position.y,
		}
		e.currentTarget.setPointerCapture(e.pointerId)
	}

	const onPointerMove = (e: React.PointerEvent) => {
		if (!dragging.current) return
		setPosition({
			x: dragStart.current.px + e.clientX - dragStart.current.x,
			y: dragStart.current.py + e.clientY - dragStart.current.y,
		})
	}

	const onPointerUp = () => {
		dragging.current = false
	}

	const onDoubleClick = () => {
		if (scale > 1) {
			reset()
		} else {
			setScale(2)
		}
	}

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					animate={{ opacity: 1 }}
					aria-modal="true"
					className="fixed inset-0 z-9999999 flex cursor-zoom-in items-center justify-center bg-black/80 backdrop-blur-sm"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					onClick={(e) => {
						if (closeOnBackdrop && e.target === e.currentTarget)
							close()
					}}
					onDoubleClick={onDoubleClick}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onWheel={onWheel}
					role="dialog"
					transition={{ duration: 0.18 }}
				>
					<motion.div
						animate={{ scale, x: position.x, y: position.y }}
						className={cn(
							'relative z-10 max-h-[90dvh] max-w-[90dvw] overflow-hidden rounded-lg',
							className
						)}
						drag={scale > 1}
						dragConstraints={{
							left: -500,
							right: 500,
							top: -500,
							bottom: 500,
						}}
						dragTransition={{ power: 0.3, timeConstant: 200 }}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 30,
						}}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							alt={alt}
							className="block max-h-[90dvh] max-w-[90dvw] select-none object-contain"
							draggable={false}
							src={src}
						/>
					</motion.div>

					<Button
						aria-label="Close lightbox"
						className="absolute top-4 right-4 flex cursor-pointer items-center justify-center rounded-full bg-black/40 p-2.5 backdrop-blur-sm"
						onClick={close}
						variant="ghost"
					>
						<Icon className="text-white text-xl" icon="lucide:x" />
					</Button>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}

export const LightBox = {
	Root: LightBoxRoot,
	Trigger: LightBoxTrigger,
	Content: LightBoxContent,
}
