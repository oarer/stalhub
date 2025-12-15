import type { FC } from 'react'

import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'

export const NumericVariantsCard: FC<{
    numericVariants: number
    onChange: (v: number) => void
}> = ({ numericVariants, onChange }) => (
    <Card>
        <CardContent className="flex items-center justify-between">
            <p className="text-lg font-semibold">Заточка</p>
            <Input
                className="w-fit px-2 py-2"
                max={15}
                min={0}
                onChange={(e) => onChange(Number(e.target.value))}
                type="number"
                value={numericVariants}
            />
        </CardContent>
    </Card>
)
