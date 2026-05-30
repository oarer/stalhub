import { Icon } from '@iconify/react'
import { toast as sonnerToast } from 'sonner'

import { cn } from '@/lib/cn'

type ToastType = 'success' | 'error' | 'info' | 'loading'

type ToastOptions = {
	duration?: number
	id?: string
	showClose?: boolean
}

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

const showToast = (
	message: string,
	type: ToastType,
	options?: ToastOptions
) => {
	const showCloseButton = options?.showClose !== false && type !== 'loading'

	return sonnerToast.custom(
		(id) => (
			<div
				className={cn(
					'flex w-full max-w-91 rounded-xl px-3 py-2 shadow-md ring-2 transition-all',
					toastStyles[type]
				)}
			>
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<div className="shrink-0 text-lg">{icons[type]}</div>

					<p className="wrap-break-word min-w-0 font-semibold text-gray-900 text-sm dark:text-gray-100">
						{message}
					</p>
				</div>

				{showCloseButton && (
					<button
						className="ml-4 shrink-0 cursor-pointer rounded-md font-medium text-neutral-500 text-sm hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
						onClick={() => sonnerToast.dismiss(id)}
						type="button"
					>
						<Icon className="text-lg" icon="lucide:x" />
					</button>
				)}
			</div>
		),
		{
			id: options?.id,
			duration: options?.duration ?? 3000,
		}
	)
}

export const toast = {
	success: (message: string, options?: ToastOptions) =>
		showToast(message, 'success', options),

	error: (message: string, options?: ToastOptions) =>
		showToast(message, 'error', options),

	info: (message: string, options?: ToastOptions) =>
		showToast(message, 'info', options),

	loading: (message: string, options?: ToastOptions) =>
		showToast(message, 'loading', options),

	dismiss: (id?: string | number) => sonnerToast.dismiss(id),
}
