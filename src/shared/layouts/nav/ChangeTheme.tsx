import { type FC, useRef, useState } from 'react'

import { useTheme } from 'next-themes'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'

import useClickOutside from '@/hooks/useClickOutside'

interface Theme {
    name: string
    title: string
    iconName: string
}

const themes: Theme[] = [
    { name: 'system', title: 'Системная', iconName: 'lucide:laptop-minimal' },
    { name: 'dark', title: 'Тёмная', iconName: 'lucide:moon-star' },
    { name: 'light', title: 'Светлая', iconName: 'lucide:sun' },
]

const ThemeToggle: FC = () => {
    const { theme, setTheme } = useTheme()
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useClickOutside(menuRef, () => setIsMenuOpen(false))

    const handleChange = (theme: string) => {
        setTheme(theme)
        setIsMenuOpen(false)
    }

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
                    {theme === 'system' ? (
                        <Icon
                            className="text-2xl"
                            icon="lucide:laptop-minimal"
                        />
                    ) : theme === 'dark' ? (
                        <Icon className="text-2xl" icon="lucide:moon-star" />
                    ) : (
                        <Icon className="text-2xl" icon="lucide:sun" />
                    )}
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
                        className="ring-border absolute right-0 z-20 mt-5 flex origin-top-right flex-col gap-4 rounded-2xl bg-white/60 p-6 shadow-lg ring-2 backdrop-blur-lg dark:bg-neutral-900/70 dark:ring-[1.5px]"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {themes.map((theme) => (
                            <button
                                className="flex cursor-pointer items-center gap-2 transition-all duration-400 hover:opacity-70 active:opacity-50"
                                key={theme.name}
                                onClick={() => handleChange(theme.name)}
                            >
                                <Icon
                                    className="text-2xl"
                                    icon={theme.iconName}
                                />
                                <p className="font-semibold">{theme.title}</p>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ThemeToggle
