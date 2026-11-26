import Image from 'next/image'
import Link from 'next/link'
import type { PostRepostOf } from '@/types/post.type'

export function QuotedPost({ repost }: { repost: PostRepostOf }) {
	const images = repost.image_urls ?? []
	return (
		<Link
			className="border-primary/20 bg-muted/30 hover:border-primary/40 flex flex-col gap-1.5 rounded-lg border p-3 transition-colors"
			href={`/posts/${repost.external_id}`}
		>
			<span className="text-primary flex items-center gap-1.5 text-xs font-medium">
				{repost.author?.username ?? repost.author_name}
				<time
					className="text-foreground font-mono text-[11px]"
					dateTime={repost.created_at}
				>
					{new Date(repost.created_at).toLocaleDateString()}
				</time>
			</span>
			{repost.title && (
				<span className="text-primary text-sm font-semibold">
					{repost.title}
				</span>
			)}
			<span className="text-foreground line-clamp-4 text-sm whitespace-pre-wrap">
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
