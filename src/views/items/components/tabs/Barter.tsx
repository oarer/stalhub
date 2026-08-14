import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { getLocale } from '@/lib/getLocale'
import type {
	BarterResponse,
	CurrencyType,
} from '@/types/barter.type'
import { BarterHeader } from './barter/BarterHeader'
import { BarterRecipe } from './barter/BarterRecipe'
import { BarterUsedIn } from './barter/BarterUsedIn'

type Props = {
	data: BarterResponse
}

export default function Barter({ data }: Props) {
	const locale = getLocale()
	const [selectedRecipe, setSelectedRecipe] = useState(0)
	const [selectedCurrency, setSelectedCurrency] =
		useState<CurrencyType>('barter')
	const [selectedDiscount, setSelectedDiscount] = useState(0)

	const recipes = data.recipes ?? []
	const hasRecipes = recipes.length > 0
	const hasUsedIn = (data.used_in?.length ?? 0) > 0

	return (
		<Card.Root className="space-y-3">
			<BarterHeader
				level={data.settlement_required_level}
				locale={locale}
				titles={data.settlement_titles}
			/>
			<Divider />
			<Card.Content className="flex flex-col gap-4">
				{hasRecipes && (
					<section className="flex flex-col gap-3">
						<BarterRecipe
							locale={locale}
							onCurrencyChange={(currency) =>
								setSelectedCurrency(currency)
							}
							onDiscountChange={(discount) =>
								setSelectedDiscount(discount)
							}
							onRecipeChange={(index) =>
								setSelectedRecipe(index)
							}
							recipes={recipes}
							selectedCurrency={selectedCurrency}
							selectedDiscount={selectedDiscount}
							selectedRecipe={selectedRecipe}
						/>
					</section>
				)}
				{hasUsedIn && (
					<BarterUsedIn
						items={data.used_in}
						locale={locale}
					/>
				)}
			</Card.Content>
		</Card.Root>
	)
}
