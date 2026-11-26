'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { mtsExtended, mtsWide } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import {
	type FooterLink,
	footerDocs,
	footerLinks,
} from '@/constants/footer.const'
import { useUwuStore } from '@/stores/useUwu.store'
import { StatusWidget } from './Status'

// HUGE thanks to KryptonFox (GitHub: @kryptonFox) for this code snippet <3
const BuildHash = () => {
	const sha = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA

	return (
		<p className="flex items-center gap-1">
			<Icon
				aria-hidden
				className="size-4 shrink-0"
				icon="mdi:code-tags"
			/>
			<span
				className={`${mtsWide.className} text-sm leading-none font-medium`}
			>
				build@
				<CLink
					className="text-foreground/80 hover:text-primary px-0 py-0 font-medium hover:underline"
					externalIcon={false}
					href={`https://github.com/oarer/stalhub/tree/${sha}`}
					title={sha}
					variant="none"
				>
					{sha?.slice(0, 7) ?? '404'}
				</CLink>
			</span>
		</p>
	)
}

const UwuToggle = () => {
	const { uwuMode, toggleUwu } = useUwuStore()

	return (
		<button
			className={`${mtsWide.className} w-fit cursor-pointer text-sm font-semibold transition-colors duration-500 hover:text-pink-400 ${uwuMode ? 'text-pink-400' : 'text-muted-foreground'}`}
			onClick={toggleUwu}
			type="button"
		>
			{uwuMode ? 'no uwu plz' : 'uwu?'}
		</button>
	)
}

const FooterCredits = () => {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2">
			<p
				className={`${mtsWide.className} text-foreground/80 flex items-center gap-2 text-[14px] leading-none font-semibold tracking-widest lowercase`}
			>
				{t('footer.made_by')}
				<Link
					className="text-primary/60 hover:text-primary transition-colors duration-500"
					href="https://oarer.dev"
					rel="noopener noreferrer"
					target="_blank"
				>
					@oarer
				</Link>
			</p>
			<UwuToggle />
		</div>
	)
}

const FooterNav = ({
	links,
	titleKey,
}: {
	links: FooterLink[]
	titleKey: string
}) => {
	const t = useTranslations()

	return (
		<nav className="flex flex-col items-start gap-1">
			<h2
				className={`${mtsWide.className} text-primary text-[15px] font-bold tracking-widest uppercase italic`}
			>
				{t(titleKey)}
			</h2>
			<ul className="flex flex-col items-start gap-2.5">
				{links.map((link) => (
					<li key={link.href}>
						<CLink
							className="group flex items-center gap-2 rounded px-0 py-0.5"
							externalIcon={false}
							href={link.href}
							title={t(link.title)}
							variant="none"
						>
							<Icon
								aria-hidden
								className="text-muted-foreground/70 group-hover:text-primary size-4 shrink-0 duration-500"
								icon={link.icon}
							/>
							<span
								className={`${mtsWide.className} text-muted-foreground group-hover:text-foreground text-[14px] font-medium duration-500`}
							>
								{t(link.title)}
							</span>
						</CLink>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default function FooterLayout() {
	const t = useTranslations()
	const pathname = usePathname()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	if (
		pathname.startsWith('/map') ||
		pathname.startsWith('/calcs/hideout') ||
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/me/onboarding')
	)
		return null

	return (
		<footer className="relative mx-auto size-full max-w-[105rem] overflow-hidden px-6 pt-20 pb-24 lg:px-12 lg:pt-28 lg:pb-0">
			<div className="flex flex-col gap-8">
				<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
					<div className="flex flex-col gap-3">
						<h2
							className={`${mtsWide.className} text-foreground text-[15px] font-semibold`}
						>
							{t('footer.brand', {
								year: new Date().getFullYear(),
							})}
						</h2>

						<FooterCredits />
					</div>

					<div className="flex flex-col items-start gap-2">
						<h2
							className={`${mtsWide.className} text-primary text-[15px] font-bold tracking-widest uppercase italic`}
						>
							Информация
						</h2>
						<StatusWidget />
						<BuildHash />
					</div>

					<FooterNav
						links={footerLinks}
						titleKey="footer.titles.links"
					/>
					<FooterNav
						links={footerDocs}
						titleKey="footer.titles.docs"
					/>
				</div>

				<div className="border-primary/50 flex flex-col gap-1 border-t py-6">
					<p
						className={`${mtsExtended.className} text-muted-foreground text-sm font-medium`}
					>
						{t('footer.project.with')}
						<CLink
							className="text-foreground after:bg-primary hover:text-primary relative px-0 py-0 text-sm font-medium duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
							externalIcon={false}
							href="https://github.com/oarer/stalhub"
							variant="none"
						>
							{t('footer.project.open_source')}
						</CLink>
						. {t('footer.project.license')}
						<CLink
							className="text-foreground after:bg-primary hover:text-primary relative px-0 py-0 text-sm font-medium duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:transition-all hover:after:w-full"
							externalIcon={false}
							href="https://www.gnu.org/licenses/gpl-3.0.html"
							variant="none"
						>
							GPL-3.0
						</CLink>
						.
					</p>
					<p
						className={`${mtsExtended.className} text-muted-foreground/80 text-sm font-medium tracking-widest`}
					>
						Not an official EXBO East LLC service.
					</p>
				</div>
			</div>

			<svg
				aria-hidden
				aria-label="stalhub"
				className="text-foreground hidden w-full lg:-ml-3 lg:block"
				preserveAspectRatio="xMidYMid meet"
				viewBox="0 0 1000 200"
			>
				<text
					className={`${mtsWide.className} font-bold`}
					fill="none"
					fontSize="180"
					stroke="currentColor"
					strokeOpacity="0.08"
					strokeWidth="4"
					textAnchor="end"
					x="1000"
					y="220"
				>
					STALHUB
				</text>
			</svg>
		</footer>
	)
}
