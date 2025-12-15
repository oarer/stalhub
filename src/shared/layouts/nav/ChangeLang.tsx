'use client'

import { useRef, useState, useEffect } from 'react'

import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'motion/react'

import useClickOutside from '@/hooks/useClickOutside'
import { getLocale } from '@/lib/getLocale'

interface Locale {
    code: string
    title: string
    iconName: string
}

const locales: Locale[] = [
    { code: 'ru', title: 'Русский', iconName: 'twemoji:flag-russia' },
    { code: 'en', title: 'English', iconName: 'twemoji:flag-united-kingdom' },
    { code: 'es', title: 'Español', iconName: 'twemoji:flag-spain' },
    { code: 'fr', title: 'Français', iconName: 'twemoji:flag-france' },
]

export default function ChangLang() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [currentLocale, setCurrentLocale] = useState<string>('en')
    const menuRef = useRef<HTMLDivElement>(null)

    useClickOutside(menuRef, () => setIsMenuOpen(false))

    useEffect(() => {
        setCurrentLocale(getLocale())
    }, [])

    const handleChange = (newLocale: string) => {
        document.cookie = `lang=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
        setCurrentLocale(newLocale)
        setIsMenuOpen(false)
    }

    const localeData = locales.find((l) => l.code === currentLocale)

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="relative flex cursor-pointer items-center justify-center rounded-full p-5 opacity-70 duration-500 hover:bg-neutral-300/60 hover:opacity-100 active:opacity-50 hover:dark:bg-neutral-700/30"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <div
                    className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
                        isMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    <Icon
                        className="text-2xl"
                        icon={localeData?.iconName || 'twemoji:flag-white'}
                    />
                </div>
                <div
                    className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
                        isMenuOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <Icon className="text-3xl" icon="material-symbols:close" />
                </div>
            </button>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="ring-border/30 bg-background/95 absolute top-12 right-0 z-20 flex origin-top-right flex-col gap-4 rounded-2xl p-6 shadow-lg ring-2 backdrop-blur-lg"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {locales.map((loc) => (
                            <button
                                className="flex cursor-pointer items-center gap-2 transition-all duration-400 hover:opacity-70 active:opacity-50"
                                key={loc.code}
                                onClick={() => handleChange(loc.code)}
                            >
                                <Icon
                                    className="text-2xl"
                                    icon={loc.iconName}
                                />
                                <p className="font-semibold">{loc.title}</p>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
