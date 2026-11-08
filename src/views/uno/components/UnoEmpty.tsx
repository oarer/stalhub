'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'

export function UnoEmpty({ children }: { children?: React.ReactNode }) {
	const t = useTranslations('uno')
	return (
		<Card.Root className="items-center justify-center py-12 text-center">
			<Icon className="mb-3 text-3xl text-primary" icon="lucide:radar" />
			<p className="font-semibold text-lg">{t('empty.title')}</p>
			<p className="mt-1 max-w-md text-muted-foreground text-sm">
				{children ?? t('empty.description')}
			</p>
		</Card.Root>
	)
}
