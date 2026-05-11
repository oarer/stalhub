import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-400 ease-in-out cursor-pointer',
	{
		variants: {
			variant: {
				primary:
					'bg-sky-400 text-white dark:bg-sky-600/70 shadow-md hover:bg-sky-500 dark:hover:opacity-100',
				secondary:
					'bg-white/60 text-neutral-900 dark:bg-neutral-800/50 dark:text-neutral-100 shadow-sm hover:bg-neutral-300 dark:hover:bg-neutral-800',
				outline:
					'ring-2 ring-border-secondary dark:ring-neutral-700 bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-800 bg-neutral-100 dark:bg-neutral-950',
				bordered:
					'border border-sky-400 dark:border-border/50 border-2 bg-sky-200 dark:bg-sky-900 text-sky-600 font-semibold hover:bg-sky-50 dark:hover:bg-sky-800 dark:text-sky-200',
				ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
				shadow: 'bg-white dark:bg-neutral-900 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5',
				danger: 'ring-2 ring-red-400 text-red-600 font-bold dark:text-red-200 shadow-sm hover:bg-red-200 dark:hover:bg-red-700 hover:shadow-md dark:bg-neutral-800/50 bg-white/60',
				none: 'hover:text-neutral-900 dark:hover:text-neutral-400',
			},
			disabled: {
				true: 'cursor-not-allowed text-accent bg-background dark:bg-background hover:bg-background dark:hover:bg-background brightness-50',
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
			variant: 'primary',
			size: 'md',
		},
	}
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
export type ButtonVariant = ButtonVariants['variant']
