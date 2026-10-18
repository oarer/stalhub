'use client'

import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mtsWide } from '@/app/fonts'
import ItemSearchModal from '@/components/modals/ItemSearch'
import { NAV_STRUCTURE } from '@/constants/nav.const'
import useSvg from '@/hooks/useSvg'
import ChangeLang from './components/ChangeLang'
import ChangeTheme from './components/ChangeTheme'
import NavDropdown from './components/NavDropdown'
import NavMe from './components/NavMe'
import NavMobile from './NavMobile'

const SZREPORT_VARIANTS = [
	{
		image: '/images/szreport/report.jpg',
		titleKey: 'nav.sz_report.news',
		href: 'https://t.me/+RNCSnbFYQt1lZDAy',
	},
	{
		image: '/images/szreport/promo.jpg',
		titleKey: 'nav.sz_report.promo',
		href: 'https://t.me/+uWz2wu5Biak1ZGEy',
	},
] as const

export default function Nav() {
	const svgPath = useSvg()
	const t = useTranslations()

	const [isScrolled, setIsScrolled] = useState(false)
	const { scrollY } = useScroll()

	const [openMenu, setOpenMenu] = useState<string | null>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	const [szReportIndex, setSzReportIndex] = useState(0)

	useMotionValueEvent(scrollY, 'change', (latest) => {
		setIsScrolled(!!latest)
	})

	const closeMenu = useCallback(() => setOpenMenu(null), [])

	useEffect(() => {
		setSzReportIndex(Math.floor(Math.random() * SZREPORT_VARIANTS.length))
	}, [])

	useEffect(() => {
		if (!openMenu) return
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeMenu()
		}
		const handlePointerDown = (event: PointerEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				closeMenu()
			}
		}
		document.addEventListener('keydown', handleEscape)
		document.addEventListener('pointerdown', handlePointerDown)
		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [openMenu, closeMenu])

	const szReport = SZREPORT_VARIANTS[szReportIndex]

	return (
		<motion.header
			animate={{
				paddingTop: isScrolled ? '1rem' : '2rem',
				paddingBottom: isScrolled ? '1rem' : '2rem',
			}}
			className={`fixed top-0 z-90 w-full items-center text-foreground backdrop-blur-sm transition-colors duration-500 ${
				isScrolled
					? 'outline-2 outline-primary/40'
					: 'outline-2 outline-primary/2'
			}`}
			initial={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
			transition={{ duration: 0.7 }}
		>
			<nav className="mx-auto xl:max-w-360">
				<div className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-10 lg:gap-3 lg:px-6 xl:gap-5 xl:px-10">
					<div className="lg:hidden">
						<NavMobile />
					</div>
					<div className="grid grid-flow-col items-center justify-start gap-3">
						<Link
							className="flex transform items-center justify-center gap-4 duration-500 hover:opacity-80 active:scale-95"
							href="/"
						>
							<Image
								alt="logo"
								height={28}
								src={`${svgPath}logo.svg`}
								width={28}
							/>
							<p
								className={`${mtsWide.className} hidden font-medium text-xl lg:block`}
							>
								Stalhub
							</p>
						</Link>
						<a
							className="block cursor-pointer lg:hidden"
							href={szReport.href}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Image
								alt="szreport"
								className="rounded-lg"
								height={32}
								src={szReport.image}
								width={32}
							/>
						</a>
					</div>
					<div
						className="relative hidden items-center lg:flex xl:gap-4"
						onMouseLeave={closeMenu}
						ref={menuRef}
					>
						{NAV_STRUCTURE.map((group) => (
							<NavDropdown
								group={group}
								isOpen={openMenu === group.key}
								key={group.key}
								onClose={closeMenu}
								onOpen={() => setOpenMenu(group.key)}
								onToggle={() =>
									setOpenMenu((prev) =>
										prev === group.key ? null : group.key
									)
								}
							/>
						))}
						<a
							className="hidden cursor-pointer items-center gap-2 rounded-lg p-1 transition-colors hover:bg-primary/40 lg:flex"
							href={szReport.href}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Image
								alt="szreport"
								className="rounded-lg"
								height={32}
								src={szReport.image}
								width={32}
							/>
							<span className="hidden text-primary xl:block">
								{t(szReport.titleKey)}
							</span>
						</a>
					</div>
					<div className="relative flex items-center justify-end gap-6">
						<div className="hidden items-center gap-2 lg:flex">
							<ItemSearchModal />
							<ChangeLang />
							<ChangeTheme />
						</div>
						<NavMe />
					</div>
				</div>
			</nav>
		</motion.header>
	)
}
