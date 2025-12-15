import FloatingIcons from '@/components/pages/landing/FloatingIcons'
import Hero from '@/components/pages/landing/Hero'
import Tools from '@/components/pages/landing/Tools'

export default function HomePage() {
    return (
        <main className="relative mx-auto mt-[104px] mb-12 flex max-w-380 flex-col gap-10 px-4 pt-12 xl:mt-0 dark:text-white/70">
            <FloatingIcons />
            <Hero />
            <Tools />
        </main>
    )
}
