'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { UwuProvider } from '@/providers/uwuProvider'
import { userService } from '@/services/user/user.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { useBanStore } from '@/stores/useBan.store'
import BannedView from '@/views/errors/banned/BannedView'
import QueryProvider from './QueryProvider'

interface Props {
	children: ReactNode
}

export default function Providers({ children }: Props) {
	const [mounted, setMounted] = useState(false)
	const pathname = usePathname()
	const isBanned = useBanStore((s) => s.isBanned)
	const setUser = useAuthStore((s) => s.setUser)

	useEffect(() => {
		setMounted(true)

		if (pathname.startsWith('/auth')) {
			setUser(null)
			return
		}

		const controller = new AbortController()
		let active = true

		userService
			.getMe({ skipAuthRefresh: true, signal: controller.signal })
			.then((user) => {
				if (active) setUser(user)
			})
			.catch(() => {
				if (active && !controller.signal.aborted) setUser(null)
			})

		console.log(
			`%cЧувак, ты думал тут что-то будет?\n` +
				`%cДавай, закрывай девтулс и продолжай пользоваться сайтом`,
			'font-size: 1.5rem; color: #EA9D9E; font-weight: bold;',
			'font-size: 1.2rem; color: #4caf50; font-style: italic;'
		)
		return () => {
			active = false
			controller.abort()
		}
	}, [pathname, setUser])

	if (!mounted) return null

	if (isBanned) {
		return (
			<QueryProvider>
				<UwuProvider>
					<Toaster position="bottom-right" />
					<BannedView />
				</UwuProvider>
			</QueryProvider>
		)
	}

	return (
		<QueryProvider>
			<UwuProvider>
				<Toaster position="bottom-right" />
				{children}
			</UwuProvider>
		</QueryProvider>
	)
}
