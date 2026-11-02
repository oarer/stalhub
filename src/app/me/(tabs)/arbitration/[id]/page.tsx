import { ArbitrationCaseView } from '@/views/commissions/ArbitrationView'
export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <ArbitrationCaseView id={id} key={id} />
}
