export function resolveImageUrl(src: string | null | undefined): string | null {
	if (!src) return null
	if (src.startsWith('/') && !src.startsWith('//'))
		return `${process.env.NEXT_PUBLIC_API}${src}`
	return src
}

export function isVideoUrl(src: string | null | undefined): boolean {
	if (!src) return false
	return /\.(mp4|webm)(\?.*)?$/i.test(src)
}
