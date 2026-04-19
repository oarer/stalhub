import type { Metadata } from 'next'
import { Suspense } from 'react'

import '@/shared/styles/index.css'
import { headers } from 'next/headers'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { raleway } from '@/app/fonts'
import meta from '@/constants/meta.json'
import Providers from '@/providers/providers'
import { GridBackgroundWithBeams } from '@/shared/Background'
import Footer from '@/shared/layouts/footer/Footer'
import InDevNav from '@/shared/layouts/nav/InDevNav'
import Nav from '@/shared/layouts/nav/Nav'

// thx AndcoolSystems <3
export const generateMetadata = async (): Promise<Metadata | undefined> => {
	const headersList = await headers()
	const path = headersList.get('X-Path')?.split('?')[0]
	const object = meta as { [key: string]: unknown }
	const base = meta.base

	if (!path) return base

	return {
		...base,
		...(object[path] as object),
	}
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const locale = await getLocale()
	const messages = await getMessages()

	return (
		<html className="dark" lang={locale} suppressHydrationWarning>
			<body
				className={`${raleway.className} bg-neutral-100 transition-colors duration-500 ease-in-out dark:bg-neutral-950`}
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
					src="https://umami.stalhub.tech/script.js"
				/>
				<Suspense fallback={<div />}>
					<ThemeProvider
						attribute="class"
						disableTransitionOnChange
						enableSystem
					>
						<NextIntlClientProvider messages={messages}>
							<Providers>
								<InDevNav />
								<Nav />
								<main className="min-h-screen">{children}</main>
								<Footer />
							</Providers>
						</NextIntlClientProvider>
					</ThemeProvider>
				</Suspense>
			</body>
		</html>
	)
}
