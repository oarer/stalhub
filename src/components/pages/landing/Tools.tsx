'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardLink,
    CardTitle,
} from '@/components/ui/card/Card'
import { unbounded } from '@/app/fonts'
import { tools } from '@/constants/landing.const'
import { cn } from '@/lib/utils'

export default function Tools() {
    return (
        <section
            className="mx-auto flex flex-col gap-16 pt-52 pb-20"
            id="tools"
        >
            <motion.div
                className="text-center"
                initial={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ y: 0, opacity: 1 }}
            >
                <div className="flex flex-col gap-4">
                    <h1
                        className={`${unbounded.className} bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-3xl font-bold tracking-tight text-balance text-transparent md:text-5xl dark:from-sky-400 dark:to-sky-200`}
                    >
                        Инструменты
                    </h1>
                    <p className="text-center text-xl font-medium md:text-2xl dark:text-neutral-200/90">
                        Обширная коллекция инструментов
                    </p>
                </div>
            </motion.div>

            <div className="mx-auto grid max-w-7xl auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool, index) => (
                    <motion.div
                        className="h-full"
                        initial={{ y: 30, opacity: 0 }}
                        key={tool.id}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileInView={{ y: 0, opacity: 1 }}
                    >
                        <CardLink
                            className={cn(
                                'group h-full bg-neutral-200 backdrop-blur-md transition-transform duration-400 hover:-translate-y-1 dark:bg-neutral-950/20',
                                index % 2 === 0 &&
                                    'bg-[radial-gradient(105.38%_145.07%_at_41.4%_40.19%,#38bdf82b_0,#ff6aa900_65%)]'
                            )}
                            href={tool.link}
                        >
                            <CardHeader className="flex items-center gap-3">
                                <CardTitle className="rounded-lg bg-cyan-500/10 p-2 text-cyan-500">
                                    <Icon
                                        className="text-3xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                                        icon={tool.icon}
                                    />
                                </CardTitle>
                                <CardDescription className="text-center text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                                    {tool.title}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                                {tool.desc}
                            </CardContent>
                        </CardLink>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
