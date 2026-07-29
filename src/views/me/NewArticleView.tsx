'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleService } from '@/services/article/article.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ArticleType } from '@/types/article.type'

const ARTICLE_TYPES = [
	{ value: ArticleType.QUEST, label: 'Квест', icon: 'lucide:map' },
	{ value: ArticleType.GUIDE, label: 'Гайд', icon: 'lucide:book-open' },
	{ value: ArticleType.OTHER, label: 'Другое', icon: 'lucide:file-text' },
]

const ADMIN_TYPES = [
	...ARTICLE_TYPES,
	{ value: ArticleType.STALHUB, label: 'StalHub', icon: 'lucide:star' },
]

export default function NewArticleView() {
	const router = useRouter()
	const queryClient = getQueryClient()
	const [title, setTitle] = useState('')
	const [type, setType] = useState<ArticleType>(ArticleType.OTHER)
	const user = useAuthStore((s) => s.user)
	const isAdmin = user?.roles?.some((r) => r.name === 'ADMIN')

	const types = isAdmin ? ADMIN_TYPES : ARTICLE_TYPES

	const createMutation = useMutation({
		mutationFn: (data: {
			title: string
			content: string
			type: ArticleType
		}) => articleService.create(data),
		onSuccess: (article) => {
			queryClient.invalidateQueries({ queryKey: ['articles'] })
			toast.success('Статья создана')
			router.push(`/me/articles/${article.id}/edit`)
		},
		onError: () => {
			toast.error('Ошибка при создании')
		},
	})

	const handleCreate = () => {
		if (!title.trim()) return
		createMutation.mutate({ title: title.trim(), content: '', type })
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<Button
					className="p-2.5"
					onClick={() => router.back()}
					variant={'ghost'}
				>
					<Icon className="size-5" icon="lucide:arrow-left" />
				</Button>
				<h1 className="font-semibold text-lg">Новая статья</h1>
			</div>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<label
						className="font-semibold text-md text-text-accent"
						htmlFor="article-title"
					>
						Название
					</label>
					<Input
						autoFocus
						id="article-title"
						label="Введите название статьи"
						onChange={(e) => setTitle(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && title.trim())
								handleCreate()
						}}
						value={title}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<span className="font-semibold text-md text-text-accent">
						Тип статьи
					</span>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{types.map((t) => (
							<button
								className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 font-semibold text-sm transition-colors ${
									type === t.value
										? 'border-sky-500 bg-sky-500/10 text-sky-400'
										: 'border-border-secondary bg-background hover:border-sky-500/30'
								}`}
								key={t.value}
								onClick={() => setType(t.value)}
								type="button"
							>
								<Icon className="size-4" icon={t.icon} />
								{t.label}
							</button>
						))}
					</div>
				</div>

				<Button
					disabled={!title.trim() || createMutation.isPending}
					loading={createMutation.isPending}
					onClick={handleCreate}
				>
					Создать и открыть редактор
				</Button>
			</div>
		</div>
	)
}
