'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { Switch } from '@/components/ui/Switch'
import { themes } from '@/constants/themes.const'
import useClickOutside from '@/hooks/useClickOutside'
import { getLocale } from '@/lib/getLocale'
import { useSettingsStore } from '@/stores/useSettings.store'
import ThemeGrid from './theme/ThemeGrid'

interface LocaleConfig {
	code: string
	title: string
	iconName: string
}

const locales: LocaleConfig[] = [
	{ code: 'ru', title: 'Русский', iconName: 'twemoji:flag-russia' },
	{ code: 'en', title: 'English', iconName: 'twemoji:flag-united-kingdom' },
	{ code: 'es', title: 'Español', iconName: 'twemoji:flag-spain' },
	{ code: 'fr', title: 'Français', iconName: 'twemoji:flag-france' },
	{ code: 'ko', title: '한국어', iconName: 'twemoji:flag-south-korea' },
]

export default function NavSettings() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [currentLocale, setCurrentLocale] = useState<string>('en')
	const menuRef = useRef<HTMLDivElement>(null)
	const router = useRouter()
	const { theme, setTheme } = useTheme()
	const { showUno, setShowUno } = useSettingsStore()
	const t = useTranslations()

	useClickOutside(menuRef, () => setIsMenuOpen(false))

	useEffect(() => {
		setCurrentLocale(getLocale())
	}, [])

	const handleLocaleChange = (newLocale: string) => {
		document.cookie = `lang=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
		setCurrentLocale(newLocale)
		setIsMenuOpen(false)
		router.refresh()
	}

	return (
		<div className="relative" ref={menuRef}>
			<button
				aria-label="Настройки"
				className="relative flex cursor-pointer items-center justify-center rounded-full p-5 opacity-70 duration-500 hover:bg-muted/60 hover:opacity-100 active:opacity-50"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
			>
				<div
					className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
						isMenuOpen ? 'opacity-0' : 'opacity-100'
					}`}
				>
					<Icon className="text-2xl" icon="lucide:settings" />
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
						className="absolute top-12 right-0 z-20 flex max-h-[calc(100dvh-6rem)] origin-top-right flex-row items-stretch gap-4 overflow-y-auto rounded-2xl bg-card/95 p-4 shadow-lg ring-2 ring-primary/30 backdrop-blur-xl"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
					>
						<div className="flex w-44 flex-col gap-1">
							{locales.map((loc) => (
								<Button
									className="justify-start gap-2"
									key={loc.code}
									onClick={() => handleLocaleChange(loc.code)}
									variant={'ghost'}
								>
									<Icon
										className="text-xl"
										icon={loc.iconName}
									/>
									<p
										className={`font-semibold text-sm ${
											currentLocale === loc.code
												? 'text-primary'
												: ''
										}`}
									>
										{loc.title}
									</p>
								</Button>
							))}
						</div>

						<Divider orientation="vertical" />

						<div className="flex w-56 flex-col gap-4">
							<div className="flex flex-col gap-1">
								{themes.map((th) => (
									<Button
										className="justify-start gap-2"
										key={th.name}
										onClick={() => {
											setTheme(th.name)
											setIsMenuOpen(false)
										}}
										variant={'ghost'}
									>
										<Icon
											className="text-xl"
											icon={th.iconName}
										/>
										<p
											className={`font-semibold text-sm ${
												theme === th.name
													? 'text-primary'
													: ''
											}`}
										>
											{t(th.title)}
										</p>
									</Button>
								))}
							</div>

							<ThemeGrid
								onThemeChanged={() => setIsMenuOpen(false)}
							/>
						</div>

						<Divider orientation="vertical" />

						<div className="flex w-36 flex-col items-center justify-center gap-3 px-2">
							<Icon className="text-3xl" icon="lucide:radar" />
							<p className="text-center font-semibold text-sm">
								{t('nav.uno')}
							</p>
							<Switch
								aria-label={t('nav.uno')}
								checked={showUno}
								onCheckedChange={setShowUno}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
