import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { themes } from '@/constants/themes.const'
import useClickOutside from '@/hooks/useClickOutside'
import ThemeGrid from '@/shared/layouts/nav/components/theme/ThemeGrid'

export default function ChangeTheme() {
	const { theme, setTheme } = useTheme()
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const t = useTranslations()

	useClickOutside(menuRef, () => setIsMenuOpen(false))

	const handleChange = (theme: string) => {
		setTheme(theme)
		setIsMenuOpen(false)
	}

	return (
		<div className="relative" ref={menuRef}>
			<button
				className="relative flex cursor-pointer items-center justify-center rounded-full p-5 opacity-70 duration-500 hover:bg-muted/60 hover:opacity-100 active:opacity-50"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
			>
				<div
					className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
						isMenuOpen ? 'opacity-0' : 'opacity-100'
					}`}
				>
					{theme === 'system' ? (
						<Icon
							className="text-2xl"
							icon="lucide:laptop-minimal"
						/>
					) : theme === 'dark' ? (
						<Icon className="text-2xl" icon="lucide:moon-star" />
					) : (
						<Icon className="text-2xl" icon="lucide:sun" />
					)}
				</div>
				<div
					className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
						isMenuOpen ? 'opacity-100' : 'opacity-0'
					}`}
				>
					<Icon className="text-3xl" icon="material-symbols:close" />
				</div>
			</button>

			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						animate={{ opacity: 1 }}
						className="absolute top-12 right-0 z-20 flex w-68 origin-top-right flex-col gap-4 rounded-2xl bg-card/95 p-4 shadow-lg ring-2 ring-primary/30 backdrop-blur-xl"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
					>
						<div className="flex flex-col gap-1">
							{themes.map((theme) => (
								<Button
									className="justify-start gap-2"
									key={theme.name}
									onClick={() => handleChange(theme.name)}
									variant={'ghost'}
								>
									<Icon
										className="text-xl"
										icon={theme.iconName}
									/>
									<p className="font-semibold text-sm">
										{t(theme.title)}
									</p>
								</Button>
							))}
						</div>

						<Divider />

						<ThemeGrid />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
