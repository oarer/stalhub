'use client'

import { useState } from 'react'

import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'

import ChangeTheme from './ChangeTheme'
import useSvg from '@/hooks/useSvg'
import NavMobile from './NavMobile'
import { DropDownLinks } from '@/constants/nav.const'
import DropdownMenu from '@/components/ui/DropDown'
import ChangeLang from './ChangeLang'
import ItemSearchModal from '@/components/modals/ItemSearch'

export default function Nav() {
    const svgPath = useSvg()

    const [isScrolled, setIsScrolled] = useState(false)
    const { scrollY } = useScroll()
    useMotionValueEvent(scrollY, 'change', (latest) => {
        setIsScrolled(!!latest)
    })

    return (
        <motion.header
            animate={{
                paddingTop: isScrolled ? '1rem' : '2rem',
                paddingBottom: isScrolled ? '1rem' : '2rem',
            }}
            className={`fixed top-0 isolate z-99 w-full items-center text-neutral-700 backdrop-blur-sm transition-colors duration-500 dark:text-neutral-100 ${
                isScrolled
                    ? 'outline-border/40 outline-2'
                    : 'outline-border/2 outline-2'
            }`}
            initial={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
            transition={{ duration: 0.7 }}
        >
            <nav className="mx-auto xl:max-w-360">
                <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
                    <div className="lg:hidden">
                        <NavMobile />
                    </div>
                    <div className="grid grid-flow-col items-center justify-start gap-3">
                        <Link
                            className="transform justify-center duration-500 hover:opacity-80 active:scale-95"
                            href="/"
                        >
                            <Image
                                alt="logo"
                                height={34}
                                src={`${svgPath}logo.svg`}
                                width={34}
                            />
                        </Link>
                    </div>
                    <div className="hidden items-center gap-8 lg:flex">
                        {DropDownLinks.map((menu, index) => (
                            <DropdownMenu
                                icon={menu?.icon}
                                items={menu.items}
                                key={index}
                                placement="bottom-start"
                                title={menu.title}
                            />
                        ))}
                        <ItemSearchModal />
                    </div>
                    <div className="relative flex items-center justify-end gap-3">
                        <ChangeLang />
                        <ChangeTheme />
                    </div>
                </div>
            </nav>
        </motion.header>
    )
}
