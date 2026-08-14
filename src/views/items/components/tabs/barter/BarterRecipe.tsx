import { useTranslations } from 'next-intl'
import { Combobox } from '@/components/ui/Combobox'
import type {
	BarterRecipeResult,
	CurrencyType,
} from '@/types/barter.type'
import type { Locale } from '@/types/item.type'
import {
	applyDiscount,
	calculateBarterAmount,
	formatBarterAmount,
} from '@/utils/barterUtils'
import { BarterItem } from './BarterItem'
import { DISCOUNTS } from './constants'

type Props = {
	recipes: BarterRecipeResult[]
	locale: Locale
	selectedRecipe: number
	selectedCurrency: CurrencyType
	selectedDiscount: number
	onRecipeChange: (index: number) => void
	onCurrencyChange: (currency: CurrencyType) => void
	onDiscountChange: (discount: number) => void
}

const currencyOptions: { label: string; value: CurrencyType }[] = [
	{ label: 'barter.currency_options.barter', value: 'barter' },
	{
		label: 'barter.currency_options.barter_coins',
		value: 'barter_coins',
	},
	{
		label: 'barter.currency_options.crimson_shell',
		value: 'crimson_shell',
	},
]

export function BarterRecipe({
	recipes,
	locale,
	selectedRecipe,
	selectedCurrency,
	selectedDiscount,
	onRecipeChange,
	onCurrencyChange,
	onDiscountChange,
}: Props) {
	const t = useTranslations()

	const hasMultipleRecipes = recipes.length > 1

	const discountOptions = DISCOUNTS.map((d) => ({
		label: d === 0 ? 'barter.discount_options.none' : `${d}%`,
		value: String(d),
	}))

	return (
		<div
			className="flex flex-col gap-3"
			key={`${recipes[selectedRecipe].money}-${selectedRecipe}`}
		>
			<div className="flex items-center justify-between gap-3">
				{hasMultipleRecipes && (
					<div className="w-32">
						<Combobox
							onValueChange={(value) =>
								onRecipeChange(Number(value))
							}
							options={recipes.map((_, index) => ({
								label: t('barter.recipe', {
									number: index + 1,
								}),
								value: String(index),
							}))}
							placeholder="barter.recipe"
							value={String(selectedRecipe)}
						/>
					</div>
				)}
				<p className="font-mono font-semibold text-sm">
					{t('barter.money')}:{' '}
					{formatBarterAmount(
						applyDiscount(
							recipes[selectedRecipe]?.money ?? 0,
							selectedDiscount
						)
					)}{' '}
					₽
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<div className="w-40">
					<Combobox
						onValueChange={(value) =>
							onCurrencyChange(value as CurrencyType)
						}
						options={currencyOptions}
						placeholder="barter.currency"
						value={selectedCurrency}
					/>
				</div>
				<div className="w-32">
					<Combobox
						onValueChange={(value) =>
							onDiscountChange(Number(value))
						}
						options={discountOptions}
						placeholder="barter.discount"
						value={String(selectedDiscount)}
					/>
				</div>
			</div>

			<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
				{recipes[selectedRecipe].items.map((item, itemIndex) => (
					<BarterItem
						amount={calculateBarterAmount(
							item,
							selectedCurrency,
							selectedDiscount
						)}
						item={item}
						key={`${item.category}-${itemIndex}`}
						locale={locale}
					/>
				))}
			</div>
		</div>
	)
}
