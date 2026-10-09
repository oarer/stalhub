'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import { tools } from '@/constants/landing.const'

export default function Tools() {
	const t = useTranslations()

	return (
		<section
			className="relative flex scroll-mt-24 flex-col py-16 md:py-24"
			id="tools"
		>
			<div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
				<div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
					<motion.h2
						className={`${mtsWide.className} font-semibold text-[40px] leading-none sm:text-5xl`}
						initial={{ y: 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						{t('landing.tools.title')}
					</motion.h2>

					<motion.p
						className={`${mtsExtended.className} font-medium text-foreground text-md`}
						initial={{ y: 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						{t('landing.tools.description')}
					</motion.p>

					<motion.div
						initial={{ y: 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						<CLink
							className={`${mtsExtended.className} w-full justify-center gap-2 rounded-xl font-medium sm:w-auto`}
							href="/calcs"
							size="lg"
							variant="primary"
						>
							<Icon
								aria-hidden
								className="text-xl"
								icon="lucide:rocket"
							/>
							{t('landing.start')}
						</CLink>
					</motion.div>
				</div>

				<div className="flex flex-col border-primary/40 border-t-2">
					{tools.map((tool, index) => (
						<motion.div
							initial={{ y: 24, opacity: 0 }}
							key={tool.id}
							transition={{ duration: 0.5, delay: index * 0.07 }}
							viewport={{ once: true, amount: 0.3 }}
							whileInView={{ y: 0, opacity: 1 }}
						>
							<Link
								className="group flex items-center gap-4 border-primary/40 border-b-2 px-2 py-5 transition-colors duration-300 hover:bg-primary/5 sm:gap-5 sm:px-4"
								href={tool.link}
							>
								<span
									className={`${mtsExtended.className} hidden w-8 shrink-0 font-bold text-primary/50 text-xs tabular-nums sm:block`}
								>
									{String(index + 1).padStart(2, '0')}
								</span>

								<span className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
									<Icon
										className="block text-xl"
										icon={tool.icon}
									/>
								</span>

								<span className="flex min-w-0 flex-1 flex-col gap-1">
									<span
										className={`${mtsExtended.className} font-bold text-[15px] leading-snug sm:text-base`}
									>
										{t(tool.title)}
									</span>
									<span
										className={`${mtsWide.className} line-clamp-2 font-medium text-foreground/70 text-sm`}
									>
										{t(tool.desc)}
									</span>
								</span>

								<Icon
									className="shrink-0 text-muted-foreground text-xl transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
									icon="lucide:arrow-up-right"
								/>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
