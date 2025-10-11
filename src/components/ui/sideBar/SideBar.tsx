'use client'

import type React from 'react'
import { memo, useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

import { SidebarHeader } from './SidebarHeader'
import { ClusterItem } from './СlusterItem'
import { SidebarActions } from './SidebarActions'
import type { MarkerClusterFull as MarkerClusterType } from '@/types/map.type'

type Props = {
    clusterList: MarkerClusterType[]
    visibleClusterIds: Set<number>
    visibleGroupKeys: Set<string>
    toggleCluster: (clusterId: number) => void
    toggleGroup: (clusterId: number, groupId: number) => void
    showAll: () => void
    hideAll: () => void
    lang?: 'ru' | 'en'
    onExport?: () => void
    className?: string
}

const Sidebar: React.FC<Props> = ({
    clusterList,
    visibleClusterIds,
    visibleGroupKeys,
    toggleCluster,
    toggleGroup,
    showAll,
    hideAll,
    lang = 'ru',
    onExport,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(true)
    const hasClusters = clusterList && clusterList.length > 0

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        animate={{ opacity: 1, x: 0 }}
                        className={`ring-border fixed top-1/3 left-4 z-[999] flex max-h-[70vh] min-w-[280px] flex-col gap-4 overflow-hidden rounded-lg bg-white/60 p-2 shadow-lg ring-2 backdrop-blur-md dark:bg-neutral-900/70 dark:ring-[1.5px] ${className}`}
                        exit={{ opacity: 0, x: -20 }}
                        initial={{ opacity: 0, x: -20 }}
                        transition={{
                            duration: 0.4,
                            ease: 'easeInOut',
                        }}
                    >
                        <SidebarHeader
                            hasClusters={hasClusters}
                            hideAll={hideAll}
                            showAll={showAll}
                        />

                        <AnimatePresence mode="wait">
                            {!hasClusters ? (
                                <motion.div
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 py-4 text-sm"
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                >
                                    <Icon
                                        className="h-4 w-4"
                                        icon="mdi:information-outline"
                                    />
                                    Нет меток
                                </motion.div>
                            ) : (
                                <motion.div
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col gap-3"
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                >
                                    {clusterList.map((cluster) => (
                                        <ClusterItem
                                            cluster={cluster}
                                            isVisible={visibleClusterIds.has(
                                                cluster.id
                                            )}
                                            key={cluster.id}
                                            lang={lang}
                                            toggleCluster={toggleCluster}
                                            toggleGroup={toggleGroup}
                                            visibleGroupKeys={visibleGroupKeys}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <SidebarActions onExport={onExport} />
                    </motion.aside>
                )}
            </AnimatePresence>

            <motion.button
                animate={{
                    left: isOpen ? '325px' : '20px',
                    opacity: 1,
                    scale: 1,
                }}
                className="fixed top-1/2 z-[999] -translate-y-1/2 cursor-pointer rounded-xl bg-neutral-300/60 p-3 backdrop-blur-xs transition-colors duration-400 hover:bg-neutral-300/30 dark:bg-neutral-900/70 hover:dark:bg-neutral-800/60"
                initial={{ opacity: 0, scale: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                transition={{
                    ease: 'easeInOut',
                    duration: 0.2,
                    left: {
                        duration: isOpen ? 0.3 : 0.45,
                        delay: isOpen ? 0 : 0.2,
                        ease: 'easeInOut',
                    },
                }}
            >
                <AnimatePresence initial={false} mode="wait">
                    <motion.span
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1 }}
                        initial={{ opacity: 0, scale: 1 }}
                        key={isOpen ? 'close' : 'chevron'}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <Icon
                            className="text-lg"
                            icon={
                                isOpen
                                    ? 'lucide:chevron-left'
                                    : 'lucide:chevron-right'
                            }
                        />
                    </motion.span>
                </AnimatePresence>
            </motion.button>
        </>
    )
}

export default memo(Sidebar)
