'use client'

import { motion, type Variants } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { AwardCategory, AwardNominee } from '@/types/awards.type'
import AwardClanCard from './AwardClanCard'
import { NomineeCard } from './NomineeCard'
import { UpdateCard } from './UpdateCard'

const gridVariants: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.06,
		},
	},
}

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45 },
	},
}

export function CategoryNominees({
	category,
	canVote,
	onVote,
}: {
	category: AwardCategory
	canVote: boolean
	onVote: (nominee: AwardNominee) => void
}) {
	const t = useTranslations('awards')
	const selected = category.my_vote_nominee_id
	const voteDisabled = !canVote || Boolean(selected)

	if (category.nominees.length === 0) {
		return (
			<p className="text-muted-foreground py-8 text-center">
				{t('empty')}
			</p>
		)
	}

	return (
		<motion.div
			className={
				category.kind === 'updates'
					? 'grid gap-4'
					: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
			}
			initial="hidden"
			variants={gridVariants}
			viewport={{ once: true, amount: 0.1 }}
			whileInView="visible"
		>
			{category.nominees.map((nominee) => (
				<motion.div
					className="min-w-0"
					key={nominee.id}
					variants={cardVariants}
				>
					{category.kind === 'updates' ? (
						<UpdateCard
							candidate={nominee}
							disabled={voteDisabled}
							onVote={() => onVote(nominee)}
							selected={selected === nominee.id}
						/>
					) : category.kind === 'clan' ? (
						<AwardClanCard
							disabled={voteDisabled}
							nominee={nominee}
							onVote={() => onVote(nominee)}
							selected={selected === nominee.id}
						/>
					) : (
						<NomineeCard
							candidate={nominee}
							disabled={voteDisabled}
							onVote={() => onVote(nominee)}
							selected={selected === nominee.id}
						/>
					)}
				</motion.div>
			))}
		</motion.div>
	)
}
