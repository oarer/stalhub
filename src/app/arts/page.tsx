'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CLink } from '@/components/ui/Link'
import { unbounded } from '../fonts'

export default function Page() {
	const t = useTranslations()
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-3xl">{t('arts.title')}</h1>
				<span className="font-semibold text-sm text-text-accent">
					{t('arts.total', { count: '22' })}
				</span>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<Input className="w-full max-w-lg" label="arts.search" />

				<div className="flex items-center gap-2">
					<span className="font-semibold text-sm text-text-accent">
						{t('buildsPublic.sort')}
					</span>
					combobox
				</div>
			</div>

			<div className="columns-2 gap-3 sm:columns-4">
				<div className="break-inside-avoid overflow-hidden rounded-lg bg-background ring-2 ring-border/30">
					<Image
						alt="art name"
						className="h-auto w-full"
						height={1600}
						src="/images/art.jpg"
						width={1200}
					/>
				</div>

				<CLink
					className="relative cursor-pointer break-inside-avoid overflow-hidden bg-background p-0"
					href=""
					variant={'outline'}
				>
					<Badge
						className={`${unbounded.className} absolute top-2 right-2 z-2`}
						variant={'nsfw'}
					>
						NSFW
					</Badge>
					<Image
						alt="art name"
						className="h-auto w-full blur-xl transition-all duration-400 hover:blur-none"
						height={1600}
						src="/images/art2.jpg"
						width={1200}
					/>
				</CLink>
			</div>

			<div className="flex items-center justify-center gap-2">
				<Button size="sm" variant="outline">
					<Icon icon="lucide:chevron-left" />
				</Button>
				<span className="text-sm text-text-accent">1 / 22</span>
				<Button size="sm" variant="outline">
					<Icon icon="lucide:chevron-right" />
				</Button>
			</div>
		</section>
	)
}
