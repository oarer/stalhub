'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import type { AboutMember } from './about.types'
import { view } from './about.types'

export function ContactCard({ name, description, links }: AboutMember) {
	const t = useTranslations()

	return (
		<motion.li
			className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:items-center lg:gap-16"
			id={name}
			{...view}
		>
			<motion.div
				className="flex flex-col items-center gap-4 text-center"
				{...view}
			>
				<motion.div {...view}>
					<Image
						alt={name}
						className="bg-card shadow-border/40 ring-primary/80 h-40 w-40 rounded-2xl object-cover shadow-2xl ring-2 sm:h-52 sm:w-52 lg:h-56.5 lg:w-56.5"
						height={226}
						src={`/images/avatars/${name}.jpg`}
						width={226}
					/>
				</motion.div>

				<motion.div
					className="flex flex-col items-center gap-2"
					{...view}
				>
					<h2
						className={`${mtsExtended.className} text-xl font-semibold tracking-widest uppercase sm:text-2xl`}
					>
						{name}
					</h2>
					<h3
						className={`${mtsWide.className} text-primary text-sm font-medium tracking-widest uppercase`}
					>
						{t(description)}
					</h3>
				</motion.div>

				<motion.div className="flex items-center gap-3" {...view}>
					{links &&
						links.map(({ href, icon }, index) => (
							<CLink
								className="p-2"
								externalIcon={false}
								href={href}
								key={index}
								variant="outline"
							>
								<Icon className="text-xl" icon={icon} />
							</CLink>
						))}
				</motion.div>
			</motion.div>

			<motion.div className="group perspective-dramatic" {...view}>
				<Image
					alt={`${name} quote`}
					className="bg-card shadow-accent ring-muted max-h-65 w-full min-w-80 -rotate-y-2 rounded-xl p-2 shadow-2xl ring-2 transition-transform duration-500 group-hover:transform-[translateZ(0)] md:min-w-lg"
					height={512}
					quality={100}
					src={`/images/avatars/quote/${name}.png`}
					width={512}
				/>
			</motion.div>
		</motion.li>
	)
}
