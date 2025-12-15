import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
    'rounded-2xl flex items-center font-medium transition-all duration-400 ease-in-out cursor-pointer',
    {
        variants: {
            variant: {
                primary:
                    'bg-sky-400 dark:bg-sky-600/70 shadow-md hover:bg-sky-500 dark:hover:opacity-140',
                secondary:
                    'bg-white/60 dark:bg-neutral-800/50 shadow-sm hover:bg-neutral-300 dark:hover:bg-neutral-800',
                danger: 'ring-2 ring-red-400 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800 font-medium shadow-sm hover:bg-red-200 dark:hover:bg-red-700 hover:shadow-md transition-all duration-150 active:scale-95',
                outline:
                    'gap-4 rounded-full px-6 py-2 opacity-70 hover:bg-neutral-300/60 hover:opacity-100 active:opacity-50 hover:dark:bg-neutral-700/30',
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
