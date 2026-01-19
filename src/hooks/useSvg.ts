'use client'

import { useEffect, useState } from 'react'

import { useTheme } from 'next-themes'

export default function useSvg(): string {
	const { theme, resolvedTheme } = useTheme()
	const [svgPath, setSvgPath] = useState<string>('')

	useEffect(() => {
		if (theme || resolvedTheme) {
			const currentTheme = theme === 'system' ? resolvedTheme : theme
			const baseUrl = ''
			const path =
				currentTheme === 'dark'
					? `${baseUrl}/svg/dark/`
					: `${baseUrl}/svg/light/`
			setSvgPath(path)
		}
	}, [theme, resolvedTheme])

	return svgPath
}
