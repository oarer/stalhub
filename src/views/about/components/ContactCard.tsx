'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
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
						className="h-40 w-40 rounded-2xl bg-background object-cover shadow-2xl shadow-border/40 ring-2 ring-border/80 sm:h-52 sm:w-52 lg:h-56.5 lg:w-56.5"
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
						className={`${unbounded.className} font-bold text-xl uppercase tracking-widest sm:text-2xl`}
					>
						{name}
					</h2>
					<h3
						className={`${unbounded.className} font-bold text-border text-sm uppercase tracking-widest`}
					>
						{t(description)}
					</h3>
				</motion.div>

				<motion.div className="flex items-center gap-3" {...view}>
					{links.map(({ href, icon }, index) => (
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

			<motion.div className="perspective-dramatic group" {...view}>
				<Image
					alt={`${name} quote`}
					className="group-hover:transform-[translateZ(0)] max-h-65 w-full min-w-80 -rotate-y-2 rounded-xl bg-background p-2 shadow-2xl shadow-accent ring-2 ring-border-secondary transition-transform duration-500 md:min-w-lg"
					height={512}
					quality={100}
					src={`/images/avatars/quote/${name}.png`}
					width={512}
				/>
			</motion.div>
		</motion.li>
	)
}
