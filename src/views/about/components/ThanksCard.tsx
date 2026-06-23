'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import type { AboutMember } from './about.types'
import { view } from './about.types'

export function ThanksCard({ name, description, links }: AboutMember) {
	const t = useTranslations()

	return (
		<motion.li
			className="flex flex-col items-center gap-4 text-center"
			id={name}
			{...view}
		>
			<motion.div {...view}>
				<Image
					alt={name}
					className="h-30 w-30 rounded-2xl bg-background object-cover shadow-2xl shadow-border/40 ring-2 ring-border/80 sm:h-52 sm:w-52 lg:h-50 lg:w-50"
					height={186}
					src={`/images/avatars/${name}.jpg`}
					width={186}
				/>
			</motion.div>

			<motion.div className="flex flex-col items-center gap-2" {...view}>
				<h1
					className={`${unbounded.className} font-bold text-lg uppercase tracking-widest sm:text-xl`}
				>
					{name}
				</h1>
				<h2
					className={`${unbounded.className} font-bold text-border text-sm uppercase tracking-widest`}
				>
					{t.rich(description, {
						br: () => <br />,
					})}
				</h2>
			</motion.div>
			{links &&
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
			}
		</motion.li>
	)
}
