import type { Metadata } from 'next'
import raw from '@/constants/meta.json'

type MetaValue = Omit<Metadata, 'other'> & {
	other?: Record<string, string>
}

type MetaSchema = {
	base: MetaValue
	notFound: MetaValue
} & Record<string, MetaValue | undefined>

const meta = raw as MetaSchema

export function getMetadataByPath(path: string | undefined): Metadata {
	const base = meta.base

	if (!path) return base

	const pageMeta = meta[path] as MetaValue | undefined

	if (!pageMeta) return base

	const { other, ...rest } = pageMeta

	return {
		...base,
		...rest,
		...(other ? { other } : {}),
	}
}
