import { cva } from 'class-variance-authority'

export const linkVariants = cva(
    'rounded-2xl flex w-fit items-center font-medium transition-all duration-500 ease-in-out cursor-pointer',
    {
        variants: {
            variant: {
                primary:
                    'bg-sky-400 dark:bg-sky-600/70  shadow-md hover:bg-sky-500 dark:hover:opacity-140',
                secondary:
                    'bg-white dark:bg-neutral-800/50 shadow-sm hover:bg-neutral-300 dark:hover:bg-neutral-800',
                outline:
                    'gap-3 rounded-full font-semibold py-2 hover:opacity-100 active:opacity-50',
            },
            disabled: {
                true: 'opacity-50 pointer-events-none cursor-not-allowed',
                false: '',
            },
            size: {
                sm: 'px-2 py-1.5 text-sm',
                md: 'px-4 py-2 text-md',
                lg: 'px-5 py-2.5 text-lg',
                xl: 'px-6 py-3 text-xl',
            },
        },
        defaultVariants: {
            variant: 'outline',
            size: 'md',
            disabled: false,
        },
    }
)
