'use client'

import { MDXRemote } from 'next-mdx-remote'
import { useEffect, useState } from 'react'
import { useMDXComponents } from '@/components/wiki/mdx-components'
import { compileMdx } from '@/lib/actions/mdx'

const EMPTY_SCOPE = {}
const EMPTY_FRONTMATTER = {}

export default function TOSView({ source }: { source: string }) {
	const components = useMDXComponents()
	const [compiledSource, setCompiledSource] = useState<string | null>(null)
	const [compileError, setCompileError] = useState(false)

	useEffect(() => {
		if (!source) return

		compileMdx(source)
			.then((result) => {
				setCompiledSource(result.compiledSource)
				setCompileError(false)
			})
			.catch(() => {
				setCompileError(true)
			})
	}, [source])

	return (
		<section className="mx-auto w-full max-w-4xl px-4 pt-34 pb-12 sm:px-6">
			{compiledSource ? (
				<div className="prose prose-neutral dark:prose-invert max-w-none contain-content">
					<MDXRemote
						compiledSource={compiledSource}
						components={components}
						frontmatter={EMPTY_FRONTMATTER}
						scope={EMPTY_SCOPE}
					/>
				</div>
			) : compileError ? (
				<p className="font-semibold text-red-400 text-sm">
					Не удалось загрузить документ
				</p>
			) : (
				<div className="flex items-center justify-center gap-2 py-16">
					<span className="font-semibold text-sm text-text-accent">
						Загрузка…
					</span>
				</div>
			)}
		</section>
	)
}
