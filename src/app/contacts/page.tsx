'use client'

import GradientText from '@/components/ui/GradientText'
import { unbounded } from '../fonts'

export default function ContactsPage() {
	return (
		<section className="mx-auto max-w-7xl space-y-6 px-4 pt-42 pb-12 sm:px-6">
			<GradientText
				animationSpeed={2}
				className={`${unbounded.className} text-5xl`}
				colors={['#94cceb', '#0081b9']}
				yoyo={false}
			>
				Контакты
			</GradientText>
		</section>
	)
}
