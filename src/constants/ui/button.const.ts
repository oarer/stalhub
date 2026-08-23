import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-400 ease-in-out cursor-pointer',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-primary-foreground shadow-md hover:brightness-110 font-semibold',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:brightness-110',
				outline:
					'ring-2 ring-primary/40 bg-transparent hover:bg-muted',
				bordered:
					'border-2 border-primary bg-primary/15 text-primary font-semibold hover:bg-primary/25',
				ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
				shadow: 'bg-card text-card-foreground shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5',
				danger: 'ring-2 ring-destructive text-destructive font-semibold shadow-sm hover:bg-destructive/40 hover:shadow-md bg-card',
				none: 'hover:text-foreground',
			},
			disabled: {
				true: 'cursor-not-allowed text-muted-foreground bg-muted hover:bg-muted hover:bg-muted brightness-80 hover:brightness-80',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2 text-md',
				lg: 'px-5 py-2.5 text-lg',
				xl: 'px-6 py-3 text-xl',
			},
			loading: {
				true: 'cursor-not-allowed hover:brightness-80 brightness-80 flex items-center justify-center',
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
