import { cva } from 'class-variance-authority'

export const alertVariants = cva(
	'relative w-full rounded-lg px-4 py-3 ring-2 text-sm grid grid-cols-[1.25rem_1fr] gap-x-3 gap-y-1 items-start items-center',
	{
		variants: {
			variant: {
				default: 'bg-background ring-border/50',
				info: 'bg-blue-50 text-blue-900 ring-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:ring-blue-800 [--alert-icon:theme(colors.blue.500)]',
				success:
					'bg-green-50 text-green-900 ring-green-200 dark:bg-green-950/40 dark:text-green-200 dark:ring-green-800 [--alert-icon:theme(colors.green.500)]',
				warning:
					'bg-yellow-100 text-yellow-950 ring-yellow-400 dark:bg-yellow-950/40 dark:text-yellow-200 dark:ring-yellow-900/80 [--alert-icon:theme(colors.yellow.500)]',
				destructive:
					'bg-red-50 text-red-900 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800 [--alert-icon:theme(colors.red.500)]',
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

export type AlertVariant = keyof typeof alertIcons
