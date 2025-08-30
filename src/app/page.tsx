import FloatingIcons from '@/components/pages/landing/FloatingIcons'
import Hero from '@/components/pages/landing/Hero'
import Tools from '@/components/pages/landing/Tools'
import { raleway } from './fonts'

export default function HomePage() {
    return (
        <main
            className={`${raleway.className} relative mx-auto mt-24 mb-12 flex max-w-[95rem] flex-col gap-10 px-4 pt-12 xl:mt-0 dark:text-neutral-200/70`}
        >
            <FloatingIcons />
            <Hero />
            <Tools />
        </main>
    )
}
