import { cva } from 'class-variance-authority'

export const switchTrackVariants = cva(
	'focus-visible:ring-ring relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'h-5 w-9',
				md: 'h-6 w-11',
				lg: 'h-7 w-14',
			},
			variant: {
				default: 'bg-muted data-[checked=true]:bg-primary/40',
				outline:
					'border-muted data-[checked=true]:border-primary bg-transparent',
			},
		},
		defaultVariants: {
			size: 'md',
			variant: 'default',
		},
	}
)

export const switchThumbVariants = cva(
	'bg-foreground pointer-events-none block rounded-full shadow-lg ring-0 transition-transform',
	{
		variants: {
			size: {
				sm: 'h-3.5 w-3.5',
				md: 'h-4.5 w-4.5',
				lg: 'h-5.5 w-5.5',
			},
		},
		defaultVariants: {
			size: 'md',
		},
	}
)
