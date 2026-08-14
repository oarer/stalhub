import { BarterCoins, CrimsonShell } from '@/constants/barter.const'
import type {
	BarterItemResult,
	CurrencyType,
} from '@/types/barter.type'

export const applyDiscount = (value: number, discount: number): number =>
	discount > 0 ? Math.ceil(value * ((100 - discount) / 100)) : value

export const calculateBarterAmount = (
	item: BarterItemResult,
	currency: CurrencyType,
	discount: number
): number => {
	const itemId = item.category.split('/').pop() ?? ''
	let amount = item.amount

	if (currency === 'barter_coins') {
		amount *= BarterCoins[itemId] ?? 1
	} else if (currency === 'crimson_shell') {
		amount *= CrimsonShell[itemId] ?? 1
	}

	return applyDiscount(amount, discount)
}

export const formatBarterAmount = (amount: number): string =>
	amount.toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})
