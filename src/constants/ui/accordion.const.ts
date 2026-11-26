import { cva } from 'class-variance-authority'

export const accordionVariants = cva(
	'w-full overflow-hidden rounded-lg border shadow-sm transition-all duration-200',
	{
		variants: {
			variant: {
				default: 'border-primary/50 bg-muted hover:brightness-120',
				warning:
					'border-warning bg-warning/10 text-warning-foreground hover:bg-warning/15',
				danger: 'border-destructive bg-destructive/10 text-destructive-foreground hover:bg-destructive/15',
				success:
					'border-success bg-success/10 text-success-foreground hover:bg-success/15',
				ghost: 'bg-muted/20 border-transparent',
			},
			size: {
				sm: 'px-2 py-1 text-sm',
				md: 'px-4 py-3 text-base',
				lg: 'px-6 py-4 text-lg',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	}
)

export const accordionIndicatorVariants = cva(
	'transition-transform duration-300',
	{
		variants: {
			variant: {
				default: 'text-foreground',
				warning: 'text-warning',
				danger: 'text-destructive',
				success: 'text-success',
				ghost: '',
			},
			size: {
				sm: 'h-4 w-4',
				md: 'h-5 w-5',
				lg: 'h-6 w-6',
			},
			rotated: {
				true: 'rotate-180',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	}
)
