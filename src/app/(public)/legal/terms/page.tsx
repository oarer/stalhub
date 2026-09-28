import { readFile } from 'node:fs/promises'
import path from 'node:path'
import TOSView from '@/views/legal/TOSView'

export default async function TermsPage() {
	const filePath = path.join(
		process.cwd(),
		'src/app/(public)/legal/terms/terms.mdx'
	)
	const source = await readFile(filePath, 'utf-8')

	return <TOSView source={source} />
}
