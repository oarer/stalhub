'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import GradientText from '@/components/ui/GradientText'
import { contactLinks, contacts, supportLinks, thanks } from './about.const'
import { view } from './components/about.types'
import { ContactCard } from './components/ContactCard'
import { LinksSection } from './components/LinksSection'
import { ThanksCard } from './components/ThanksCard'

export default function AboutView() {
	const t = useTranslations()

	return (
		<section className="mx-auto max-w-4xl space-y-8 px-4 pt-24 pb-12 sm:px-6 lg:pt-42">
			<motion.div {...view}>
				<GradientText
					animationSpeed={2}
					className={`${unbounded.className} text-4xl sm:text-5xl`}
					colors={['#94cceb', '#0081b9']}
					yoyo={false}
				>
					{t('about.contacts_title')}
				</GradientText>
			</motion.div>

			<ul className="flex flex-col gap-20">
				{contacts.map((contact) => (
					<ContactCard key={contact.name} {...contact} />
				))}
			</ul>

			<motion.div {...view}>
				<GradientText
					animationSpeed={2}
					className={`${unbounded.className} text-xl sm:text-3xl`}
					colors={['#94cceb', '#0081b9']}
					yoyo={false}
				>
					{t('about.thanks_title')}
				</GradientText>
			</motion.div>

			<ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{thanks.map((item) => (
					<ThanksCard key={item.name} {...item} />
				))}
			</ul>

			<motion.div {...view}>
				<LinksSection
					contactLinks={contactLinks}
					supportLinks={supportLinks}
				/>
				<p className="mt-2 font-bold text-background text-xs">
					ебал рот айсана
				</p>
			</motion.div>
		</section>
	)
}
