'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleService } from '@/services/article/article.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ArticleType } from '@/types/article.type'

const ARTICLE_TYPES = [
	{
		value: ArticleType.QUEST,
		label: 'me.newArticle.quest',
		icon: 'lucide:map',
	},
	{
		value: ArticleType.GUIDE,
		label: 'me.newArticle.guide',
		icon: 'lucide:book-open',
	},
	{
		value: ArticleType.OTHER,
		label: 'me.newArticle.other',
		icon: 'lucide:file-text',
	},
]

const ADMIN_TYPES = [
	...ARTICLE_TYPES,
	{
		value: ArticleType.STALHUB,
		label: 'me.newArticle.stalhub',
		icon: 'lucide:star',
	},
]

export default function NewArticleView() {
	const router = useRouter()
	const queryClient = getQueryClient()
	const t = useTranslations()
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
			toast.success(t('me.newArticle.toastCreated'))
			router.push(`/me/articles/${article.id}/edit`)
		},
		onError: () => {
			toast.error(t('me.newArticle.toastCreateError'))
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
				<h1 className="font-semibold text-lg">
					{t('me.newArticle.title')}
				</h1>
			</div>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<label
						className="font-semibold text-md text-text-accent"
						htmlFor="article-title"
					>
						{t('me.newArticle.name')}
					</label>
					<Input
						autoFocus
						id="article-title"
						label="me.newArticle.namePlaceholder"
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
						{t('me.newArticle.type')}
					</span>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{types.map((articleType) => (
							<Button
								className={`gap-2 ${
									type === articleType.value &&
									'ring-2 ring-border/80'
								}`}
								key={articleType.value}
								onClick={() => setType(articleType.value)}
								type="button"
								variant={'secondary'}
							>
								<Icon
									className="size-4"
									icon={articleType.icon}
								/>
								{t(articleType.label)}
							</Button>
						))}
					</div>
				</div>

				<Button
					disabled={!title.trim() || createMutation.isPending}
					loading={createMutation.isPending}
					onClick={handleCreate}
				>
					{t('me.newArticle.create')}
				</Button>
			</div>
		</div>
	)
}
