import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const badgeVariants = cva(
	'flex items-center rounded-full gap-2 px-2.5 py-0.5 text-xs font-semibold ring-[2px] ring-neutral-700',
	{
		variants: {
			variant: {
				primary: 'ring-transparent bg-white dark:bg-neutral-800',
				secondary: 'bg-transparent',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	}
)

export interface IBadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: IBadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

export { Badge, badgeVariants }
