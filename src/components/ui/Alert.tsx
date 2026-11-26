import { Icon } from '@iconify/react'
import type { VariantProps } from 'class-variance-authority'
import { alertIcons, alertVariants } from '@/constants/ui/alert.const'
import { cn } from '@/lib/cn'

export interface AlertProps
	extends React.ComponentProps<'div'>,
		VariantProps<typeof alertVariants> {
	icon?: string | false
	dismissible?: boolean
	onDismiss?: () => void
}

function AlertRoot({
	className,
	variant = 'default',
	icon,
	dismissible,
	onDismiss,
	children,
	...props
}: AlertProps) {
	const resolvedVariant = variant ?? 'default'
	const defaultIcon = alertIcons[resolvedVariant]
	const resolvedIcon = icon === false ? null : (icon ?? defaultIcon)

	return (
		<div
			className={cn(
				alertVariants({ variant: resolvedVariant }),
				className
			)}
			data-slot="alert"
			role="alert"
			{...props}
		>
			{resolvedIcon ? (
				<Icon
					aria-hidden="true"
					className="text-xl text-(--alert-icon)"
					icon={resolvedIcon}
				/>
			) : (
				<span aria-hidden="true" />
			)}

			<div className="min-w-0">{children}</div>

			{dismissible && (
				<button
					aria-label="Dismiss alert"
					className="focus-visible:outline-ring absolute top-2.5 right-2.5 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline"
					onClick={onDismiss}
					type="button"
				>
					<Icon
						aria-hidden="true"
						className="size-4"
						icon="lucide:x"
					/>
				</button>
			)}
		</div>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			className={cn('text-[15px] leading-5 font-medium', className)}
			data-slot="alert-title"
			{...props}
		/>
	)
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('text-[13px] font-medium opacity-90', className)}
			data-slot="alert-description"
			{...props}
		/>
	)
}

export const Alert = {
	Root: AlertRoot,
	Title: AlertTitle,
	Description: AlertDescription,
}
