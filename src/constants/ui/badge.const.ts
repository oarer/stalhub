import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
	'flex items-center rounded-full gap-2 px-2.5 py-0.5 transition-colors text-xs font-semibold ring-2 ring-muted',
	{
		variants: {
			variant: {
				primary: 'ring-transparent bg-muted text-card-foreground',
				secondary: 'bg-card text-muted-foreground',
				danger: 'ring-destructive text-destructive font-bold hover:bg-destructive/10 bg-card',
				success:
					'ring-success text-success font-bold hover:bg-success/10 bg-card',
				exbo: 'ring-info text-info',
				media: 'ring-[oklch(55%_0.22_300)] text-[oklch(65%_0.22_300)]',
				stalhub:
					'ring-primary/80 text-primary shadow-border/20 shadow-lg',
				nsfw: 'ring-primary/50 bg-border/20 text-primary font-bold',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	}
)
