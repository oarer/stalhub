import { cva } from 'class-variance-authority'

export const checkboxVariants = cva(
	'relative flex shrink-0 items-center justify-center rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
	{
		variants: {
			size: {
				xs: 'h-3 w-3',
				sm: 'h-4 w-4',
				md: 'h-5 w-5',
				lg: 'h-6 w-6',
			},
			variant: {
				default: 'hover:border-primary/50',
				outline: 'hover:bg-border/10',
			},
		},
		defaultVariants: {
			size: 'md',
			variant: 'default',
		},
	}
)
