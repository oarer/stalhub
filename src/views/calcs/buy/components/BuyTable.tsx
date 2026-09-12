'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import { getLocale } from '@/lib/getLocale'
import { useBuyStore } from '@/stores/useBuy.store'
import { infoColorMap } from '@/types/item.type'

export function BuyTable() {
	const t = useTranslations()
	const locale = getLocale()
	const items = useBuyStore((s) => s.items)
	const setPrice = useBuyStore((s) => s.setPrice)
	const removeItem = useBuyStore((s) => s.removeItem)

	const handlePriceChange = useCallback(
		(key: string, value: string) => {
			const num = Number(value)
			if (Number.isNaN(num) || num < 0) return
			setPrice(key, num)
		},
		[setPrice]
	)

	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-xl ring-2 ring-primary/50">
				<div className="grid grid-cols-[2.5rem_1fr] items-center gap-x-3 border-primary/50 border-b-2 bg-card/80 px-3 py-2 sm:grid-cols-[3rem_1fr_12rem_3rem] sm:gap-x-4 sm:px-4">
					<p
						className={`${montserrat.className} font-bold text-text-accent text-xs uppercase`}
					>
						№
					</p>
					<p
						className={`${montserrat.className} font-bold text-text-accent text-xs uppercase`}
					>
						{t('buy.item')}
					</p>
					<p
						className={`${montserrat.className} hidden font-bold text-text-accent text-xs uppercase sm:block`}
					>
						{t('buy.price')}
					</p>
					<p className="hidden sm:block" />
				</div>

				<AnimatePresence mode="popLayout">
					{items.length === 0 ? (
						<motion.div
							animate={{ opacity: 1 }}
							className="flex flex-col items-center gap-2 px-4 py-10"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							key="empty"
						>
							<p className="font-semibold text-text-accent">
								{t('buy.emptyTable')}
							</p>
							<p className="text-sm text-text-accent/60">
								{t('buy.emptyTableHint')}
							</p>
						</motion.div>
					) : (
						items.map((entry, index) => {
							const name =
								entry.item.name?.[locale] ??
								entry.item.data ??
								'—'
							const color = infoColorMap[entry.item.color]
							const iconUrl = `${GITHUB_RAW_BASE}${entry.item.icon}`

							return (
								<motion.div
									animate={{ opacity: 1, x: 0 }}
									className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-2 border-primary/20 border-b bg-card/30 px-3 py-2 transition-colors last:border-b-0 hover:bg-card/60 sm:grid-cols-[3rem_1fr_12rem_3rem] sm:gap-x-4 sm:gap-y-0 sm:px-4"
									exit={{ opacity: 0, x: -10 }}
									initial={{ opacity: 0, x: -10 }}
									key={entry.key}
									layout
									transition={{ duration: 0.15 }}
								>
									<p
										className={`${montserrat.className} col-start-1 row-start-1 font-semibold text-sm text-text-accent`}
									>
										{index + 1}
									</p>
									<div className="col-start-2 row-start-1 flex min-w-0 items-center gap-2 sm:gap-3">
										<Image
											alt={name}
											className="size-8 shrink-0 object-contain sm:size-9"
											height={36}
											loading="lazy"
											src={iconUrl}
											width={36}
										/>
										<p
											className="truncate font-semibold text-sm"
											style={{ color }}
										>
											{name}
										</p>
									</div>
									<Button
										aria-label={t('buy.remove')}
										className="col-start-3 row-start-1 sm:col-start-4"
										onClick={() => removeItem(entry.key)}
										size="sm"
										variant="danger"
									>
										<Icon icon="lucide:x" />
									</Button>
									<Input
										containerClass="col-span-3 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1"
										min={0}
										onBlur={(e) =>
											handlePriceChange(
												entry.key,
												e.target.value
											)
										}
										onChange={(e) =>
											handlePriceChange(
												entry.key,
												e.target.value
											)
										}
										type="number"
										value={String(entry.price || '')}
									/>
								</motion.div>
							)
						})
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
