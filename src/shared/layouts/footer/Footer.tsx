'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import { footerLinks } from '@/constants/footer.const'
import { useUwuStore } from '@/stores/useUwu.store'
import { StatusWidget } from './Status'

// HUGE thanks to KryptonFox (GitHub: @kryptonFox) for this code snippet <3
const BuildHash = () => (
	<span className="flex items-center text-text-accent">
		<Icon className="h-4 w-4" icon="mdi:code-tags" />
		build@
		<Link
			className="text-primary transition-colors hover:underline"
			href={`https://github.com/oarer/stalhub/tree/${process.env.NEXT_PUBLIC_GIT_COMMIT_SHA}`}
			rel="noopener noreferrer"
			target="_blank"
			title={process.env.NEXT_PUBLIC_GIT_COMMIT_SHA}
		>
			{process.env.NEXT_PUBLIC_GIT_COMMIT_SHA?.slice(0, 7)}
		</Link>
	</span>
)

const Footer = () => {
	const { uwuMode, toggleUwu } = useUwuStore()
	const year = new Date().getFullYear()
	const t = useTranslations()

	return (
		<footer className="outline-2 outline-primary/40 backdrop-blur-xs">
			<div
				className={`${montserrat.className} mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8`}
			>
				<div className="grid grid-cols-1 gap-6 font-semibold md:grid-cols-3">
					<section className="flex flex-col gap-3">
						<p className="text-foreground">
							© StalHub, oarer &amp; Art3mLapa {year}
						</p>
						<BuildHash />
						<StatusWidget />
						<button
							className={`w-fit cursor-pointer transition-colors duration-400 hover:text-pink-400 ${uwuMode && 'text-pink-400'}`}
							onClick={toggleUwu}
						>
							<p>{uwuMode ? 'uwu' : 'uwu?'}</p>
						</button>
					</section>

					<section className="flex">
						<p className="text-foreground">
							{t('footer.made_by')}
							<Link
								className="text-info transition-colors duration-500 hover:text-primary"
								href="https://oarer.fun"
								rel="noopener noreferrer"
								target="_blank"
							>
								@oarer
							</Link>
							{t('footer.and')}
							<Link
								className="text-info transition-colors duration-500 hover:text-primary"
								href="https://github.com/Art3mLapa"
								rel="noopener noreferrer"
								target="_blank"
							>
								@Art3mLapa
							</Link>{' '}
							&lt;3
						</p>
					</section>

					<nav className="flex flex-col gap-3 md:items-end">
						<ul className="flex flex-col items-start gap-3">
							{footerLinks.map((link) => (
								<li key={link.href}>
									<CLink
										className="group flex items-center gap-2 rounded px-1 py-0.5"
										href={link.href}
										title={t(link.title)}
										variant={'none'}
									>
										<Icon
											aria-hidden
											className="h-5 w-5"
											icon={link.icon}
										/>
										<span className="text-left text-muted-foreground text-sm duration-500 group-hover:text-foreground">
											{t(link.title)}
										</span>
									</CLink>
								</li>
							))}
						</ul>
					</nav>
				</div>

				<div className="border-primary/30 border-t py-8 font-semibold text-sm">
					<p className="text-muted-foreground">
						{t('footer.project.with')}
						<Link
							className="relative text-foreground duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full"
							href="https://github.com/oarer/stalhub"
							rel="noopener noreferrer"
							target="_blank"
						>
							{t('footer.project.open_source')}
						</Link>
						. {t('footer.project.license')}
						<Link
							className="relative text-foreground duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full"
							href="https://www.gnu.org/licenses/gpl-3.0.html"
							rel="noopener noreferrer"
							target="_blank"
						>
							GPL-3.0
						</Link>
						.
					</p>
					<p className="text-muted-foreground/80">
						Not an official EXBO East LLC service.
					</p>
				</div>
			</div>
		</footer>
	)
}

export default function FooterLayout() {
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

	return <Footer />
}
