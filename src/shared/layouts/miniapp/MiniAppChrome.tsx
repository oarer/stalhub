'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useMiniApp } from '@/providers/MiniAppProvider'
import AppSidebar from './AppSidebar'
import MobileNavbar from './MobileNavbar'
import { useSidebarStore } from '@/stores/useSidebar.store'

type MiniAppChromeProps = {
	nav: ReactNode
	footer: ReactNode
	children: ReactNode
}

export default function MiniAppChrome({
	nav,
	footer,
	children,
}: MiniAppChromeProps) {
	const { isTelegram } = useMiniApp()
	const collapsed = useSidebarStore((s) => s.collapsed)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!isTelegram) {
		return (
			<>
				{nav}
				<main className="min-h-screen">{children}</main>
				{footer}
			</>
		)
	}

	const isCollapsed = mounted && collapsed

	return (
		<>
			<AppSidebar />
			<MobileNavbar />
			<main
				className={cn(
					'min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] pl-0 transition-[padding] duration-300 ease-in-out sm:pb-0',
					isCollapsed ? 'sm:pl-16' : 'sm:pl-72'
				)}
			>
				{children}
			</main>
		</>
	)
}
