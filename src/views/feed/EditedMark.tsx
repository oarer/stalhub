import { useTranslations } from 'next-intl'
import type { PostEditedBy } from '@/types/post.type'

export function EditedMark({ editedBy }: { editedBy: PostEditedBy }) {
	const t = useTranslations()
	return (
		<span className="text-foreground/80 text-xs italic">
			·{' '}
			{t('post.editedBy', {
				username: editedBy.username,
			})}
		</span>
	)
}
