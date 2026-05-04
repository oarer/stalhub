'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { montserrat, unbounded } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { CLink } from '@/components/ui/Link'
import type { LinksSectionProps } from './about.types'
import { view } from './about.types'

export function LinksSection({
	contactLinks,
	supportLinks,
}: LinksSectionProps) {
	const t = useTranslations()

	return (
		<Card.Root className="mt-24 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
			<div className="flex flex-col gap-2">
				<motion.h1
					{...view}
					className={`${unbounded.className} flex items-center gap-3 px-3 font-bold uppercase tracking-wider`}
				>
					<span className="flex items-center rounded-lg bg-background p-2">
						<Icon
							className="size-5 text-border"
							icon="lucide:link"
						/>
					</span>
					{t('about.contact_us')}
				</motion.h1>

				<div className="flex flex-col gap-2">
					{contactLinks.map((link) => (
						<motion.div key={link.label} {...view}>
							<CLink
								className="group/link flex justify-start gap-3 p-3 transition-colors duration-300"
								externalIcon={false}
								href={link.href}
								variant="secondary"
							>
								<div className="flex items-center rounded-lg bg-border/10 p-2 text-border transition-colors duration-300 group-hover/link:bg-border/20">
									<Icon className="size-5" icon={link.icon} />
								</div>
								<div className="flex flex-col">
									<p
										className={`${montserrat.className} font-semibold text-sm transition-colors group-hover/link:text-border`}
									>
										{t(link.label)}
									</p>
									<span
										className={`${montserrat.className} text-foreground text-xs`}
									>
										{t(link.description)}
									</span>
								</div>
							</CLink>
						</motion.div>
					))}
				</div>
			</div>

			<Divider
				className="bg-gradient-to-b from-transparent via-border to-transparent"
				orientation="vertical"
			/>

			<div className="flex flex-col gap-2" id="links">
				<motion.h1
					{...view}
					className={`${unbounded.className} flex items-center gap-3 px-3 font-bold uppercase tracking-wider`}
				>
					<span className="flex items-center rounded-lg bg-background p-2">
						<Icon
							className="size-5 text-border"
							icon="lucide:link"
						/>
					</span>
					{t('about.useful_links')}
				</motion.h1>

				<div className="flex flex-col gap-2">
					{supportLinks.map((link) => (
						<motion.div key={link.label} {...view}>
							<CLink
								className="group/link flex justify-start gap-3 p-3 transition-colors duration-300"
								externalIcon={false}
								href={link.href}
								variant="secondary"
							>
								<div className="flex items-center rounded-lg bg-border/10 p-2 text-border transition-colors duration-300 group-hover/link:bg-border/20">
									<Icon className="size-5" icon={link.icon} />
								</div>
								<div className="flex flex-col">
									<p
										className={`${montserrat.className} font-semibold text-sm transition-colors group-hover/link:text-border`}
									>
										{t(link.label)}
									</p>
									<span
										className={`${montserrat.className} text-foreground text-xs`}
									>
										{t(link.description)}
									</span>
								</div>
							</CLink>
						</motion.div>
					))}
				</div>
			</div>
		</Card.Root>
	)
}
