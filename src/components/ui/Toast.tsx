import { Icon } from '@iconify/react'
import { toast } from 'sonner'

import { cn } from '@/lib/cn'

type ToastType = 'success' | 'error' | 'info' | 'loading'

const icons = {
	success: (
		<Icon
			className="text-green-500 dark:text-green-400"
			icon="lucide:circle-check"
		/>
	),
	error: (
		<Icon
			className="text-red-500 dark:text-red-400"
			icon="lucide:circle-x"
		/>
	),
	info: (
		<Icon className="text-blue-500 dark:text-blue-400" icon="lucide:info" />
	),
	loading: (
		<Icon
			className="animate-spin text-blue-500 dark:text-blue-400"
			icon="lucide:loader-circle"
		/>
	),
}

const toastStyles: Record<ToastType, string> = {
	success: cn(
		'bg-green-200 text-green-800 ring-green-300',
		'dark:bg-green-950 dark:text-green-200 dark:ring-green-500/40'
	),
	error: cn(
		'bg-red-200 text-red-800 ring-red-300',
		'dark:bg-red-950 dark:text-red-200 dark:ring-red-500/40'
	),
	info: cn(
		'bg-blue-200 text-blue-800 ring-blue-300',
		'dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-500/40'
	),
	loading: cn(
		'bg-neutral-200 text-neutral-800 ring-neutral-300',
		'dark:bg-neutral-950 dark:text-neutral-200 dark:ring-neutral-500/40'
	),
}

export function CustomToast(
	message: string,
	type: ToastType = 'info',
	duration: number = 3000
) {
	toast.custom(
		(id) => (
			<div
				className={cn(
					'flex w-full max-w-91 rounded-xl px-3 py-2 shadow-md ring-2 transition-all',
					toastStyles[type]
				)}
			>
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<div className="shrink-0 text-lg">{icons[type]}</div>
					<p className="wrap-break-wor min-w-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
						{message}
					</p>
				</div>

				{type !== 'loading' && (
					<button
						className="ml-4 shrink-0 cursor-pointer rounded-md text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
						onClick={() => toast.dismiss(id)}
					>
						<Icon className="text-lg" icon="lucide:x" />
					</button>
				)}
			</div>
		),
		{ duration }
	)
}
