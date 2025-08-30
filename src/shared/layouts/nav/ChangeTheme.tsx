import { type FC, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Icon } from '@iconify/react'

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
                className="relative flex cursor-pointer items-center justify-center rounded-full p-5 opacity-70 duration-500 hover:scale-[98%] hover:bg-neutral-300/60 hover:opacity-100 active:scale-[95%] active:opacity-50 hover:dark:bg-neutral-700/30"
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

            <div
                className={`absolute right-0 z-20 mt-5 flex origin-top-right flex-col gap-4 rounded-2xl border-2 border-neutral-800 bg-neutral-100 p-6 transition-opacity duration-500 dark:border-neutral-500 dark:bg-neutral-950 dark:text-neutral-100 ${
                    isMenuOpen
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0'
                }`}
            >
                {themes.map((theme) => (
                    <button
                        className="flex cursor-pointer items-center gap-2 transition-opacity duration-500 hover:opacity-70 active:opacity-50"
                        key={theme.name}
                        onClick={() => handleChange(theme.name)}
                    >
                        <Icon className="text-2xl" icon={theme.iconName} />
                        <p>{theme.title}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ThemeToggle
