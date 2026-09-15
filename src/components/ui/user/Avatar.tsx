import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/cn'

interface AvatarCardProps extends Omit<ImageProps, 'src' | 'alt' | 'id'> {
	username: string
	id: number
}

export default function Avatar({
	username,
	id,
	className,
	...props
}: AvatarCardProps) {
	return (
		<Image
			{...props}
			alt={`${username}'s avatar`}
			className={cn('rounded-full object-contain', className)}
			src={`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${id}`}
			unoptimized
		/>
	)
}
