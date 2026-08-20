'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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

		if (pathname.startsWith('/auth/callback')) {
			setUser(null)
			return
		}

		userService
			.getMe()
			.then(setUser)
			.catch(() => setUser(null))

		console.log(
			`%cЧувак, ты думал тут что-то будет?\n` +
				`%cДавай, закрывай девтулс и продолжай пользоваться сайтом`,
			'font-size: 1.5rem; color: #EA9D9E; font-weight: bold;',
			'font-size: 1.2rem; color: #4caf50; font-style: italic;'
		)
	}, [setUser])

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
