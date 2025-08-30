export const accordionVariants = {
    default: {
        base: 'w-full',
        item: 'border border-border rounded-lg overflow-hidden bg-card shadow-sm',
        trigger:
            'w-full px-4 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between text-foreground',
        content: 'overflow-hidden bg-muted/30',
        indicator: 'text-muted-foreground transition-transform duration-300',
    },
    bordered: {
        base: 'w-full border border-border rounded-lg overflow-hidden',
        item: 'border-b border-border last:border-b-0',
        trigger:
            'w-full px-4 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between text-foreground',
        content: 'overflow-hidden',
        indicator: 'text-muted-foreground transition-transform duration-300',
    },
    splitted: {
        base: 'w-full space-y-3',
        item: 'border border-border rounded-lg overflow-hidden bg-card shadow-sm',
        trigger:
            'w-full px-4 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between text-foreground',
        content: 'overflow-hidden',
        indicator: 'text-muted-foreground transition-transform duration-300',
    },
    shadow: {
        base: 'w-full space-y-4',
        item: 'bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-border',
        trigger:
            'w-full px-6 text-left hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 flex items-center justify-between text-foreground',
        content: 'overflow-hidden bg-gradient-to-br from-muted/30 to-card',
        indicator: 'text-muted-foreground transition-all duration-300',
    },
    gradient: {
        base: 'w-full space-y-4',
        item: 'bg-gradient-to-br from-card to-muted/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-border',
        trigger:
            'w-full px-6 text-left hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-300 flex items-center justify-between text-foreground',
        content:
            'overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10',
        indicator: 'text-primary transition-all duration-300',
    },
    minimal: {
        base: 'w-full space-y-1',
        item: 'border-b border-border/50 last:border-b-0',
        trigger:
            'w-full px-2 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between rounded-md text-foreground',
        content: 'overflow-hidden',
        indicator: 'text-muted-foreground transition-transform duration-300',
    },
    colorful: {
        base: 'w-full space-y-3',
        item: 'rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300',
        trigger:
            'w-full px-5 text-left text-white font-medium hover:brightness-110 transition-all duration-300 flex items-center justify-between',
        content: 'overflow-hidden bg-card border-t border-border/20',
        indicator: 'text-white/80 transition-transform duration-300',
    },
    toggle: {
        base: 'w-full',
        item: 'inline-block mr-2 mb-2',
        trigger:
            'px-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all duration-200 text-sm font-medium data-[state=open]:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:border-primary text-foreground',
        content: 'w-full mt-4 p-4 bg-muted/30 rounded-lg border border-border',
        indicator: 'hidden',
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
