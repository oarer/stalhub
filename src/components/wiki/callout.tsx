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
		className:
			'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300',
		defaultTitle: 'Info',
	},
	warning: {
		icon: 'lucide:alert-triangle',
		className:
			'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
		defaultTitle: 'Warning',
	},
	tip: {
		icon: 'lucide:lightbulb',
		className:
			'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300',
		defaultTitle: 'Tip',
	},
	danger: {
		icon: 'lucide:alert-circle',
		className:
			'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300',
		defaultTitle: 'Danger',
	},
	success: {
		icon: 'lucide:check-circle',
		className:
			'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300',
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
