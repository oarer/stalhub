'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'

import { montserrat } from '@/app/fonts'
import { useUwuStore } from '@/store/useUwuStore'

const BuildHash = () => (
    <span className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
        <Icon className="h-4 w-4" icon="mdi:code-tags" />
        <Link
            className="text-blue-600 transition-colors hover:underline dark:text-blue-400"
            href={`https://github.com/${process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER}/${process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG}/tree/${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`}
            rel="noopener noreferrer"
            target="_blank"
            title={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
        >
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7)}
        </Link>
    </span>
)

export default function Footer() {
    const { uwuMode, toggleUwu } = useUwuStore()
    const year = new Date().getFullYear()

    const links = [
        {
            href: 'https://github.com/StalHub',
            title: 'Сообщить о баге на GitHub',
            icon: 'lucide:bug',
            label: 'Bug',
        },
        {
            href: 'https://t.me/StalHub',
            title: 'Новостной канал',
            icon: 'basil:telegram-outline',
            label: 'Telegram',
        },
        {
            href: 'https://discord.com/invite/TODO',
            title: 'Наш Discord',
            icon: 'ic:baseline-discord',
            label: 'Discord',
        },
    ]

    return (
        <footer className="outline-2 outline-neutral-300/40 backdrop-blur-xs dark:outline-neutral-700/40">
            <div
                className={`${montserrat.className} mx-auto flex max-w-[80rem] flex-col gap-8 px-6 py-8`}
            >
                <div className="grid grid-cols-1 gap-6 font-semibold md:grid-cols-3">
                    <section className="flex flex-col gap-3">
                        <p className="text-neutral-900 dark:text-neutral-100">
                            © StalHub, oarer &amp; Art3mLapa {year}
                        </p>
                        <BuildHash />
                        <button
                            className={`w-fit cursor-pointer transition-colors duration-400 hover:text-pink-400 ${uwuMode && 'text-pink-400'}`}
                            onClick={toggleUwu}
                        >
                            <p>{uwuMode ? 'uwu' : 'uwu?'}</p>
                        </button>
                    </section>

                    <section className="flex">
                        <p className="text-neutral-800 dark:text-neutral-100">
                            Сайт сделан{' '}
                            <Link
                                className="text-cyan-700 transition-colors duration-500 hover:text-sky-600 dark:text-cyan-400 dark:hover:text-sky-200"
                                href="https://oarer.space"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                @oarer
                            </Link>{' '}
                            и{' '}
                            <Link
                                className="text-cyan-700 transition-colors duration-500 hover:text-sky-600 dark:text-cyan-400 dark:hover:text-sky-200"
                                href="https://github.com/Art3mLapa"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                @Art3mLapa
                            </Link>{' '}
                            &lt;3
                        </p>
                    </section>

                    <nav className="flex flex-col items-start gap-3 md:items-end">
                        <ul className="flex flex-col gap-3">
                            {links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        className="group flex items-center gap-2 rounded px-1 py-0.5"
                                        href={link.href}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        title={link.title}
                                    >
                                        <Icon
                                            aria-hidden
                                            className="h-5 w-5 text-neutral-500 transition-colors duration-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-50"
                                            icon={link.icon}
                                        />
                                        <span className="text-left text-sm text-neutral-700 duration-500 dark:text-neutral-200 dark:group-hover:text-neutral-50">
                                            {link.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-neutral-300/20 py-8 text-sm font-semibold dark:border-neutral-700/20">
                    <p className="text-neutral-700 dark:text-neutral-400">
                        Проект с{' '}
                        <Link
                            className="relative text-neutral-900 duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-400 after:transition-all hover:text-sky-600 hover:after:w-full dark:text-neutral-100 dark:hover:text-sky-400"
                            href="https://github.com/oarer/stalhub"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            открытым исходным кодом
                        </Link>
                        . Лицензия{' '}
                        <Link
                            className="relative text-neutral-900 duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-400 after:transition-all hover:text-sky-600 hover:after:w-full dark:text-neutral-100 dark:hover:text-sky-400"
                            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            CC BY-NC-SA 4.0
                        </Link>
                        .
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400/80">
                        Not an official EXBO East LLC service.
                    </p>
                </div>
            </div>
        </footer>
    )
}
