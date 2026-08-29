import { cva } from 'class-variance-authority'

export const linkVariants = cva(
	'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-400 ease-in-out cursor-pointer',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-primary-foreground shadow-md hover:brightness-110',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-muted',
				outline: 'ring-2 ring-primary/40 bg-transparent hover:bg-muted',
				bordered:
					'border-2 border-primary bg-transparent text-primary font-semibold hover:bg-primary/10',
				ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
				shadow: 'bg-card text-card-foreground shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5',
				danger: 'ring-2 ring-destructive text-destructive font-bold shadow-sm hover:bg-destructive/10 hover:shadow-md bg-card',
				none: 'hover:text-foreground',
				default: 'text-muted-foreground hover:text-foreground',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2 text-md',
				lg: 'px-5 py-2.5 text-lg',
				xl: 'px-6 py-3 text-xl',
			},
			loading: {
				true: 'opacity-50 pointer-events-none flex items-center justify-center gap-2 animate-pulse',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	}
)
