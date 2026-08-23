import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { BannerMode, BannerType } from '@/types/user.type'

interface MeBannerProps {
	bannerMode: BannerMode
	bannerType: BannerType
	bannerColor?: string
	bannerImage?: string | null
	className?: string
}

export default function MeBanner({
	bannerMode,
	bannerType,
	bannerColor,
	bannerImage,
	className,
}: MeBannerProps) {
	if (bannerMode === 'NONE') return null

	const isBackground = bannerType === 'BACKGROUND'

	return (
		<div
			className={cn(
				isBackground
					? 'fixed inset-0 -z-1'
					: 'relative h-32 w-full overflow-hidden rounded-xl',
				className
			)}
		>
			{bannerMode === 'COLOR' ? (
				<div
					className="absolute inset-0"
					style={{ backgroundColor: bannerColor || '#000000' }}
				/>
			) : bannerImage ? (
				<>
					<Image
						alt="banner"
						className="object-cover"
						fill
						priority
						src={`${process.env.NEXT_PUBLIC_API}${bannerImage}`}
						unoptimized
					/>
					<div className="absolute inset-0 bg-black/40" />
				</>
			) : null}
		</div>
	)
}
