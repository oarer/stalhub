import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
	'flex items-center rounded-full gap-2 px-2.5 py-0.5 transition-colors text-xs font-semibold ring-2 ring-neutral-700',
	{
		variants: {
			variant: {
				primary: 'ring-transparent bg-white dark:bg-neutral-800',
				secondary: 'bg-transparent',
				danger: 'ring-red-400 text-red-600 font-bold dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/60 dark:bg-neutral-800/50 bg-white/60',
				success:
					'ring-green-400 text-green-600 font-bold dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/60 dark:bg-neutral-800/50 bg-white/60',
				exbo: 'ring-blue-700 dark:ring-blue-800 text-blue-500 dark:text-blue-200',
				media: 'ring-violet-700 dark:ring-violet-500 text-violet-500 dark:text-violet-300',
				stalhub:
					'ring-border/80 text-border shadow-border/20 shadow-lg',
				nsfw:
					'ring-border/50 bg-border/20 text-border font-bold',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	}
)
