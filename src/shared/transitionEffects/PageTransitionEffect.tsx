'use client'

import { AnimatePresence, cubicBezier, motion } from 'motion/react'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname } from 'next/navigation'
import { useContext, useRef } from 'react'

function FrozenRouter({ children }: { children: React.ReactNode }) {
	const context = useContext(LayoutRouterContext)
	const frozen = useRef(context).current

	return (
		<LayoutRouterContext.Provider value={frozen}>
			{children}
		</LayoutRouterContext.Provider>
	)
}

const variants = {
	hidden: {
		opacity: 0,
		y: 12,
		scale: 0.992,
		filter: 'blur(6px)',
	},
	enter: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
	},
	exit: {
		opacity: 0,
		y: -12,
		scale: 1.004,
		filter: 'blur(6px)',
	},
}

const transition = {
	duration: 0.7,
	ease: cubicBezier(0.22, 1, 0.36, 1),
}

export default function PageTransitionEffect({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()

	return (
		<div
			style={{
				display: 'grid',
				width: '100%',
				overflow: 'visible',
			}}
		>
			<AnimatePresence mode="sync" initial>
				<motion.div
					key={pathname}
					style={{
						gridArea: '1 / 1',
						position: 'relative',
						width: '100%',
						willChange: 'transform, opacity, filter',
					}}
					variants={variants}
					initial="hidden"
					animate="enter"
					exit="exit"
					transition={transition}
				>
					<FrozenRouter>{children}</FrozenRouter>
				</motion.div>
			</AnimatePresence>
		</div>
	)
}