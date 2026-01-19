import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { DropDownMobile, MobileLinks } from '@/constants/nav.const'
import useClickOutside from '@/hooks/useClickOutside'

const NavMobile = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	useClickOutside(menuRef, (event) => {
		if (buttonRef.current?.contains(event.target as Node)) return
		setIsMenuOpen(false)
	})

	const toggleMenu = () => setIsMenuOpen((prev) => !prev)
	const handleLinkClick = () => setIsMenuOpen(false)

	return (
		<>
			<button
				aria-controls="mobile-menu"
				aria-expanded={isMenuOpen}
				className="cursor-pointer items-center"
				onClick={toggleMenu}
				ref={buttonRef}
			>
				<Icon
					className="text-2xl text-black dark:text-white"
					icon="lucide:menu"
				/>
			</button>

			<div className="relative z-9" ref={menuRef}>
				<div
					className={clsx(
						'ring-border absolute top-14 min-w-80 origin-top-left rounded-2xl bg-neutral-100 p-4 shadow-md ring-2 transition-all duration-300 ease-in-out dark:bg-neutral-950 dark:text-neutral-100',
						isMenuOpen
							? 'translate-y-0 scale-100 opacity-100'
							: 'pointer-events-none -translate-y-4 scale-95 opacity-0'
					)}
					id="mobile-menu"
				>
					<Accordion
						className="flex flex-col gap-4"
						defaultExpandedKeys={[]}
						items={DropDownMobile()}
						selectionMode="single"
						size="sm"
					/>

					<div className="mt-6 grid gap-4">
						{MobileLinks.map((socLink) => (
							<Link
								className="flex items-center gap-2 rounded-xl duration-500 hover:scale-[98%] hover:opacity-70 active:scale-[95%] active:opacity-50"
								href={socLink.href}
								key={socLink.iconName}
								onClick={handleLinkClick}
							>
								<Icon
									className="text-2xl"
									icon={socLink.iconName}
								/>
								<span className="font-semibold">
									{socLink.title}
								</span>
								<Icon
									className="ml-auto size-5"
									icon="lucide:external-link"
								/>
							</Link>
						))}
					</div>
				</div>
			</div>
		</>
	)
}

export default NavMobile
