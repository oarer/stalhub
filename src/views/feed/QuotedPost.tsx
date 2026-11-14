import Image from 'next/image'
import Link from 'next/link'
import type { PostRepostOf } from '@/types/post.type'

export function QuotedPost({ repost }: { repost: PostRepostOf }) {
	const images = repost.image_urls ?? []
	return (
		<Link
			className="flex flex-col gap-1.5 rounded-lg border border-primary/20 bg-muted/30 p-3 transition-colors hover:border-primary/40"
			href={`/posts/${repost.external_id}`}
		>
			<span className="flex items-center gap-1.5 font-medium text-primary text-xs">
				{repost.author?.username ?? repost.author_name}
				<time
					className="font-mono text-[11px] text-foreground"
					dateTime={repost.created_at}
				>
					{new Date(repost.created_at).toLocaleDateString()}
				</time>
			</span>
			{repost.title && (
				<span className="font-semibold text-primary text-sm">
					{repost.title}
				</span>
			)}
			<span className="line-clamp-4 whitespace-pre-wrap text-foreground text-sm">
				{repost.content}
			</span>
			{images.length > 0 && (
				<span className="flex gap-1.5">
					{images.slice(0, 3).map((url) => (
						<Image
							alt=""
							className="h-20 w-32 rounded-md object-cover"
							height={80}
							key={url}
							src={url}
							unoptimized
							width={128}
						/>
					))}
				</span>
			)}
		</Link>
	)
}
