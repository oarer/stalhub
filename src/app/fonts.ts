import {
	Inter,
	Montserrat,
	Raleway,
	Roboto_Mono,
	Unbounded,
} from 'next/font/google'

export const raleway = Raleway({
	weight: 'variable',
	subsets: ['latin', 'cyrillic'],
	variable: '--font-raleway',
})

export const unbounded = Unbounded({
	weight: 'variable',
	subsets: ['latin', 'cyrillic'],
	variable: '--font-unbounded',
})

export const montserrat = Montserrat({
	weight: 'variable',
	subsets: ['latin', 'cyrillic'],
	variable: '--font-montserrat',
})

export const mono = Roboto_Mono({
	weight: 'variable',
	subsets: ['latin', 'cyrillic'],
	variable: '--font-roboto-mono',
})

export const inter = Inter({
	weight: 'variable',
	subsets: ['latin', 'cyrillic'],
	variable: '--font-inter',
})
