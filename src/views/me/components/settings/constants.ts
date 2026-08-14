import type { BannerMode, BannerType, Layout } from '@/types/user.type'

export const LAYOUT_TYPES: { value: Layout; label: string }[] = [
	{ value: 'CLASSIC', label: 'me.settings.layoutClassic' },
	{ value: 'MODERN', label: 'me.settings.layoutModern' },
	{ value: 'COMPACT', label: 'me.settings.layoutCompact' },
]

export const BANNER_MODES: { value: BannerMode; label: string }[] = [
	{ value: 'NONE', label: 'me.settings.bannerModeNone' },
	{ value: 'COLOR', label: 'me.settings.bannerModeColor' },
	{ value: 'IMAGE', label: 'me.settings.bannerModeImage' },
]

export const BANNER_TYPES: { value: BannerType; label: string }[] = [
	{ value: 'BACKGROUND', label: 'me.settings.bannerTypeBackground' },
	{ value: 'HEADER', label: 'me.settings.bannerTypeHeader' },
]

export const findLabel = <T extends string>(
	options: { value: T; label: string }[],
	value: T | undefined,
	fallback: string
): string => options.find((option) => option.value === value)?.label ?? fallback
