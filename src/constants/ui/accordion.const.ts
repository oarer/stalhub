import { cva } from 'class-variance-authority'

export const accordionVariants = cva(
	'w-full border rounded-lg overflow-hidden shadow-sm transition-all duration-200',
	{
		variants: {
			variant: {
				default: 'border-primary bg-card hover:brightness-120',
				warning:
					'border-warning bg-warning/10 text-warning-foreground hover:bg-warning/15',
				danger: 'border-destructive bg-destructive/10 text-destructive-foreground hover:bg-destructive/15',
				success:
					'border-success bg-success/10 text-success-foreground hover:bg-success/15',
				ghost: 'bg-muted/20 hover:brightness-75 border-transparent',
			},
			size: {
				sm: 'text-sm px-2 py-1',
				md: 'text-base px-4 py-3',
				lg: 'text-lg px-6 py-4',
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
				sm: 'w-4 h-4',
				md: 'w-5 h-5',
				lg: 'w-6 h-6',
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
