import { Suspense } from 'react'

import '@/shared/styles/index.css'
import { headers } from 'next/headers'
import Script from 'next/script'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { inter, mono, montserrat, raleway, unbounded } from '@/app/fonts'
import { getMetadataByPath } from '@/constants/meta'
import LocaleProvider from '@/providers/LocaleProvider'
import Providers from '@/providers/providers'
import { GridBackgroundWithBeams } from '@/shared/Background'
import Footer from '@/shared/layouts/footer/Footer'
import ThemeApplier from '@/shared/layouts/nav/components/theme/ThemeApplier'
import Nav from '@/shared/layouts/nav/Nav'
/* import PageTransitionEffect from '@/shared/transitionEffects/PageTransitionEffect' */

export const generateMetadata = async () => {
	const headersList = await headers()
	const path = headersList.get('X-Path')?.split('?')[0]

	return getMetadataByPath(path)
}

export default async function RootLayout({
	children,
}: LayoutProps<"/">) {
	const locale = await getLocale()
	const messages = await getMessages()

	return (
		<html
			className={`dark ${raleway.variable} ${montserrat.variable} ${unbounded.variable} ${mono.variable} ${inter.variable}`}
			data-scroll-behavior="smooth"
			lang={locale}
			suppressHydrationWarning
		>
			<body
				className={`${raleway.className} bg-background text-foreground transition-colors duration-500 ease-in-out`}
			>
				<GridBackgroundWithBeams
					cellSize={20}
					cols={100}
					glowIntensity={1.5}
					lineWidth={2}
					maxBeams={4}
					rows={100}
				/>
				<Script
					data-website-id="47f7941c-8d8d-4976-8cf0-690dfe79f522"
					defer
					src="https://umami.stalhub.dev/script.js"
				/>
				<Suspense fallback={<div />}>
					<ThemeProvider
						attribute="class"
						disableTransitionOnChange
						enableSystem
					>
						<ThemeApplier />
						<LocaleProvider locale={locale} messages={messages}>
							<Providers>
								<Nav />
								{/* <PageTransitionEffect> */}
								<main className="min-h-screen">{children}</main>
								<Footer />
								{/* </PageTransitionEffect> */}
							</Providers>
						</LocaleProvider>
					</ThemeProvider>
				</Suspense>
			</body>
		</html>
	)
}
