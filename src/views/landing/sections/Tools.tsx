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
						className={`${mtsWide.className} text-[40px] leading-none font-semibold sm:text-5xl`}
						initial={{ y: 30, opacity: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
						whileInView={{ y: 0, opacity: 1 }}
					>
						{t('landing.tools.title')}
					</motion.h2>

					<motion.p
						className={`${mtsExtended.className} text-foreground text-md font-medium`}
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

				<div className="border-primary/40 flex flex-col border-t-2">
					{tools.map((tool, index) => (
						<motion.div
							initial={{ y: 24, opacity: 0 }}
							key={tool.id}
							transition={{ duration: 0.5, delay: index * 0.07 }}
							viewport={{ once: true, amount: 0.3 }}
							whileInView={{ y: 0, opacity: 1 }}
						>
							<Link
								className="group border-primary/40 hover:bg-primary/5 flex items-center gap-4 border-b-2 px-2 py-5 transition-colors duration-300 sm:gap-5 sm:px-4"
								href={tool.link}
							>
								<span
									className={`${mtsExtended.className} text-primary/50 hidden w-8 shrink-0 text-xs font-bold tabular-nums sm:block`}
								>
									{String(index + 1).padStart(2, '0')}
								</span>

								<span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground shrink-0 rounded-lg p-2.5 transition-colors duration-300">
									<Icon
										className="block text-xl"
										icon={tool.icon}
									/>
								</span>

								<span className="flex min-w-0 flex-1 flex-col gap-1">
									<span
										className={`${mtsExtended.className} text-[15px] leading-snug font-bold sm:text-base`}
									>
										{t(tool.title)}
									</span>
									<span
										className={`${mtsWide.className} text-foreground/70 line-clamp-2 text-sm font-medium`}
									>
										{t(tool.desc)}
									</span>
								</span>

								<Icon
									className="text-muted-foreground group-hover:text-primary shrink-0 text-xl transition-all duration-300 group-hover:translate-x-1"
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
