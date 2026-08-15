import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import useClickOutside from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'
import type { CardBackground, UpdateUserSettingsDto } from '@/types/user.type'

const bgVariantConfig: Record<CardBackground, { icon: string; label: string }> = {
	AVATAR: { icon: 'lucide:image', label: 'me.bg.avatar' },
	COLOR: { icon: 'lucide:palette', label: 'me.bg.color' },
	NONE: { icon: 'lucide:x', label: 'me.bg.none' },
}

export function BgVariantSelector({
	variant,
	color,
	mutate,
}: {
	variant: CardBackground
	color: string
	mutate: (data: UpdateUserSettingsDto) => void
}) {
	const t = useTranslations()
	const [expanded, setExpanded] = useState(false)
	const [displayVariant, setDisplayVariant] = useState(variant)
	const [opacity, setOpacity] = useState(1)
	const colorRef = useRef<HTMLInputElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

	useClickOutside(menuRef, () => setExpanded(false))

	const current = bgVariantConfig[displayVariant]

	const handleVariantChange = (next: CardBackground) => {
		if (next === variant) return setExpanded(false)
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		setOpacity(0)
		mutate({ cardBackground: next })

		timeoutRef.current = setTimeout(() => {
			setDisplayVariant(next)
			setOpacity(1)
		}, 200)

		if (next === 'COLOR') {
			setTimeout(() => colorRef.current?.click(), 0)
		}
	}

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		mutate({ cardColor: e.target.value })
	}

	return (
		<div className="relative" ref={menuRef}>
			<input
				className="sr-only"
				defaultValue={color}
				onChange={handleColorChange}
				ref={colorRef}
				tabIndex={-1}
				type="color"
			/>
			<button
				className={cn(
					'flex size-6.5 cursor-pointer items-center justify-center bg-accent text-text-accent transition-colors hover:bg-accent/50',
					expanded ? 'rounded-t-sm' : 'rounded-sm'
				)}
				onClick={() => setExpanded((v) => !v)}
			>
				<div
					className="transition-opacity duration-200"
					style={{ opacity }}
				>
					<Icon className="text-lg" icon={current.icon} />
				</div>
			</button>
			<AnimatePresence>
				{expanded && (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className={cn(
							'absolute top-full left-1/2 z-99 flex -translate-x-1/2 flex-col gap-1 bg-accent p-0.5',
							expanded ? 'rounded-b-sm' : 'rounded-sm'
						)}
						exit={{ opacity: 0, scale: 0.95 }}
						initial={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						{(
							Object.entries(bgVariantConfig) as [
								CardBackground,
								{ icon: string; label: string },
							][]
						).map(([key, cfg]) => (
							<div className="flex items-center gap-1" key={key}>
								<button
									className={cn(
										'flex size-5.5 cursor-pointer items-center justify-center rounded-sm transition-colors',
										variant === key
											? 'bg-background'
											: 'text-text-accent hover:bg-background'
									)}
									onClick={() => handleVariantChange(key)}
									title={t(cfg.label)}
								>
									<Icon className="size-4" icon={cfg.icon} />
								</button>
							</div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
