'use client'

import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { UNO_SKELETON_KEYS } from '../utils/uno.const'

export function UnoFeedback({
	isLoading,
	isError,
	onRetry,
	children,
}: {
	isLoading?: boolean
	isError?: boolean
	onRetry?: () => void
	children: React.ReactNode
}) {
	const t = useTranslations('uno')
	if (isLoading) {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{UNO_SKELETON_KEYS.map((key) => (
					<Card.Root className="gap-0 overflow-hidden p-0" key={key}>
						<div className="border-border-secondary/60 border-b px-3 py-2">
							<Skeleton className="h-3 w-20 bg-muted-foreground/15" />
						</div>
						<div className="space-y-2 p-3">
							<Skeleton className="h-4 w-full bg-muted-foreground/15" />
							<Skeleton className="h-4 w-4/5 bg-muted-foreground/15" />
							<Skeleton className="h-4 w-3/5 bg-muted-foreground/15" />
						</div>
					</Card.Root>
				))}
			</div>
		)
	}
	if (isError) {
		return (
			<Alert.Root className="max-w-2xl" variant="destructive">
				<Alert.Title>{t('error.title')}</Alert.Title>
				<Alert.Description className="mt-1 flex flex-wrap items-center gap-3">
					<span>{t('error.description')}</span>
					{onRetry && (
						<Button onClick={onRetry} size="sm" variant="outline">
							{t('retry')}
						</Button>
					)}
				</Alert.Description>
			</Alert.Root>
		)
	}
	return <>{children}</>
}
