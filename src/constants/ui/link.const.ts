import { cva } from 'class-variance-authority'

export const linkVariants = cva(
	'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-400 ease-in-out',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-primary-foreground hover:text-primary border-2 hover:bg-transparent',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-muted shadow-sm',
				outline: 'ring-primary/40 hover:bg-muted bg-transparent ring-2',
				bordered:
					'border-primary text-primary hover:bg-primary/10 border-2 bg-transparent',
				ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground bg-transparent',
				shadow: 'bg-card text-card-foreground shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.3)]',
				danger: 'ring-destructive text-destructive hover:bg-destructive/10 bg-card shadow-sm ring-2 hover:shadow-md',
				none: 'hover:text-foreground',
				default: 'text-muted-foreground hover:text-foreground',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'text-md px-4 py-2',
				lg: 'px-5 py-2.5 text-lg',
				xl: 'px-6 py-3 text-xl',
			},
			loading: {
				true: 'pointer-events-none flex animate-pulse items-center justify-center gap-2 opacity-50',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	}
)
