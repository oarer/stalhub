'use client'

import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import ItemSearchModal from '@/components/modals/ItemSearch'
import DropdownMenu from '@/components/ui/DropDown'
import { DropDownLinks } from '@/constants/nav.const'
import useSvg from '@/hooks/useSvg'
import ChangeLang from './components/ChangeLang'
import ChangeTheme from './components/ChangeTheme'
import NavMe from './components/NavMe'
import NavMobile from './NavMobile'

export default function Nav() {
	const svgPath = useSvg()

	const [isScrolled, setIsScrolled] = useState(false)
	const { scrollY } = useScroll()
	useMotionValueEvent(scrollY, 'change', (latest) => {
		setIsScrolled(!!latest)
	})

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
							className="transform justify-center duration-500 hover:opacity-80 active:scale-95"
							href="/"
						>
							<Image
								alt="logo"
								height={34}
								src={`${svgPath}logo.svg`}
								width={34}
							/>
						</Link>
					</div>
					<div className="hidden items-center gap-4 lg:flex xl:gap-6 2xl:gap-4">
						{DropDownLinks().map((menu, index) => (
							<DropdownMenu
								compact
								icon={menu?.icon}
								items={menu.items}
								key={index}
								placement="bottom-start"
								title={menu.title}
							/>
						))}
						<ItemSearchModal />
					</div>
					<div className="relative flex items-center justify-end gap-4">
						<div className="hidden items-center gap-2 lg:flex">
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
