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
	footerCredits,
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
				className={`${mtsWide.className} font-medium text-sm leading-none`}
			>
				build@
				<CLink
					className="px-0 py-0 font-medium text-foreground/80 hover:text-primary hover:underline"
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
			className={`${mtsWide.className} w-fit cursor-pointer font-semibold text-sm transition-colors duration-500 hover:text-pink-400 ${uwuMode ? 'text-pink-400' : 'text-muted-foreground'}`}
			onClick={toggleUwu}
			type="button"
		>
			{uwuMode ? 'no uwu plz' : 'uwu?'}
		</button>
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
				className={`${mtsWide.className} font-bold text-[15px] text-primary uppercase italic tracking-widest`}
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
								className="size-4 shrink-0 text-muted-foreground/70 duration-500 group-hover:text-primary"
								icon={link.icon}
							/>
							<span
								className={`${mtsWide.className} font-medium text-[14px] text-muted-foreground duration-500 group-hover:text-foreground`}
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
							className={`${mtsWide.className} font-semibold text-[15px] text-foreground`}
						>
							{t('footer.brand', {
								year: new Date().getFullYear(),
							})}
						</h2>

						<div className="flex flex-col gap-2">
							{footerCredits.map((credit) => (
								<p
									className={`${mtsWide.className} font-semibold text-[14px] text-foreground/80 lowercase leading-none tracking-widest`}
									key={credit.href}
								>
									{t(credit.labelKey)}
									<Link
										className="text-primary/60 transition-colors duration-500 hover:text-primary"
										href={credit.href}
										rel="noopener noreferrer"
										target="_blank"
									>
										{credit.author}
									</Link>
								</p>
							))}
							<UwuToggle />
						</div>
					</div>

					<div className="flex flex-col items-start gap-2">
						<h2
							className={`${mtsWide.className} font-bold text-[15px] text-primary uppercase italic tracking-widest`}
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

				<div className="flex flex-col gap-1 border-primary/50 border-t py-6">
					<p
						className={`${mtsExtended.className} font-medium text-muted-foreground text-sm`}
					>
						{t('footer.project.with')}
						<CLink
							className="relative px-0 py-0 font-medium text-foreground text-sm duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full"
							externalIcon={false}
							href="https://github.com/oarer/stalhub"
							variant="none"
						>
							{t('footer.project.open_source')}
						</CLink>
						. {t('footer.project.license')}
						<CLink
							className="relative px-0 py-0 font-medium text-foreground text-sm duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full"
							externalIcon={false}
							href="https://www.gnu.org/licenses/gpl-3.0.html"
							variant="none"
						>
							GPL-3.0
						</CLink>
						.
					</p>
					<p
						className={`${mtsExtended.className} font-medium text-muted-foreground/80 text-sm tracking-widest`}
					>
						Not an official EXBO East LLC service.
					</p>
				</div>
			</div>

			<svg
				aria-hidden
				className="hidden w-full text-foreground lg:-ml-3 lg:block"
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
