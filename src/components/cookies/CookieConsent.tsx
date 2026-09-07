'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '../ui/Card'

const CONSENT_KEY = 'cookie-consent'
const UMAMI_DISABLED_KEY = 'umami.disabled'

type Consent = 'accepted' | 'declined' | null

function getConsent(): Consent {
	if (typeof window === 'undefined') return null

	const value = localStorage.getItem(CONSENT_KEY)

	return value === 'accepted' || value === 'declined' ? value : null
}

export function CookieConsent() {
	const t = useTranslations('cookies')
	const [consent, setConsent] = useState<Consent>(null)

	useEffect(() => {
		setConsent(getConsent())
	}, [])

	const decide = (choice: Exclude<Consent, null>) => {
		if (choice === 'declined') {
			localStorage.setItem(UMAMI_DISABLED_KEY, '1')
		} else {
			localStorage.removeItem(UMAMI_DISABLED_KEY)
		}

		localStorage.setItem(CONSENT_KEY, choice)
		setConsent(choice)
	}

	if (consent !== null) return null

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
