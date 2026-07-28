import ArticleEditorView from '@/views/me/ArticleEditorView'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return <ArticleEditorView articleId={id} />
}
