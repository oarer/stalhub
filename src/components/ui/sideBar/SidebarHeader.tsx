'use client'

import type React from 'react'

import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

import { Button } from '../button/Button'

interface SidebarHeaderProps {
    hasClusters: boolean
    showAll: () => void
    hideAll: () => void
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    hasClusters,
    showAll,
    hideAll,
}) => {
    return (
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="border-border flex items-center justify-between gap-2 border-b pb-3"
            initial={{ opacity: 0, y: -10 }}
        >
            <Button
                className="flex items-center gap-3"
                disabled={!hasClusters}
                onClick={showAll}
                size={'sm'}
                variant={'secondary'}
            >
                <Icon className="text-md" icon="lucide:eye" />
                Показать все
            </Button>

            <Button
                className="flex items-center gap-3"
                disabled={!hasClusters}
                onClick={hideAll}
                size={'sm'}
                variant={'secondary'}
            >
                <Icon className="text-md" icon="lucide:eye-off" />
                Скрыть все
            </Button>
        </motion.div>
    )
}
