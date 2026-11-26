'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import {
	getCategoryTitle,
	getGroupColumns,
	type NavGroup,
	type NavItem,
} from '@/constants/nav.const'
import { cn } from '@/lib/cn'

type NavDropdownProps = {
	group: NavGroup
	isOpen: boolean
	onOpen: () => void
	onClose: () => void
	onToggle: () => void
}

const ITEMS_PER_COLUMN = 5

function MegaItem({ item }: { item: NavItem }) {
	const t = useTranslations()

	if (!item.href && !item.submenu?.length) return null

	return (
		<div className="min-w-0">
			{item.href ? (
				<CLink
					className="group/link hover:bg-accent/70 flex items-start justify-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200"
					externalIcon={false}
					href={item.href}
					variant={'none'}
				>
					<Icon
						aria-hidden="true"
						className="text-muted-foreground group-hover/link:text-primary mt-0.5 shrink-0 text-[20px] transition-colors"
						icon={item.icon}
					/>
					<span className="flex min-w-0 flex-col gap-1">
						<span
							className={`${mtsWide.className} text-foreground group-hover/link:text-primary truncate text-sm leading-tight font-semibold transition-colors`}
						>
							{t(item.labelKey)}
						</span>
						{item.descriptionKey && (
							<span
								className={`${mtsWide.className} text-muted-foreground line-clamp-3 text-xs leading-snug font-medium`}
							>
								{t(item.descriptionKey)}
							</span>
						)}
					</span>
				</CLink>
			) : (
				<div className="flex items-start gap-3 px-3 py-2.5">
					<Icon
						aria-hidden="true"
						className="text-muted-foreground mt-0.5 shrink-0 text-[20px]"
						icon={item.icon}
					/>
					<span className="flex min-w-0 flex-col gap-1">
						<span
							className={`${mtsWide.className} text-foreground group-hover/link:text-primary truncate text-sm leading-tight font-semibold transition-colors`}
						>
							{t(item.labelKey)}
						</span>
						{item.descriptionKey && (
							<span
								className={`${mtsWide.className} text-muted-foreground line-clamp-3 text-xs leading-snug font-medium`}
							>
								{t(item.descriptionKey)}
							</span>
						)}
					</span>
				</div>
			)}

			{item.submenu && item.submenu.length > 0 && (
				<div className="border-border ml-3 flex flex-col gap-0.5 border-l pl-2">
					{item.submenu.map((sub) => (
						<CLink
							className="group/sub text-muted-foreground hover:bg-accent/70 hover:text-foreground flex items-center justify-start gap-2 truncate rounded-md px-2 py-1 text-[13px] font-medium transition-colors"
							externalIcon={false}
							href={sub.href ?? '#'}
							key={sub.key}
							variant={'none'}
						>
							<Icon
								aria-hidden="true"
								className="group-hover/sub:text-primary shrink-0 text-[15px] transition-colors"
								icon={sub.icon}
							/>
							<span
								className={`${mtsWide.className} text-muted-foreground line-clamp-3 text-xs leading-snug font-medium`}
							>
								{t(sub.labelKey)}
							</span>
						</CLink>
					))}
				</div>
			)}
		</div>
	)
}

export default function NavDropdown({
	group,
	isOpen,
	onOpen,
	onClose,
	onToggle,
}: NavDropdownProps) {
	const t = useTranslations()

	const columns = useMemo(
		() => getGroupColumns(group, ITEMS_PER_COLUMN),
		[group]
	)
	const colCount = Math.max(1, columns.length)

	const panelWidthClass =
		colCount === 1
			? 'w-[min(380px,calc(100vw-2rem))]'
			: colCount === 2
				? 'w-[min(620px,calc(100vw-2rem))]'
				: colCount === 3
					? 'w-[min(1020px,calc(100vw-2rem))]'
					: 'w-[min(1240px,calc(100vw-2rem))]'

	return (
		<>
			<button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className={cn(
					`${mtsWide.className} flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-[15px] font-medium transition-all duration-200 outline-none`,
					isOpen
						? 'bg-accent text-foreground'
						: 'text-foreground hover:bg-accent/60 border-transparent'
				)}
				onClick={onToggle}
				onMouseEnter={onOpen}
				type="button"
			>
				<span>{t(group.titleKey)}</span>
				<Icon
					aria-hidden="true"
					className={cn(
						'text-[15px]',
						isOpen ? 'text-foreground' : 'text-muted-foreground'
					)}
					icon="lucide:chevrons-up-down"
				/>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 1, y: 0, scale: 1 }}
						className={cn(
							'absolute top-full left-1/2 z-90 -translate-x-1/2 pt-3',
							panelWidthClass
						)}
						exit={{ opacity: 0, y: 8, scale: 0.98 }}
						initial={{ opacity: 0, y: 8, scale: 0.98 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}
					>
						<div
							className="border-primary/30 bg-card shadow-muted max-h-[calc(100dvh-7.5rem)] overflow-y-auto rounded-2xl border-2 shadow-2xl backdrop-blur-xl"
							onMouseLeave={onClose}
							role="menu"
						>
							<div
								className={cn(
									'grid',
									colCount > 1 &&
										'divide-primary/30 divide-x',
									colCount === 1 && 'grid-cols-1',
									colCount === 2 && 'grid-cols-2',
									colCount === 3 &&
										'grid-cols-2 sm:grid-cols-3',
									colCount >= 4 &&
										'grid-cols-2 lg:grid-cols-4'
								)}
							>
								{columns.map((col) => (
									<div
										className="flex min-w-0 flex-col gap-0.5 p-3"
										key={col.key}
									>
										{(col.titleKey ?? col.title) && (
											<p
												className={`${mtsWide.className} text-muted-foreground truncate px-3 pt-1 pb-1.5 text-sm font-medium`}
											>
												{getCategoryTitle(t, col)}
											</p>
										)}
										{col.items.map((item) => (
											<MegaItem
												item={item}
												key={item.key}
											/>
										))}
									</div>
								))}
							</div>

							{group.href && (
								<div className="border-primary/30 flex items-center justify-between gap-4 border-t px-5 py-3">
									<CLink
										className="group/more text-primary flex items-center gap-1.5 text-[13.5px] font-semibold transition-opacity hover:opacity-80"
										externalIcon={false}
										href={group.href}
									>
										<span>{t(group.titleKey)}</span>
										<Icon
											className="text-[15px] transition-transform duration-200 group-hover/more:translate-x-0.5"
											icon="lucide:arrow-right"
										/>
									</CLink>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
