import type { Metadata } from 'next'
import { Suspense } from 'react'

import '@/shared/styles/globals.css'
import { raleway } from '@/app/fonts'
import Nav from '@/shared/layouts/nav/Nav'
import Providers from './providers'
import { GridBackgroundWithBeams } from '../shared/Background'
import Footer from '@/shared/layouts/Footer'

export const metadata: Metadata = {
    title: 'StalHub',
    description: 'TODO',
    openGraph: {
        type: 'website',
        title: 'StalHub',
        description: 'TODO',
        url: 'https://stalhub.ru',
        siteName: 'StalHub',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html className="dark" lang="en" suppressHydrationWarning>
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
                <Suspense fallback={<div />}>
                    <Providers>
                        <Nav />
                        {children}
                    </Providers>

                    <Footer />
                </Suspense>
            </body>
        </html>
    )
}
