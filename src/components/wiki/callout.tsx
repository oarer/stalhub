'use client'

import { Icon } from '@iconify/react'
import { cn } from '@/lib/cn'

type CalloutType = 'info' | 'warning' | 'danger' | 'success' | 'tip'

interface CalloutProps {
	type?: CalloutType
	title?: string
	children: React.ReactNode
}

const calloutConfig: Record<
	CalloutType,
	{ icon: string; className: string; defaultTitle: string }
> = {
	info: {
		icon: 'lucide:info',
		className: 'border-info/50 bg-info/10 text-info',
		defaultTitle: 'Info',
	},
	warning: {
		icon: 'lucide:alert-triangle',
		className: 'border-warning/50 bg-warning/10 text-warning',
		defaultTitle: 'Warning',
	},
	tip: {
		icon: 'lucide:lightbulb',
		className: 'border-success/50 bg-success/10 text-success',
		defaultTitle: 'Tip',
	},
	danger: {
		icon: 'lucide:alert-circle',
		className: 'border-destructive/50 bg-destructive/10 text-destructive',
		defaultTitle: 'Danger',
	},
	success: {
		icon: 'lucide:check-circle',
		className: 'border-success/50 bg-success/10 text-success',
		defaultTitle: 'Success',
	},
}

export const Callout = ({ type = 'info', title, children }: CalloutProps) => {
	const config = calloutConfig[type]

	return (
		<div className={cn('my-6 rounded-lg border-l-4 p-4', config.className)}>
			<div className="mb-2 flex items-center gap-2 font-semibold">
				<Icon className="h-5 w-5" icon={config.icon} />
				<span>{title ?? config.defaultTitle}</span>
			</div>
			<div className="text-sm opacity-90 [&>p]:m-0">{children}</div>
		</div>
	)
}
