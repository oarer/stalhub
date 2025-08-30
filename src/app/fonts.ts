import { Raleway, Unbounded, Space_Mono, Montserrat } from 'next/font/google'

export const raleway = Raleway({
    weight: 'variable',
    subsets: ['latin', 'cyrillic'],
})

export const unbounded = Unbounded({
    weight: 'variable',
    subsets: ['latin', 'cyrillic'],
})

export const montserrat = Montserrat({
    weight: 'variable',
    subsets: ['latin', 'cyrillic'],
})

export const mono = Space_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
})
