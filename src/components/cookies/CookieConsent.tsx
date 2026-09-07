'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useConsentStore } from '@/stores/useConsent.store'
import { Card } from '../ui/Card'

export function CookieConsent() {
	const t = useTranslations('cookies')
	const consent = useConsentStore((s) => s.consent)
	const decide = useConsentStore((s) => s.decide)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted || consent !== null) return null

	return (
		<Card.Root className="fixed right-4 bottom-4 max-w-120">
			<Card.Header>
				<Card.Title className="gap-2 text-xl">
					<Icon icon="lucide:cookie" />
					{t('title')}
				</Card.Title>
			</Card.Header>
			<Card.Content className="flex flex-col gap-4">
				<p className="text-muted-foreground text-sm leading-relaxed">
					{t('description')}{' '}
					<Link
						className="text-primary underline underline-offset-2"
						href="/legal/tos"
					>
						{t('details')}
					</Link>
				</p>
				<div className="flex justify-end gap-3">
					<Button
						className="font-semibold"
						onClick={() => decide('declined')}
						variant="secondary"
					>
						{t('decline')}
					</Button>
					<Button onClick={() => decide('accepted')}>
						{t('accept')}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
