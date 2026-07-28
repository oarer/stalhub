import { cva } from 'class-variance-authority'

export const switchTrackVariants = cva(
	'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'h-5 w-9',
				md: 'h-6 w-11',
				lg: 'h-7 w-14',
			},
			variant: {
				default: 'bg-neutral-300 data-[checked=true]:bg-border/40 dark:bg-neutral-700',
				outline:
					'border-neutral-300 bg-transparent data-[checked=true]:border-sky-500 dark:border-neutral-600 dark:data-[checked=true]:border-sky-500',
			},
		},
		defaultVariants: {
			size: 'md',
			variant: 'default',
		},
	}
)

export const switchThumbVariants = cva(
	'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
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
