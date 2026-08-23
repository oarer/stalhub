import { cva } from 'class-variance-authority'

export const alertVariants = cva(
	'relative w-full rounded-lg px-4 py-3 ring-2 text-sm grid grid-cols-[1.25rem_1fr] gap-x-3 gap-y-1 items-start items-center',
	{
		variants: {
			variant: {
				default: 'bg-card ring-primary/50 text-card-foreground',
				info: 'bg-info/10 text-foreground ring-info/30 [--alert-icon:theme(colors.info)]',
				success:
					'bg-success/10 text-foreground ring-success/30 [--alert-icon:theme(colors.success)]',
				warning:
					'bg-warning/10 text-foreground ring-warning/30 [--alert-icon:theme(colors.warning)]',
				destructive:
					'bg-destructive/10 text-foreground ring-destructive/30 [--alert-icon:theme(colors.destructive)]',
			},
		},
		defaultVariants: { variant: 'default' },
	}
)

export const alertIcons = {
	default: 'lucide:info',
	info: 'lucide:info',
	success: 'lucide:circle-check',
	warning: 'lucide:triangle-alert',
	destructive: 'lucide:circle-x',
} as const
