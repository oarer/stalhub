'use client'

import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import Image from 'next/image'

import { unbounded } from '../fonts'
import { CardHeader, CardLink } from '@/components/ui/card/Card'
import { useMaps } from '@/hooks/useMaps'
import { CustomToast } from '@/components/ui/Toast'
import type { Locale } from '@/types/item.type'

export default function MapList() {
    const { maps, error } = useMaps()
    const { t, i18n } = useTranslation()

    useEffect(() => {
        if (error) {
            CustomToast('Произошла ошибка при загрузке списка карт.', 'error')
        }
    }, [error])

    return (
        <main className="mx-auto flex max-w-[90rem] flex-col gap-12 px-4 pt-32 sm:px-6 md:px-8">
            <h1
                className={`${unbounded.className} bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-5xl dark:from-sky-400 dark:to-sky-200`}
            >
                {t('map.title')}
            </h1>

            <div
                className="xs:grid-cols-2 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-5"
                role="list"
            >
                {maps.map((m, index) => (
                    <CardLink
                        className="group overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        href={`/map/${encodeURIComponent(m.name)}`}
                        key={m.url ?? m.name}
                        role="listitem"
                        style={{
                            animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                        }}
                    >
                        <CardHeader className="relative h-40 overflow-hidden rounded-lg sm:h-48 md:h-56">
                            <Image
                                alt={m.name}
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 256px"
                                src={m.preview_image}
                            />
                        </CardHeader>

                        <div className="relative overflow-hidden bg-gradient-to-b px-3 py-4">
                            <span className="block text-center text-sm font-semibold transition-colors duration-300 group-hover:text-sky-500 sm:text-base">
                                {m.title[i18n.language as Locale]}
                            </span>
                            <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-300 group-hover:w-2/5" />
                        </div>
                    </CardLink>
                ))}
            </div>
        </main>
    )
}
