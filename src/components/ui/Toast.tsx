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
	success: <Icon className="text-success" icon="lucide:circle-check" />,
	error: <Icon className="text-destructive" icon="lucide:circle-x" />,
	info: <Icon className="text-info" icon="lucide:info" />,
	loading: (
		<Icon className="animate-spin text-info" icon="lucide:loader-circle" />
	),
}

const toastStyles: Record<ToastType, string> = {
	success: 'bg-success/15 text-success ring-success/30',
	error: 'bg-destructive/15 text-destructive ring-destructive/30',
	info: 'bg-info/15 text-info ring-info/30',
	loading: 'bg-muted text-muted-foreground ring-primary',
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

					<p className="wrap-break-word min-w-0 font-semibold text-card-foreground text-sm">
						{message}
					</p>
				</div>

				{showCloseButton && (
					<button
						className="ml-4 shrink-0 cursor-pointer rounded-md font-medium text-muted-foreground text-sm hover:text-foreground"
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
