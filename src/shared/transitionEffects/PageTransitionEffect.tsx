'use client'

import { useContext, useRef } from 'react'

import { motion, AnimatePresence, easeOut } from 'motion/react'
import { usePathname } from 'next/navigation'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

function FrozenRouter({ children }: { children: React.ReactNode }) {
	const context = useContext(LayoutRouterContext ?? null)
	const frozen = useRef(context).current

	return (
		<LayoutRouterContext.Provider value={frozen}>
			{children}
		</LayoutRouterContext.Provider>
	)
}

const variants = {
	hidden: { opacity: 0, y: -30 },
	enter: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 30 },
}

const PageTransitionEffect = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname()
	const isDashboardPage =
		pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
	const key = isDashboardPage ? 'dashboard' : pathname

	const animationProps = !isDashboardPage
		? {
				initial: 'hidden',
				animate: 'enter',
				exit: 'exit',
				variants: variants,
				transition: {
					opacity: { duration: 0.8, delay: 0.1, ease: easeOut },
					y: { duration: 1.0, delay: 0.1, ease: easeOut },
				},
			}
		: {
				initial: 'hidden',
				animate: 'enter',
				exit: 'exit',
				variants: variants,
				transition: {
					opacity: { duration: 0.8, delay: 0.1, ease: easeOut },
					y: { duration: 1.0, delay: 0.1, ease: easeOut },
				},
			}

	return (
		<AnimatePresence mode="popLayout">
			<motion.div
				key={key}
				style={{ position: 'relative', width: '100%', height: '100%' }}
				{...animationProps}
			>
				{!isDashboardPage ? (
					<FrozenRouter>{children}</FrozenRouter>
				) : (
					children
				)}
			</motion.div>
		</AnimatePresence>
	)
}

export default PageTransitionEffect
