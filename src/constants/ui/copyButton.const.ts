import { cva, type VariantProps } from 'class-variance-authority'

export const copyButtonVariants = cva(
	'relative inline-flex cursor-pointer items-center rounded-lg transition-all duration-400 ease-in-out cursor-pointer',
	{
		variants: {
			variant: {
				primary:
					'ring-2 ring-border-secondary dark:ring-neutral-700 bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-800',
				ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
				none: 'hover:text-neutral-900 dark:hover:text-neutral-400',
			},
			disabled: {
				true: 'cursor-not-allowed text-accent bg-background dark:bg-background hover:bg-background dark:hover:bg-background brightness-50',
			},
			size: {
				md: 'p-3 text-md',
				lg: 'p-4 text-lg',
				xl: 'p-5 text-xl',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
		},
	}
)

export type CopyButtonVariants = VariantProps<typeof copyButtonVariants>
export type CopyButtonVariant = CopyButtonVariants['variant']
