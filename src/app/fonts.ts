import { Montserrat, Raleway, Roboto_Mono, Unbounded } from 'next/font/google'
import localFont from 'next/font/local'

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

export const mtsCompact = localFont({
	src: [
		{
			path: '../../public/fonts/mts/MTSCompact-Regular.woff2',
			weight: '400',
		},
		{
			path: '../../public/fonts/mts/MTSCompact-Medium.woff2',
			weight: '500',
		},
		{ path: '../../public/fonts/mts/MTSCompact-Bold.woff2', weight: '700' },
		{
			path: '../../public/fonts/mts/MTSCompact-Black.woff2',
			weight: '900',
		},
	],
	display: 'swap',
})

export const mtsText = localFont({
	src: [
		{ path: '../../public/fonts/mts/MTSText-Regular.woff2', weight: '400' },
		{ path: '../../public/fonts/mts/MTSText-Medium.woff2', weight: '500' },
		{ path: '../../public/fonts/mts/MTSText-Bold.woff2', weight: '700' },
		{ path: '../../public/fonts/mts/MTSText-Black.woff2', weight: '900' },
	],
	display: 'swap',
})

export const mtsWide = localFont({
	src: [
		{ path: '../../public/fonts/mts/MTSWide-Light.woff2', weight: '300' },
		{ path: '../../public/fonts/mts/MTSWide-Regular.woff2', weight: '400' },
		{ path: '../../public/fonts/mts/MTSWide-Medium.woff2', weight: '500' },
		{ path: '../../public/fonts/mts/MTSWide-Bold.woff2', weight: '700' },
		{ path: '../../public/fonts/mts/MTSWide-Black.woff2', weight: '900' },
	],
	display: 'swap',
})

export const mtsExtended = localFont({
	src: [
		{
			path: '../../public/fonts/mts/MTSExtended-Regular.woff2',
			weight: '400',
		},
		{
			path: '../../public/fonts/mts/MTSExtended-Medium.woff2',
			weight: '500',
		},
		{
			path: '../../public/fonts/mts/MTSExtended-Bold.woff2',
			weight: '700',
		},
		{
			path: '../../public/fonts/mts/MTSExtended-Black.woff2',
			weight: '900',
		},
	],
	display: 'swap',
})

export const mtsUltraExtended = localFont({
	src: [
		{
			path: '../../public/fonts/mts/MTSUltraExtended-Light.woff2',
			weight: '300',
		},
		{
			path: '../../public/fonts/mts/MTSUltraExtended-Regular.woff2',
			weight: '400',
		},
		{
			path: '../../public/fonts/mts/MTSUltraExtended-Bold.woff2',
			weight: '700',
		},
		{
			path: '../../public/fonts/mts/MTSUltraExtended-Black.woff2',
			weight: '900',
		},
	],
	display: 'swap',
})
