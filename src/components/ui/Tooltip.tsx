'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react'

import { motion, AnimatePresence } from 'motion/react'

type Position = 'top' | 'bottom' | 'left' | 'right'

type TooltipContextValue = {
	open: boolean
	setOpen: (open: boolean) => void
	position: Position
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined)

function TooltipRoot({
	children,
	position = 'top',
	delay = 200,
	closeDelay = 100,
}: {
	children: ReactNode
	position?: Position
	delay?: number
	closeDelay?: number
}) {
	const [open, setOpenState] = useState(false)
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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
			value={{ open, setOpen: handleOpen, position }}
		>
			<div className="relative inline-flex">{children}</div>
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

function TooltipTrigger({ children }: { children: ReactNode }) {
	const { setOpen } = useTooltip()

	return (
		<span
			className="underline"
			onBlur={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onPointerEnter={() => setOpen(true)}
			onPointerLeave={() => setOpen(false)}
			tabIndex={0}
		>
			{children}
		</span>
	)
}

function TooltipContent({ children }: { children: ReactNode }) {
	const { open, position, setOpen } = useTooltip()

	const positionClass = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
	}[position]

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

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
					aria-hidden={!open}
					className={`absolute z-50 ${positionClass}`}
					exit={{ opacity: 0, scale: 0.95, ...motion$ }}
					initial={{ opacity: 0, scale: 0.95, ...motion$ }}
					onPointerEnter={() => setOpen(true)}
					onPointerLeave={() => setOpen(false)}
					role="tooltip"
					transition={{ duration: 0.15 }}
				>
					<div className="pointer-events-auto relative rounded-lg bg-white px-3 py-2 backdrop-blur-md dark:bg-neutral-800">
						<p className="text-sm font-semibold whitespace-nowrap">
							{children}
						</p>
						<span
							className={`absolute h-0 w-0 border-8 ${arrowClass}`}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export const Tooltip = {
	Root: TooltipRoot,
	Trigger: TooltipTrigger,
	Content: TooltipContent,
}
