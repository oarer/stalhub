'use client'

import { unbounded } from '@/app/fonts'
import { type RoadmapItem, RoadmapItems } from '@/constants/roadmap.const'
import { cn } from '@/lib/cn'

function RoadmapContent({
	item,
	align,
}: {
	item: RoadmapItem
	align: 'left' | 'right'
}) {
	return (
		<div
			className={cn(
				'flex flex-col gap-2',
				align === 'right' ? 'text-right' : 'text-left'
			)}
		>
			<time
				className={cn(
					'font-bold text-xs',
					item.status === 'planned'
						? 'text-neutral-200'
						: 'text-foreground'
				)}
				dateTime={item.date}
			>
				{item.date}
			</time>

			<h3
				className={cn(
					unbounded.className,
					'font-bold text-[16px] uppercase tracking-widest dark:text-white'
				)}
			>
				{item.title}
			</h3>

			{item.description && (
				<p className="font-semibold text-[13px] text-text-accent leading-relaxed">
					{item.description}
				</p>
			)}
		</div>
	)
}

export default function Roadmap() {
	return (
		<div className="mx-auto max-w-220 px-4 py-12 md:px-6 md:py-20">
			<ol className="relative space-y-2">
				<span
					aria-hidden="true"
					className="absolute top-0 bottom-0 left-1.75 w-px bg-border/60 md:hidden"
				/>

				<span
					aria-hidden="true"
					className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-border/60 md:block"
				/>

				{RoadmapItems.map((item, i) => {
					const isLeft = i % 2 === 0

					return (
						<li className="relative min-h-30" key={item.date}>
							<div className="flex gap-4 md:hidden">
								<div className="relative flex w-4 shrink-0 justify-center">
									<span
										className={cn(
											'relative z-10 mt-1 size-4 rounded-full border-2 border-border-secondary bg-background',
											item.status === 'in-progress' &&
												'border-border bg-border shadow-[0_0_16px_4px_lab(88.6983%_-11.3978_-16.8488)]'
										)}
									/>
								</div>

								<div className="flex-1 pb-8">
									<RoadmapContent align="left" item={item} />
								</div>
							</div>

							<div className="hidden md:grid md:grid-cols-[1fr_3rem_1fr] md:items-center">
								<div className="px-6 pr-4">
									{isLeft && (
										<RoadmapContent
											align="right"
											item={item}
										/>
									)}
								</div>

								<div className="flex justify-center">
									<span
										className={cn(
											'z-10 size-4 rounded-full border-2 border-border-secondary bg-background',
											item.status === 'in-progress' &&
												'border-border bg-border shadow-[0_0_16px_4px_lab(88.6983%_-11.3978_-16.8488)]'
										)}
									/>
								</div>

								<div className="px-6 pl-4">
									{!isLeft && (
										<RoadmapContent
											align="left"
											item={item}
										/>
									)}
								</div>
							</div>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
