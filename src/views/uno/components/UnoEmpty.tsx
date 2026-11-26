'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'

export function UnoEmpty({ children }: { children?: React.ReactNode }) {
	const t = useTranslations('uno')
	return (
		<Card.Root className="items-center justify-center py-12 text-center">
			<Icon className="text-primary mb-3 text-3xl" icon="lucide:radar" />
			<p className="text-lg font-semibold">{t('empty.title')}</p>
			<p className="text-muted-foreground mt-1 max-w-md text-sm">
				{children ?? t('empty.description')}
			</p>
		</Card.Root>
	)
}
