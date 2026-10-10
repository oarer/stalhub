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
					className="text-(--alert-icon) text-xl"
					icon={resolvedIcon}
				/>
			) : (
				<span aria-hidden="true" />
			)}

			<div className="min-w-0">{children}</div>

			{dismissible && (
				<button
					aria-label="Dismiss alert"
					className="absolute top-2.5 right-2.5 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-ring"
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
			className={cn('font-medium text-[15px] leading-5', className)}
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
			className={cn('font-medium text-[13px] opacity-90', className)}
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
