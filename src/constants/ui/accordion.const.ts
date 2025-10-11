export const accordionVariants = {
    default: {
        base: 'w-full',
        item: 'border border-border rounded-lg overflow-hidden shadow-sm',
        trigger:
            'w-full px-4 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between',
        content: 'overflow-hidden',
        indicator: ' transition-transform duration-300',
    },
    bordered: {
        base: 'w-full border border-border rounded-lg overflow-hidden',
        item: 'border-b border-border last:border-b-0',
        trigger:
            'w-full px-4 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between',
        content: 'overflow-hidden',
        indicator: ' transition-transform duration-300',
    },
}

export const sizeVariants = {
    sm: {
        trigger: 'text-sm px-3 ',
        content: 'px-3  text-sm',
        indicator: 'w-4 h-4',
    },
    md: {
        trigger: 'text-base px-4 ',
        content: 'px-4  text-base',
        indicator: 'w-5 h-5',
    },
    lg: {
        trigger: 'text-lg px-6 ',
        content: 'px-6  text-lg',
        indicator: 'w-6 h-6',
    },
}

export const colorVariants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600',
    accent: 'bg-gradient-to-r from-purple-500 to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
}
