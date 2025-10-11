'use client'

import type React from 'react'

import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

import { Button } from '../button/Button'

interface SidebarActionsProps {
    onExport?: () => void
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({ onExport }) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="border-border flex items-center justify-between gap-2 border-t pt-3"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2 }}
        >
            {onExport && (
                <Button
                    className="flex items-center gap-3"
                    onClick={onExport}
                    variant={'secondary'}
                >
                    <Icon icon="lucide:download" />
                    Экспорт
                </Button>
            )}

            <Button
                className="flex items-center gap-3"
                onClick={scrollToTop}
                variant={'secondary'}
            >
                <Icon className="h-4 w-4" icon="lucide:arrow-up" />
                Наверх
            </Button>
        </motion.div>
    )
}
