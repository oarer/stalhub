'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Component, type ReactNode, Suspense } from 'react'
import { MeWidgetGate } from './MeWidgetGate'
import { getWidgetDef } from './registry'
import { WidgetSkeleton } from './WidgetSkeleton'

function WidgetErrorFallback() {
	const t = useTranslations()
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
			<Icon
				className="size-7 text-text-accent"
				icon="lucide:triangle-alert"
			/>
			<p className="font-semibold text-text-accent text-xs">
				{t('dashboard.widgetError')}
			</p>
		</div>
	)
}

class WidgetErrorBoundary extends Component<
	{ children: ReactNode },
	{ hasError: boolean }
> {
	state = { hasError: false }

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	render() {
		if (this.state.hasError) {
			return <WidgetErrorFallback />
		}

		return this.props.children
	}
}

export function WidgetContent({ widgetId }: { widgetId: string }) {
	const def = getWidgetDef(widgetId)
	if (!def) return null

	const content = def.requiresAuth ? (
		<MeWidgetGate>{def.render()}</MeWidgetGate>
	) : (
		def.render()
	)

	return (
		<WidgetErrorBoundary>
			<Suspense fallback={<WidgetSkeleton />}>{content}</Suspense>
		</WidgetErrorBoundary>
	)
}
