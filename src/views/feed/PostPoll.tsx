'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { getQueryClient } from '@/providers/QueryProvider'
import { postService } from '@/services/post/post.service'
import type { PostPoll as PostPollType } from '@/types/post.type'

export function PostPoll({
	postId,
	poll,
}: {
	postId: string
	poll: PostPollType
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [selected, setSelected] = useState<number[]>(
		poll.my_vote_option_ids ?? []
	)
	const hasVoted = (poll.my_vote_option_ids ?? []).length > 0
	const voteMutation = useMutation({
		mutationFn: () => postService.votePoll(postId, selected),
		onSuccess: (post) => {
			queryClient.setQueryData(['post', postId], post)
			queryClient.invalidateQueries({ queryKey: ['feed'] })
		},
	})
	const retractMutation = useMutation({
		mutationFn: () => postService.retractPollVote(postId),
		onSuccess: (post) => {
			setSelected([])
			queryClient.setQueryData(['post', postId], post)
			queryClient.invalidateQueries({ queryKey: ['feed'] })
		},
	})
	const total = Math.max(poll.total_votes, 1)

	return (
		<div
			className="border-primary/25 bg-card/60 flex flex-col gap-3 rounded-lg border p-4"
			onClick={(event) => event.stopPropagation()}
		>
			<div className="text-primary flex items-center gap-2 font-semibold">
				<Icon icon="lucide:bar-chart-3" />
				{poll.question}
			</div>
			<div className="flex flex-col gap-2">
				{poll.options.map((option) => {
					const percent = Math.round(
						(option.votes_count / total) * 100
					)
					const checked = selected.includes(option.id)
					return (
						<label
							className="border-primary/20 relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-md border px-3 py-2 text-sm"
							key={option.id}
						>
							{(hasVoted || poll.total_votes > 0) && (
								<span
									className="bg-primary/10 absolute inset-y-0 left-0"
									style={{ width: `${percent}%` }}
								/>
							)}
							<input
								checked={checked}
								className="accent-primary relative z-1"
								name={`poll-${postId}`}
								onChange={() =>
									setSelected((current) =>
										poll.type === 'single'
											? current.includes(option.id)
												? []
												: [option.id]
											: current.includes(option.id)
												? current.filter(
														(id) => id !== option.id
													)
												: [...current, option.id]
									)
								}
								type={
									poll.type === 'single'
										? 'radio'
										: 'checkbox'
								}
							/>
							<span className="relative z-1 flex-1">
								{option.text}
							</span>
							{(hasVoted || poll.total_votes > 0) && (
								<span className="relative z-1 font-mono text-xs">
									{percent}%
								</span>
							)}
						</label>
					)
				})}
			</div>
			<div className="text-foreground flex items-center justify-between gap-2 text-xs">
				<span>{t('post.poll.votes', { count: poll.total_votes })}</span>
				<div className="flex gap-2">
					{hasVoted && (
						<Button
							disabled={retractMutation.isPending}
							onClick={() => retractMutation.mutate()}
							size="sm"
							variant="ghost"
						>
							{t('post.poll.retract')}
						</Button>
					)}
					<Button
						disabled={!selected.length || voteMutation.isPending}
						onClick={() => voteMutation.mutate()}
						size="sm"
						variant="secondary"
					>
						{t('post.poll.vote')}
					</Button>
				</div>
			</div>
		</div>
	)
}
