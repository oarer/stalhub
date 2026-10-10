'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { cn } from '@/lib/cn'

interface SwapTextProps {
	texts: string[]
	className?: string
	barClassName?: string
	interval?: number
}

const container = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.035 } },
	exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
} as const

const letter = {
	hidden: { y: '110%', opacity: 0, filter: 'blur(4px)' },
	visible: {
		y: '0%',
		opacity: 1,
		filter: 'blur(0px)',
		transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
	},
	exit: {
		y: '-110%',
		opacity: 0,
		filter: 'blur(4px)',
		transition: { duration: 0.3, ease: 'easeIn' as const },
	},
} as const

export default function SwapText({
	texts,
	className,
	barClassName,
	interval = 2500,
}: SwapTextProps) {
	const [index, setIndex] = useState(0)
	const [widths, setWidths] = useState<number[]>([])
	const measureRefs = useRef<(HTMLSpanElement | null)[]>([])
	const measureBoxRef = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		if (texts.length <= 1) return
		const id = setInterval(() => {
			setIndex((prev) => (prev + 1) % texts.length)
		}, interval)
		return () => clearInterval(id)
	}, [texts.length, interval])

	useEffect(() => {
		setIndex(0)
	}, [])

	const measureAll = useCallback(() => {
		setWidths((prev) => {
			const next = texts.map(
				(_, i) => measureRefs.current[i]?.offsetWidth ?? 0
			)
			return prev.length === next.length &&
				prev.every((w, i) => w === next[i])
				? prev
				: next
		})
	}, [texts])

	useLayoutEffect(() => {
		measureAll()
	}, [measureAll])

	useEffect(() => {
		measureAll()
		document.fonts?.ready
			.then(() => measureAll())
			.catch(() => {
				// fonts API is optional, layout is already measured
			})
		const box = measureBoxRef.current
		if (!box) return
		const ro = new ResizeObserver(() => measureAll())
		ro.observe(box)
		return () => ro.disconnect()
	}, [measureAll])

	if (texts.length === 0) return null

	return (
		<span
			className={cn(
				'relative inline-flex flex-col pb-[0.12em]',
				className
			)}
		>
			<AnimatePresence initial={false} mode="wait">
				<motion.span
					animate="visible"
					className="inline-flex will-change-transform"
					exit="exit"
					initial="hidden"
					key={texts[index]}
					variants={container}
				>
					{texts[index].split('').map((char, i) => (
						<span
							className="mb-[-0.08em] inline-block pb-[0.08em] align-bottom italic"
							key={`${texts[index]}-${i}`}
						>
							<motion.span
								className="inline-block will-change-transform"
								variants={letter}
							>
								{char === ' ' ? '\u00A0' : char}
							</motion.span>
						</span>
					))}
				</motion.span>
			</AnimatePresence>
			<motion.span
				animate={{ width: widths[index] ?? '100%' }}
				aria-hidden
				className={cn(
					'mt-[0.12em] h-[0.07em] min-h-0.75 origin-left rounded-full bg-current',
					barClassName
				)}
				initial={false}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			/>
			<span
				aria-hidden
				className="pointer-events-none absolute top-0 left-0 flex whitespace-nowrap opacity-0"
				ref={measureBoxRef}
			>
				{texts.map((word, i) => (
					<span
						className="inline-block"
						key={word}
						ref={(el) => {
							measureRefs.current[i] = el
						}}
					>
						{word}
					</span>
				))}
			</span>
		</span>
	)
}
