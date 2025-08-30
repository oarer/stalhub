'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge/Badge'
import { unbounded } from '@/app/fonts'
import { featuresHero } from '@/constants/landing.const'
import { useUwuStore } from '@/store/useUwuStore'
import CLink from '@/components/ui/link/Link'

export default function Hero() {
    const { uwuMode } = useUwuStore()

    return (
        <section
            className="mx-auto flex flex-col items-center justify-center gap-6 p-16 px-8 text-center xl:px-0 xl:pt-[170px]"
            id="hero"
        >
            <motion.div
                animate={{ y: 0, opacity: 1 }}
                initial={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {uwuMode ? (
                    <Image
                        alt="uwu"
                        height={380}
                        quality={100}
                        src={'/stalhub_uwu.png'}
                        width={750}
                    />
                ) : (
                    <Badge variant="secondary">
                        <Icon
                            className="text-xl text-cyan-400"
                            icon="lucide:boxes"
                        />
                        <span className="text-sm">Всё в одном месте</span>
                    </Badge>
                )}
            </motion.div>

            <motion.h1
                animate={{ y: 0, opacity: 1 }}
                className={`${unbounded.className} text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-7xl`}
                initial={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <motion.span
                    animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    className="bg-gradient-to-r from-sky-600 via-sky-400 to-sky-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-sky-200 dark:to-sky-400"
                    style={{ backgroundSize: '200% 200%' }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                    }}
                >
                    Инструменты для
                </motion.span>
                <br />
                <span className="dark:text-neutral-100">StalCraft</span>
            </motion.h1>

            <motion.p
                animate={{ y: 0, opacity: 1 }}
                className="max-w-2xl text-2xl leading-relaxed font-semibold"
                initial={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                Всё необходимое для StalCraft
            </motion.p>

            <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-wrap justify-center gap-8"
                initial={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                {featuresHero.map((stat, index) => (
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="text-center"
                        initial={{ opacity: 0 }}
                        key={stat.label}
                        transition={{
                            duration: 0.5,
                            delay: 0.6 + index * 0.3,
                        }}
                    >
                        <div className={`text-2xl font-bold ${stat.color}`}>
                            {stat.value}
                        </div>
                        <div className="text-sm font-semibold">
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.div
                    animate={{ y: 0, opacity: 1 }}
                    initial={{ y: 30, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    <CLink
                        className="gap-2"
                        href="/workspace"
                        size="lg"
                        variant="primary"
                    >
                        <Icon className="text-xl" icon="lucide:rocket" />
                        Начать
                    </CLink>
                </motion.div>

                <motion.div
                    animate={{ y: 0, opacity: 1 }}
                    initial={{ y: 30, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.95 }}
                >
                    <CLink
                        className="gap-2"
                        href="#tools"
                        size="lg"
                        variant="secondary"
                    >
                        Подробнее
                        <Icon className="text-xl" icon="lucide:chevron-right" />
                    </CLink>
                </motion.div>
            </div>
        </section>
    )
}
