export function resolveImageUrl(src: string | null | undefined): string | null {
	if (!src) return null
	if (src.startsWith('/') && !src.startsWith('//'))
		return `${process.env.NEXT_PUBLIC_API}${src}`
	return src
}
