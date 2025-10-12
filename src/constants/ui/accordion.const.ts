import { cva } from 'class-variance-authority'

export const accordionVariants = cva(
    'w-full border rounded-lg overflow-hidden shadow-sm transition-colors duration-200',
    {
        variants: {
            variant: {
                default:
                    'border-border bg-background text-foreground hover:bg-muted/50',
                warning:
                    'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-300 hover:bg-yellow-100/70',
                danger: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-300 hover:bg-red-100/70',
                success:
                    'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-300 hover:bg-green-100/70',
            },
            size: {
                sm: 'text-sm px-2 py-1',
                md: 'text-base px-4 py-3',
                lg: 'text-lg px-6 py-4',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
)

export const accordionIndicatorVariants = cva(
    'transition-transform duration-300',
    {
        variants: {
            variant: {
                default: 'text-foreground',
                warning: 'text-yellow-600 dark:text-yellow-400',
                danger: 'text-red-600 dark:text-red-400',
                success: 'text-green-600 dark:text-green-400',
            },
            size: {
                sm: 'w-4 h-4',
                md: 'w-5 h-5',
                lg: 'w-6 h-6',
            },
            rotated: {
                true: 'rotate-180',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
)
