import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
	'ring-muted flex w-fit items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium ring-2 transition-colors',
	{
		variants: {
			variant: {
				primary: 'bg-muted text-card-foreground ring-transparent',
				secondary: 'bg-card text-muted-foreground',
				danger: 'ring-destructive text-destructive hover:bg-destructive/10 bg-card font-semibold',
				success:
					'ring-success text-success hover:bg-success/10 bg-card font-semibold',
				exbo: 'ring-info text-info',
				media: 'text-[oklch(65%_0.22_300)] ring-[oklch(55%_0.22_300)]',
				stalhub:
					'ring-primary/80 text-primary shadow-border/20 shadow-lg',
				nsfw: 'ring-primary/50 bg-border/20 text-primary font-semibold',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	}
)
