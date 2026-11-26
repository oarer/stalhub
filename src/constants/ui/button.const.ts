import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
	'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-400 ease-in-out',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-primary-foreground hover:text-primary ring-2 hover:bg-transparent',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:brightness-110',
				outline: 'ring-primary/40 hover:bg-muted bg-transparent ring-2',
				bordered:
					'border-primary bg-primary/15 text-primary hover:bg-primary/25 border-2 font-medium',
				ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground bg-transparent',
				shadow: 'bg-card text-card-foreground shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.3)]',
				danger: 'ring-destructive text-destructive hover:bg-destructive/40 bg-card font-medium shadow-sm ring-2 hover:shadow-md',
				none: 'hover:text-foreground',
			},
			disabled: {
				true: 'text-muted-foreground bg-muted hover:bg-muted hover:bg-muted cursor-not-allowed brightness-80 hover:brightness-80',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'text-md px-4 py-2',
				lg: 'px-5 py-2.5 text-lg',
				xl: 'px-6 py-3 text-xl',
			},
			loading: {
				true: 'flex cursor-not-allowed items-center justify-center brightness-80 hover:brightness-80',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
		},
	}
)

type ButtonVariants = VariantProps<typeof buttonVariants>
export type ButtonVariant = ButtonVariants['variant']
