'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { unbounded } from '@/app/fonts'
import { toast } from '@/components/ui/Toast'
import { discordAuthService } from '@/services/auth/discord/discord.service'
import { exboAuthService } from '@/services/auth/exbo/auth.service'
import { telegramAuthService } from '@/services/auth/telegram/telegram.service'

type Provider = 'discord' | 'telegram' | 'exbo'

export default function CallbackPage() {
	const router = useRouter()
	const params = useParams()
	const searchParams = useSearchParams()
	const t = useTranslations()

	const called = useRef(false)

	useEffect(() => {
		if (called.current) return
		called.current = true

		const provider = params.provider as Provider
		const code = searchParams.get('code')
		const state = searchParams.get('state')

		if (!provider || !code) {
			router.replace('/auth')
			return
		}

		const handle = async () => {
			switch (provider) {
				case 'discord':
					await discordAuthService.handleCallback(
						code,
						state ?? undefined
					)
					break
				case 'telegram':
				case 'exbo':
					if (!state) {
						toast.error(t('auth.error'), { id: 'auth-error' })
						return
					}
					await (provider === 'telegram'
						? telegramAuthService
						: exboAuthService
					).handleCallback(code, state)
					break
			}
			await new Promise((r) => setTimeout(r, 100))
			router.replace('/me/onboarding')
		}

		handle().catch(() => {
			toast.error(t('auth.error'), { id: 'auth-error' })
		})
	}, [router, params, searchParams, t])

	return (
		<section className="mx-auto flex min-h-screen items-center justify-center gap-4 px-3">
			<h1
				className={`${unbounded.className} animate-pulse font-bold text-2xl uppercase tracking-widest`}
			>
				{t('auth.title')}
			</h1>
		</section>
	)
}
