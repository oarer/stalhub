'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { toolsList } from '@/constants/tools.const'
import { cn } from '@/lib/cn'

export default function ToolsListView() {
	const t = useTranslations()

	return (
		<section className="mx-auto max-w-7xl space-y-12 px-4 pt-42 pb-12 sm:px-6">
			
				<h1
					className={`${mtsExtended.className} text-[28px] leading-none font-semibold`}
				>
					{t('toolsList.title')}
				</h1>
				<p className="text-muted-foreground text-sm font-medium">
					{t('toolsList.subtitle')}
				</p>
			
			<div className="ring-primary/30 grid max-w-355 grid-cols-1 gap-px overflow-hidden rounded-2xl ring-2 md:grid-cols-2 lg:grid-cols-3">
				{toolsList.map((tool, index) => (
					<motion.div
						className="h-full"
						initial={{ y: 30, opacity: 0 }}
						key={tool.id}
						transition={{ duration: 0.6, delay: index * 0.1 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						<Link
							className={cn(
								'bg-card/80 ring-primary/20 flex h-full w-full flex-col justify-start gap-3 p-10 text-left ring duration-400 hover:brightness-125',
								index % 2 === 0 &&
									'bg-[radial-gradient(105.38%_145.07%_at_41.4%_40.19%,#38bdf82b_0,#ff6aa900_65%)]'
							)}
							href={tool.link}
						>
							<div className="flex items-center gap-2">
								<div className="bg-0/10 rounded-lg p-2">
									<Icon
										className="text-primary text-3xl"
										icon={tool.icon}
									/>
								</div>
								<p
									className={`${mtsWide.className} text-xl font-medium text-neutral-800 dark:text-neutral-100`}
								>
									{t(tool.title)}
								</p>
							</div>

							<p
								className={`font-mono text-[13px] font-medium text-neutral-600 dark:text-neutral-400`}
							>
								{t(tool.desc)}
							</p>
						</Link>
					</motion.div>
				))}
			</div>
		</section>
	)
}
