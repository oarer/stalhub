'use client'

import { useTranslation } from 'react-i18next'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react'

import { Card, CardContent } from '@/components/ui/card/Card'
import { Badge } from '@/components/ui/badge/Badge'
import { cn } from '@/lib/utils'
import type { RoadMap } from '@/constants/roadMap.const'
import { statusConfig } from '@/constants/roadMap.const'
import { getSubTaskBgColor, getTasksByStatus } from './statusUtils'
import { unbounded } from '@/app/fonts'

export default function Roadmap() {
    const { t } = useTranslation()

    const renderSubTasks = (subTasks: RoadMap[]) => {
        return (
            <div className="flex flex-col gap-3 border-l-2 border-white pl-3 dark:border-neutral-700">
                {subTasks.map((subTask, index) => (
                    <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            'flex items-center gap-2 rounded-lg p-2 ring',
                            getSubTaskBgColor(subTask.status)
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        key={`${subTask.name}-${index}`}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
                            <Icon
                                className="text-md text-cyan-500 dark:text-cyan-400"
                                icon={subTask.icon}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-neutral-800 dark:text-neutral-100">
                                {t(subTask.name)}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {t(subTask.desc)}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        )
    }

    return (
        <>
            <h1
                className={`${unbounded.className} bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-center text-3xl font-bold tracking-tight text-balance text-transparent md:text-5xl dark:from-sky-400 dark:to-sky-200`}
            >
                {t('roadmap.title')}
                <br />
                {t('roadmap.sub_title')}
            </h1>
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4 xl:px-0">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const statusTasks = getTasksByStatus(
                            status as RoadMap['status']
                        )

                        return (
                            <div className="space-y-4" key={status}>
                                <div
                                    className={cn(
                                        'rounded-xl p-4 ring',
                                        config.bgColor,
                                        config.border,
                                        config.color
                                    )}
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <Icon
                                            className="h-5 w-5 text-current"
                                            icon={config.icon}
                                        />
                                        <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                            {t(config.label)}
                                        </h2>
                                    </div>
                                    <Badge
                                        className="bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                                        variant="secondary"
                                    >
                                        {statusTasks.length}{' '}
                                        {t('roadmap.tasks')}
                                    </Badge>
                                </div>

                                <div
                                    className="max-h-[60vh] space-y-3 overflow-y-auto mask-y-from-95% mask-y-to-100% p-2 py-4"
                                    tabIndex={0}
                                >
                                    {statusTasks.length > 0 ? (
                                        statusTasks.map((task, index) => (
                                            <motion.div
                                                animate={{ opacity: 1, y: 0 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                key={`${task.name}-${index}`}
                                                transition={{
                                                    delay: index * 0.1,
                                                }}
                                            >
                                                <Card
                                                    className={cn(
                                                        'group ring-[1.5px] backdrop-blur-none',
                                                        config.border
                                                    )}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="mb-2 flex items-start gap-3">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-white transition-colors group-hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-900 dark:group-hover:bg-neutral-700">
                                                                <Icon
                                                                    className="text-lg text-cyan-400 dark:text-cyan-400"
                                                                    icon={
                                                                        task.icon
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-neutral-900 transition-colors group-hover:text-cyan-600 dark:text-neutral-100 dark:group-hover:text-cyan-400">
                                                                    {t(
                                                                        task.name
                                                                    )}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                                                            {t(task.desc)}
                                                        </p>

                                                        {task.subTask &&
                                                            task.subTask
                                                                .length > 0 && (
                                                                <div className="mt-3">
                                                                    {renderSubTasks(
                                                                        task.subTask
                                                                    )}
                                                                </div>
                                                            )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
                                            <Icon
                                                className="mx-auto mb-2 h-8 w-8 text-neutral-400 opacity-50 dark:text-neutral-500"
                                                icon="mdi:inbox"
                                            />
                                            <p className="text-sm">
                                                No tasks in{' '}
                                                {config.label.toLowerCase()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
