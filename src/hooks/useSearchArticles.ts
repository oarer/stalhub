'use client'

import { useEffect, useState } from 'react'
import { articleService } from '@/services/article/article.service'
import type { Article } from '@/types/article.type'

let cache: Article[] | null = null
let inflight: Promise<Article[]> | null = null

const TAKE = 200

async function fetchArticles(): Promise<Article[]> {
	if (cache) return cache

	inflight ??= articleService
		.publicList({ take: TAKE, page: 1 })
		.then((res) => {
			cache = res.data
			return cache
		})
		.finally(() => {
			inflight = null
		})

	return inflight
}

export function useSearchArticles() {
	const [articles, setArticles] = useState<Article[]>(cache ?? [])
	const [loading, setLoading] = useState(!cache)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		fetchArticles()
			.then((result) => {
				if (cancelled) return
				setArticles(result)
				setLoading(false)
			})
			.catch(() => {
				if (cancelled) return
				setError('Failed to load articles')
				setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [])

	return { articles, loading, error }
}
