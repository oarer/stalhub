import OrderView from '@/views/commissions/OrderView'
export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <OrderView id={id} key={id} />
}
