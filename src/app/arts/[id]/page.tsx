import { Icon } from '@iconify/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { montserrat } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { articleService } from '@/services/article/article.service'

type PageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const t = await getTranslations()

	// from api
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
	const ogImageUrl = `${baseUrl}/api/og/${id}`

	try {
		const article = await articleService.get(id)
		const images = article.image_url
			? [{ url: article.image_url, width: 1200, height: 630 }]
			: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						type: 'image/svg+xml' as const,
					},
				]

		const description = t('arts.byAuthor', {
			author: article.author.username,
		})

		return {
			title: `${article.title} · StalHub`,
			description,
			openGraph: {
				title: `${article.title} · StalHub`,
				description,
				type: 'article',
				publishedTime: article.created_at,
				modifiedTime: article.updated_at,
				authors: [article.author.username],
				tags: article.tags,
				images,
			},
		}
	} catch {
		return {
			title: `${t('articles.notFound')} · StalHub`,
			robots: { index: false, follow: true },
		}
	}
}

export default async function ArtPage({ params }: PageProps) {
	const { id } = await params
	const t = await getTranslations()

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-28 pb-12 md:px-8 xl:pt-32">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="flex min-h-100 min-w-0 items-center justify-center overflow-hidden rounded-xl bg-background ring-2 ring-border/40">
					<Image
						alt="art name"
						className="block h-auto max-h-[calc(100vh-9rem)] w-auto max-w-full object-contain"
						height={1600}
						src="/images/art.jpg"
						width={1200}
					/>
				</div>

				<aside className="flex min-w-0 flex-col gap-4">
					<div className="flex gap-2">
						<Button
							className="flex gap-2 rounded-lg p-2.5"
							variant="secondary"
						>
							<Icon
								className="text-xl"
								icon="lucide:image-down"
							/>
						</Button>
						<Button
							className="flex gap-2 rounded-lg p-2.5"
							variant="secondary"
						>
							<Icon className="text-xl" icon="lucide:link" />
						</Button>
						<Button
							className="flex gap-2 rounded-lg p-2.5"
							variant="secondary"
						>
							<Icon className="text-xl" icon="lucide:star" />
						</Button>
					</div>
					<div className="flex flex-col gap-2 rounded-xl bg-background p-4 ring-2 ring-border/40">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-sm text-text-accent">
								Автор
							</span>

							<span className="font-semibold text-text-accent">
								свиномания
							</span>
						</div>

						<Divider />

						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="font-semibold text-text-accent text-xs">
									Звёзд
								</p>
								<p
									className={`${montserrat.className} font-semibold text-sm text-text-accent`}
								>
									52
								</p>
							</div>

							<div>
								<p className="font-semibold text-text-accent text-xs">
									Просмотров
								</p>
								<p
									className={`${montserrat.className} font-semibold text-sm text-text-accent`}
								>
									52
								</p>
							</div>

							<div className="col-span-2">
								<p className="font-semibold text-text-accent text-xs">
									Дата публикации
								</p>
								<p
									className={`${montserrat.className} font-semibold text-sm text-text-accent`}
								>
									22.22.22
								</p>
							</div>
						</div>
					</div>

					<Accordion
						accordionClass="ring-2 border-0 ring-border/40"
						items={[
							{
								key: 'description',
								title: t('arts.description'),
								icon: 'lucide:book',
								content: (
									<p className="font-semibold text-sm text-text-accent leading-6">
										Lorem ipsum dolor sit amet, consectetur
										adipiscing elit, sed do eiusmod tempor
										incididunt ut labore et dolore magna
										aliqua. Ut enim ad minim veniam, quis
										nostrud exercitation ullamco laboris
										nisi ut aliquip ex ea commodo consequat.
									</p>
								),
							},
						]}
						size="sm"
					/>
				</aside>
			</div>
		</section>
	)
}
