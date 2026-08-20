import type { AxiosError } from 'axios'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'
import UserProfileView from '@/views/users/UserProfileView'

type PageProps = {
	params: Promise<{ id: string }>
}

const isNumericId = (value: string) => /^\d+$/.test(value)

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const t = await getTranslations()

	try {
		const user = isNumericId(id)
			? await userService.getUser(Number(id))
			: await userService.getUserByUsername(id)

		const displayName = user.name ?? user.username
		const avatarUrl = `${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${user.id}`
		const description = t('users.profileDescription', {
			username: user.username,
		})

		return {
			title: `${displayName} · StalHub`,
			description,
			openGraph: {
				title: `${displayName} · StalHub`,
				description,
				type: 'profile',
				images: [{ url: avatarUrl, alt: user.username }],
			},
		}
	} catch {
		return {
			title: `${t('users.notFound')} · StalHub`,
			robots: { index: false, follow: true },
		}
	}
}

export default async function UserPage({ params }: PageProps) {
	const { id } = await params

	const queryClient = getQueryClient()
	const numericId = isNumericId(id) ? Number(id) : null

	try {
		if (numericId !== null) {
			await queryClient.prefetchQuery(userQueries.getUser(numericId))
		} else {
			await queryClient.prefetchQuery(userQueries.getUserByUsername(id))
		}
	} catch (e) {
		const status = (e as AxiosError).response?.status
		if (status === 404) {
			notFound()
		}
		throw e
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UserProfileView
				id={numericId}
				username={numericId === null ? id : null}
			/>
		</HydrationBoundary>
	)
}
