'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import GradientText from '@/components/ui/GradientText'
import { toast } from '@/components/ui/Toast'
import { AWARD_CATEGORIES, AWARDS_YEAR } from './awards.data'
import { CategoryCard } from './components/CategoryCard'
import { NomineeCard } from './components/NomineeCard'
import { UpdateCard } from './components/UpdateCard'

export default function AwardsView() {
	const [activeCategoryId, setActiveCategoryId] = useState(
		AWARD_CATEGORIES[0].id
	)
	const [votes, setVotes] = useState<Record<string, string>>({})
	const votingRef = useRef<HTMLDivElement>(null)

	const activeCategory =
		AWARD_CATEGORIES.find((category) => category.id === activeCategoryId) ??
		AWARD_CATEGORIES[0]
	const selectedCandidateId = votes[activeCategory.id]
	const selectedCandidate = activeCategory.candidates.find(
		(candidate) => candidate.id === selectedCandidateId
	)
	const totalCandidates = AWARD_CATEGORIES.reduce(
		(sum, category) => sum + category.candidates.length,
		0
	)

	const openCategory = useCallback((categoryId: string) => {
		setActiveCategoryId(categoryId)
		window.setTimeout(() => {
			votingRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
		}, 80)
	}, [])

	const castVote = (candidateId: string, candidateName: string) => {
		setVotes((prev) => ({
			...prev,
			[activeCategory.id]: candidateId,
		}))
		toast.success(`Голос за «${candidateName}» принят`)
	}

	return (
		<section className="relative mx-auto flex max-w-380 flex-col gap-12 px-4 pt-32 pb-16 sm:px-6 xl:pt-40">
			<div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-80 max-w-4xl rounded-full bg-primary/15 blur-[120px]" />

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="relative flex flex-col items-center gap-5 text-center"
				initial={{ opacity: 0, y: 24 }}
				transition={{ duration: 0.6 }}
			>
				<span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 font-medium text-primary text-sm ring-2 ring-primary/30 backdrop-blur">
					<Icon className="text-lg" icon="lucide:trophy" />
					Stalzone Awards · {AWARDS_YEAR}
				</span>

				<GradientText
					animationSpeed={4}
					className={`${mtsExtended.className} font-bold text-4xl tracking-tight sm:text-6xl`}
					colors={['var(--primary)', '#afe3ff', '#f0abfc']}
					yoyo={false}
				>
					<h1>Премия года</h1>
				</GradientText>

				<p className="max-w-2xl text-balance font-medium text-muted-foreground text-sm sm:text-base">
					Выберите лучших в StalZone: события, медийных авторов и
					обновления, которые сделали этот год особенным.
				</p>

				<div className="flex flex-wrap justify-center gap-2">
					<Badge variant="success">
						<Icon icon="lucide:radio" />
						Голосование открыто
					</Badge>
					<Badge variant="stalhub">
						<Icon icon="lucide:layers" />
						{AWARD_CATEGORIES.length} категории
					</Badge>
					<Badge variant="secondary">
						<Icon icon="lucide:users" />
						{totalCandidates} участников
					</Badge>
				</div>
			</motion.div>

			<div className="relative flex flex-col gap-5">
				<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
					<p className="font-semibold text-primary text-xs uppercase tracking-[0.2em]">
						Категории
					</p>
					<h2
						className={`${mtsExtended.className} mt-1 font-semibold text-2xl tracking-tight sm:text-3xl`}
					>
						За кого голосуем?
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{AWARD_CATEGORIES.map((category, index) => (
						<CategoryCard
							active={category.id === activeCategory.id}
							category={category}
							index={index}
							key={category.id}
							onVote={() => openCategory(category.id)}
						/>
					))}
				</div>
			</div>

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="relative flex scroll-mt-28 flex-col gap-6 rounded-3xl bg-card/60 p-5 shadow-2xl ring-2 ring-primary/30 backdrop-blur-md sm:p-7"
				initial={{ opacity: 0, y: 16 }}
				key={activeCategory.id}
				ref={votingRef}
				transition={{ duration: 0.4 }}
			>
				<div className="flex flex-col gap-4 border-border/50 border-b pb-5 md:flex-row md:items-center">
					<div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted ring-2 ring-primary/40">
						<Image
							alt={activeCategory.title}
							className="object-cover"
							fill
							sizes="64px"
							src={activeCategory.image}
						/>
					</div>
					<div className="flex flex-1 flex-col gap-1">
						<span className="font-semibold text-primary text-xs uppercase tracking-[0.2em]">
							{activeCategory.kind === 'updates'
								? 'Голосование за обновление'
								: 'Голосование за кандидата'}
						</span>
						<h2
							className={`${mtsExtended.className} font-semibold text-2xl tracking-tight`}
						>
							{activeCategory.title}
						</h2>
						<p className="text-muted-foreground text-sm">
							{activeCategory.description}
						</p>
					</div>
					<Badge
						className="w-fit"
						variant={selectedCandidate ? 'success' : 'secondary'}
					>
						<Icon
							icon={
								selectedCandidate
									? 'lucide:circle-check'
									: 'lucide:circle-dashed'
							}
						/>
						{selectedCandidate
							? `Ваш голос: ${selectedCandidate.name}`
							: 'Голос не отдан'}
					</Badge>
				</div>

				<div
					className={
						activeCategory.kind === 'updates'
							? 'grid grid-cols-1 gap-4'
							: 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
					}
				>
					{activeCategory.candidates.map((candidate, index) =>
						activeCategory.kind === 'updates' ? (
							<UpdateCard
								candidate={candidate}
								index={index}
								key={candidate.id}
								onVote={() =>
									castVote(candidate.id, candidate.name)
								}
								selected={selectedCandidateId === candidate.id}
							/>
						) : (
							<NomineeCard
								candidate={candidate}
								index={index}
								key={candidate.id}
								onVote={() =>
									castVote(candidate.id, candidate.name)
								}
								selected={selectedCandidateId === candidate.id}
							/>
						)
					)}
				</div>
			</motion.div>
		</section>
	)
}
