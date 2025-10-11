'use client'

import { useState, useCallback, useRef, useLayoutEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

import { cn } from '@/lib/utils'
import type { AccordionProps } from '@/types/ui/accordion.type'
import {
    accordionVariants,
    sizeVariants,
    colorVariants,
} from '@/constants/ui/accordion.const'

export function Accordion({
    items,
    variant = 'default',
    size = 'md',
    selectionMode = 'single',
    defaultExpandedKeys = [],
    className,
    onSelectionChange,
}: AccordionProps) {
    const [expandedKeys, setExpandedKeys] =
        useState<string[]>(defaultExpandedKeys)
    const [heights, setHeights] = useState<{ [key: string]: number }>({})
    const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const resizeObservers = useRef<{ [key: string]: ResizeObserver | null }>({})

    const variantClasses = accordionVariants[variant]
    const sizeClasses = sizeVariants[size]

    const measure = useCallback((key: string) => {
        const el = contentRefs.current[key]
        if (!el) return
        const h = el.scrollHeight
        setHeights((prev) => {
            if (prev[key] === h) return prev
            return { ...prev, [key]: h }
        })
    }, [])

    useLayoutEffect(() => {
        items.forEach((item) => {
            const key = item.key
            const el = contentRefs.current[key]

            if (resizeObservers.current[key]) {
                resizeObservers.current[key]?.disconnect()
                resizeObservers.current[key] = null
            }

            if (el && typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => measure(key))
                ro.observe(el)
                resizeObservers.current[key] = ro
            }

            measure(key)
        })

        return () => {
            Object.values(resizeObservers.current).forEach((ro) =>
                ro?.disconnect()
            )
            resizeObservers.current = {}
        }
    }, [items, measure])

    const handleToggle = useCallback(
        (key: string) => {
            setExpandedKeys((prev) => {
                let newExpandedKeys: string[]
                if (selectionMode === 'single') {
                    newExpandedKeys = prev.includes(key) ? [] : [key]
                } else {
                    newExpandedKeys = prev.includes(key)
                        ? prev.filter((k) => k !== key)
                        : [...prev, key]
                }
                onSelectionChange?.(newExpandedKeys)
                return newExpandedKeys
            })
        },
        [selectionMode, onSelectionChange]
    )

    const isExpanded = useCallback(
        (key: string) => expandedKeys.includes(key),
        [expandedKeys]
    )

    return (
        <div className={cn(variantClasses.base, className)}>
            {items.map((item, index) => {
                const itemColor =
                    item.color ||
                    (
                        [
                            'primary',
                            'secondary',
                            'accent',
                            'success',
                            'warning',
                            'danger',
                        ] as const
                    )[index % 6]
                const colorClass =
                    variant === 'colorful' ? colorVariants[itemColor] : ''

                const triggerId = `accordion-trigger-${item.key}`
                const contentId = `accordion-content-${item.key}`

                return (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            variantClasses.item,
                            variant === 'colorful' && colorClass
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        key={item.key}
                        transition={{ delay: index * 0.05 }}
                    >
                        <button
                            aria-controls={contentId}
                            aria-expanded={isExpanded(item.key)}
                            className={cn(
                                variantClasses.trigger,
                                sizeClasses.trigger,
                                item.disabled && 'cursor-not-allowed opacity-50'
                            )}
                            data-state={
                                isExpanded(item.key) ? 'open' : 'closed'
                            }
                            disabled={item.disabled}
                            id={triggerId}
                            onClick={() =>
                                !item.disabled && handleToggle(item.key)
                            }
                            type="button"
                        >
                            <div className="flex items-center gap-4 p-2">
                                {item.icon && (
                                    <Icon
                                        className="text-lg"
                                        icon={item.icon}
                                    />
                                )}
                                <span className="font-semibold opacity-70">
                                    {item.title}
                                </span>
                            </div>
                            <motion.div
                                animate={{
                                    rotate: isExpanded(item.key) ? 180 : 0,
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Icon
                                    className={cn(
                                        variantClasses.indicator,
                                        sizeClasses.indicator
                                    )}
                                    icon="lucide:chevron-down"
                                />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isExpanded(item.key) && (
                                <motion.div
                                    animate={{
                                        height: heights[item.key] ?? 'auto',
                                        opacity: 1,
                                    }}
                                    className={cn(
                                        variantClasses.content,
                                        sizeClasses.content,
                                        'overflow-hidden'
                                    )}
                                    exit={{ height: 0, opacity: 0 }}
                                    id={contentId}
                                    initial={{ height: 0, opacity: 0 }}
                                    role="region"
                                    transition={{
                                        height: {
                                            duration: 0.28,
                                            ease: [0.04, 0.62, 0.23, 0.98],
                                        },
                                        opacity: {
                                            duration: 0.2,
                                            ease: 'easeInOut',
                                        },
                                    }}
                                >
                                    <div
                                        className="px-1 py-2"
                                        ref={(el) => {
                                            contentRefs.current[item.key] = el
                                            if (el) measure(item.key)
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )
            })}
        </div>
    )
}
