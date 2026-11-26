import { cva } from 'class-variance-authority'

export const alertVariants = cva(
	'relative grid w-full grid-cols-[1.25rem_1fr] items-center items-start gap-x-3 gap-y-1 rounded-lg px-4 py-3 text-sm ring-2',
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground ring-0',
				info: 'bg-info/10 text-foreground ring-info/30 [--alert-icon:var(--color-info)]',
				success:
					'bg-success/10 text-foreground ring-success/30 [--alert-icon:var(--color-success)]',
				warning:
					'bg-warning/10 text-foreground ring-warning/30 [--alert-icon:var(--color-warning)]',
				destructive:
					'bg-destructive/10 text-foreground ring-destructive/30 [--alert-icon:var(--color-destructive)]',
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
