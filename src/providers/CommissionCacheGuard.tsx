'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuth.store'

export default function CommissionCacheGuard() {
	const client = useQueryClient()
	useEffect(
		() =>
			useAuthStore.subscribe((next, previous) => {
				const id = previous.user?.id
				if (id && id !== next.user?.id) {
					void client.cancelQueries({ queryKey: ['commissions', id] })
					client.removeQueries({ queryKey: ['commissions', id] })
				}
			}),
		[client]
	)
	return null
}
