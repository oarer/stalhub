'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react'

import { Card, CardContent } from '@/components/ui/card/Card'
import { Badge } from '@/components/ui/badge/Badge'
import { cn } from '@/lib/utils'
import type { RoadMap } from '@/constants/roadMap.const'
import { statusConfig } from '@/constants/roadMap.const'
import { getSubTaskBgColor, getTasksByStatus } from './statusUtils'

export default function Roadmap() {
    const renderSubTasks = (subTasks: RoadMap[]) => {
        return (
            <div className="flex flex-col gap-3 border-l-2 border-white pl-3 dark:border-neutral-700">
                {subTasks.map((subTask, index) => (
                    <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            'flex items-center gap-2 rounded-md border p-2',
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
                                {subTask.name}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {subTask.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        )
    }

    return (
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
                                    'rounded-lg border p-4',
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
                                        {config.label}
                                    </h2>
                                </div>
                                <Badge
                                    className="bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                                    variant="secondary"
                                >
                                    {statusTasks.length} задач
                                </Badge>
                            </div>

                            <div
                                className="max-h-[60vh] space-y-3 overflow-y-auto mask-y-from-95% mask-y-to-100% p-2 py-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                tabIndex={0}
                            >
                                {statusTasks.length > 0 ? (
                                    statusTasks.map((task, index) => (
                                        <motion.div
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                'rounded-lg border border-white bg-white dark:border-neutral-800 dark:bg-neutral-900',
                                                config.border
                                            )}
                                            initial={{ opacity: 0, y: 20 }}
                                            key={`${task.name}-${index}`}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="group bg-transparent shadow-none">
                                                <CardContent className="p-4">
                                                    <div className="mb-2 flex items-start gap-3">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-white transition-colors group-hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-900 dark:group-hover:bg-neutral-700">
                                                            <Icon
                                                                className="text-lg text-cyan-400 dark:text-cyan-400"
                                                                icon={task.icon}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-neutral-900 transition-colors group-hover:text-cyan-600 dark:text-neutral-100 dark:group-hover:text-cyan-400">
                                                                {task.name}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                                                        {task.desc}
                                                    </p>

                                                    {task.subTask &&
                                                        task.subTask.length >
                                                            0 && (
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
    )
}
