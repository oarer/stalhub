import { engineHtml } from '../engine-html'

export const dynamic = 'force-dynamic'

export function GET() {
	return engineHtml('export.html')
}
