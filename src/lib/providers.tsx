'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

import { I18nextProvider, initReactI18next } from 'react-i18next'

import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import i18n from 'i18next'

import { UwuProvider } from '@/providers/uwuProvider'
import en from '@/locales/en.json'
import ru from '@/locales/ru.json'
import fr from '@/locales/fr.json'
import es from '@/locales/es.json'

interface Props {
    children: ReactNode
}

export default function Providers({ children }: Props) {
    const [mounted, setMounted] = useState(false)
    const [i18nReady, setI18nReady] = useState(false)
    const queryClient = useRef<QueryClient>(new QueryClient())

    useEffect(() => {
        setMounted(true)

        if (!i18n.isInitialized) {
            const lang =
                typeof document !== 'undefined'
                    ? document.cookie.match(/(?:^|; )lang=([^;]*)/)?.[1] || 'en'
                    : 'en'

            i18n.use(initReactI18next)
                .init({
                    resources: {
                        en: { translation: en },
                        ru: { translation: ru },
                        es: { translation: es },
                        fr: { translation: fr },
                    },
                    lng: lang,
                    fallbackLng: 'ru',
                    interpolation: {
                        escapeValue: false,
                    },
                })
                .then(() => setI18nReady(true))
        } else {
            setI18nReady(true)
        }
    }, [])

    if (!mounted || !i18nReady) return null

    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider attribute="class" enableSystem>
                <QueryClientProvider client={queryClient.current}>
                    <UwuProvider>
                        <Toaster position="bottom-right" />
                        {children}
                    </UwuProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </I18nextProvider>
    )
}
