'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import GradientText from '@/components/ui/GradientText'
import {
	contactLinks,
	contacts,
	supportLinks,
	thanks,
} from '@/constants/about.const'
import { view } from './components/about.types'
import { ContactCard } from './components/ContactCard'
import { LinksSection } from './components/LinksSection'
import { ThanksCard } from './components/ThanksCard'

export default function AboutView() {
	const t = useTranslations()

	return (
		<section className="mx-auto space-y-8 px-4 pt-24 pb-12 sm:px-6 lg:pt-42">
			<motion.div className="mx-auto max-w-4xl" {...view}>
				<GradientText
					animationSpeed={2}
					className={`${mtsExtended.className} text-4xl sm:text-5xl`}
					colors={['var(--primary)', '#afe3ff']}
					yoyo={false}
				>
					{t('about.contacts_title')}
				</GradientText>
			</motion.div>

			<ul className="mx-auto flex max-w-4xl flex-col gap-20">
				{contacts.map((contact) => (
					<ContactCard key={contact.name} {...contact} />
				))}
			</ul>

			<motion.div {...view}>
				<GradientText
					animationSpeed={2}
					className={`${mtsExtended.className} text-xl sm:text-3xl`}
					colors={['var(--primary)', '#afe3ff']}
					yoyo={false}
				>
					{t('about.thanks_title')}
				</GradientText>
			</motion.div>

			<ul className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
				{thanks.map((item) => (
					<ThanksCard key={item.name} {...item} />
				))}
			</ul>

			<motion.div className="mx-auto max-w-5xl" {...view}>
				<LinksSection
					contactLinks={contactLinks}
					supportLinks={supportLinks}
				/>
				<p className="text-background mt-2 text-xs font-medium">
					{t('about.insideJoke')}
				</p>
			</motion.div>
		</section>
	)
}
