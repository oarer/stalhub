'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { montserrat, unbounded } from '@/app/fonts'
import GradientText from '@/components/ui/GradientText'
import { tools } from '@/constants/landing.const'
import { cn } from '@/lib/cn'

export default function Tools() {
	const t = useTranslations()

	return (
		<section className="mx-auto flex flex-col gap-16 pb-20" id="tools">
			<motion.div
				className="text-center"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				whileInView={{ y: 0, opacity: 1 }}
			>
				<div className="flex flex-col gap-4">
					<GradientText
						className={`${unbounded.className} text-balance font-bold text-3xl tracking-tight md:text-5xl`}
						colors={['#21c0ff', '#afe3ff']}
						yoyo={false}
					>
						{t('landing.tools.title')}
					</GradientText>

					<p className="text-center font-medium text-xl md:text-2xl dark:text-white/90">
						{t('landing.tools.description')}
					</p>
				</div>
			</motion.div>

			<div className="grid max-w-355 grid-cols-1 gap-px overflow-hidden rounded-2xl ring-2 ring-border/30 md:grid-cols-2 lg:grid-cols-3">
				{tools.map((tool, index) => (
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
								'flex h-full w-full flex-col justify-start gap-3 bg-background/80 p-10 text-left ring ring-border/20 duration-400 hover:brightness-125',
								index % 2 === 0 &&
									'bg-[radial-gradient(105.38%_145.07%_at_41.4%_40.19%,#38bdf82b_0,#ff6aa900_65%)]'
							)}
							href={tool.link}
						>
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-cyan-500/10 p-2">
									<Icon
										className="text-3xl text-cyan-500"
										icon={tool.icon}
									/>
								</div>
								<p className="font-semibold text-neutral-800 text-xl dark:text-neutral-100">
									{t(tool.title)}
								</p>
							</div>

							<p
								className={`${montserrat.className} font-semibold text-[13px] text-neutral-600 dark:text-neutral-400`}
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
