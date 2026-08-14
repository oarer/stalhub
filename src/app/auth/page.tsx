'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { discordAuthService } from '@/services/auth/discord/discord.service'
import { exboAuthService } from '@/services/auth/exbo/auth.service'
import { telegramAuthService } from '@/services/auth/telegram/telegram.service'
import { montserrat, unbounded } from '../fonts'

type Provider = 'discord' | 'telegram' | 'exbo'

export default function Page() {
	const [loading, setLoading] = useState<Provider | null>(null)
	const router = useRouter()
	const t = useTranslations()

	const handleLogin = async (provider: Provider) => {
		setLoading(provider)
		try {
			const services = {
				discord: discordAuthService,
				telegram: telegramAuthService,
				exbo: exboAuthService,
			}
			const url = await services[provider].getLoginUrl()
			router.push(url)
		} catch {
			setLoading(null)
		}
	}

	return (
		<section className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-3">
			<Card.Root className="w-full">
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:log-in" />
						<h1
							className={`${unbounded.className} font-bold text-[16px] uppercase tracking-widest`}
						>
							{t('auth.title')}
						</h1>
					</Card.Title>
				</Card.Header>
				<Card.Content className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Button
						className="gap-2"
						disabled={loading === 'discord'}
						onClick={() => handleLogin('discord')}
						variant={'secondary'}
					>
						<Image
							alt="discord auth"
							height={20}
							src="/images/other/discord.png"
							width={20}
						/>
						<p className="font-semibold">Discord</p>
					</Button>
					<Button
						className="gap-2"
						loading={loading === 'telegram'}
						onClick={() => handleLogin('telegram')}
						variant={'secondary'}
					>
						<Image
							alt="telegram auth"
							height={20}
							src="/images/other/telegram.png"
							width={20}
						/>
						<p className="font-semibold">Telegram</p>
					</Button>
					<Button
						className="gap-2 bg-purple-600 ring-2 ring-purple-900 md:col-span-2 dark:bg-purple-700/40 dark:ring-purple-700"
						loading={loading === 'exbo'}
						onClick={() => handleLogin('exbo')}
					>
						<Image
							alt="exbo auth"
							height={20}
							src="/images/other/exbo.png"
							width={20}
						/>
						<p className="font-semibold">EXBO</p>
					</Button>
				</Card.Content>
				<p
					className={`${montserrat.className} font-semibold text-sm text-text-accent`}
				>
					{t('auth.terms')}{' '}
					<Link
						className="underline underline-offset-2"
						href="/wiki/legal/tos"
					>
						{t('auth.termsLink')}
					</Link>
				</p>
			</Card.Root>
			<Alert.Root variant={'info'}>
				<Alert.Title>{t('auth.recommendationTitle')}</Alert.Title>
				<Alert.Description>
					{t('auth.recommendationDesc')}
				</Alert.Description>
			</Alert.Root>
		</section>
	)
}
