import {
	ArticleCardsSkeleton,
	PageTitleSkeleton,
	PaginationSkeleton,
} from '@/components/ui/PageSkeletons'

export default function LoadingArticles() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<PageTitleSkeleton />
			<ArticleCardsSkeleton count={4} />
			<PaginationSkeleton />
		</section>
	)
}
