import { readFile } from 'node:fs/promises'
import path from 'node:path'
import TOSView from '@/views/legal/TOSView'

export default async function TOSPage() {
	const filePath = path.join(process.cwd(), 'src/app/legal/tos/tos.mdx')
	const source = await readFile(filePath, 'utf-8')

	return <TOSView source={source} />
}