'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { unbounded } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { tools } from '@/constants/landing.const'
import { cn } from '@/lib/cn'

export default function Tools() {
	const { t } = useTranslation()

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
						className={`${unbounded.className} bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-3xl font-bold tracking-tight text-balance text-transparent md:text-5xl dark:from-sky-400 dark:to-sky-200`}
					>
						{t('landing.tools.title')}
					</h1>
					<p className="text-center text-xl font-medium md:text-2xl dark:text-white/90">
						{t('landing.tools.description')}
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
						<Card.Link
							className={cn(
								'group h-full bg-white ring-2 ring-sky-500/20 backdrop-blur-md transition-transform duration-400 hover:-translate-y-1 dark:bg-black/20 dark:ring-sky-200/30',
								index % 2 === 0 &&
									'bg-[radial-gradient(105.38%_145.07%_at_41.4%_40.19%,#38bdf82b_0,#ff6aa900_65%)]'
							)}
							href={tool.link}
						>
							<Card.Header className="flex items-center gap-3">
								<Card.Title className="rounded-lg bg-cyan-500/10 p-2 text-cyan-500">
									<Icon
										className="text-3xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
										icon={tool.icon}
									/>
								</Card.Title>
								<Card.Description className="text-center text-lg font-semibold text-neutral-800 dark:text-neutral-100">
									{t(tool.title)}
								</Card.Description>
							</Card.Header>
							<Card.Content className="text-center text-sm text-neutral-600 dark:text-neutral-400">
								{t(tool.desc)}
							</Card.Content>
						</Card.Link>
					</motion.div>
				))}
			</div>
		</section>
	)
}
