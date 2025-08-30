import type { VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { Icon } from '@iconify/react'

import { buttonVariants } from '@/constants/ui/button.const'
import { cn } from '@/lib/utils'

interface IButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, IButtonProps>(
    ({ className, variant, size, loading, children, ...props }, ref) => {
        return (
            <button
                className={cn(
                    buttonVariants({ variant, size }),
                    className,
                    loading && 'cursor-not-allowed opacity-75'
                )}
                disabled={loading || props.disabled}
                ref={ref}
                {...props}
            >
                {loading && (
                    <Icon
                        className="text-xl"
                        icon="line-md:loading-twotone-loop"
                    />
                )}
                {children}
            </button>
        )
    }
)
Button.displayName = 'UI.Button'

export { Button, buttonVariants }
