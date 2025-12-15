'use client'

import React, { useState, useMemo, useCallback } from 'react'

import { Icon } from '@iconify/react'
import Image from 'next/image'

import { useDebounce } from '@/hooks/useDebounce'
import { infoColorMap, LOCALE } from '@/types/item.type'
import Input from '@/components/ui/Input'
import { CardHeader, CardLink, CardTitle } from '@/components/ui/Card'
import { usePreparedSearch } from '@/hooks/usePreparedSearch'
import { Modal } from '@/components/ui/Modal'
import { type ItemListing } from '@/types/api.type'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '../ui/Skeleton'

const PAGE_STEP = 15

const ItemCard = React.memo(function ItemCard({ item }: { item: ItemListing }) {
    const name = item.name?.[LOCALE] ?? item.data ?? '—'
    const iconPath = `https://raw.githubusercontent.com/oarer/sc-db/main/merged${item.icon}`

    return (
        <CardLink href={item.data.replace(/\.json$/, '')}>
            <CardHeader className="flex flex-row items-center gap-4">
                <CardTitle>
                    <Image
                        alt={name}
                        height={44}
                        loading="lazy"
                        quality={80}
                        src={iconPath}
                        width={44}
                    />
                </CardTitle>
                <p
                    className="text-lg font-semibold"
                    style={{ color: infoColorMap[item.color] }}
                >
                    {name}
                </p>
            </CardHeader>
        </CardLink>
    )
})

export default function ItemSearchModal() {
    const [query, setQuery] = useState('')
    const [visibleCount, setVisibleCount] = useState(PAGE_STEP)

    const debouncedQuery = useDebounce(query, 150)
    const { filteredItems, loading, error } = usePreparedSearch(debouncedQuery)

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
        setVisibleCount(PAGE_STEP)
    }, [])

    const displayed = useMemo(
        () => filteredItems.slice(0, visibleCount),
        [filteredItems, visibleCount]
    )

    if (!loading) return <Skeleton className="size-8" />
    if (error) return <div className="p-4">Ошибка: {String(error)}</div>

    return (
        <Modal.Root>
            <Modal.Trigger className="hover:bg-background w-fit rounded-full p-3">
                <Icon className="text-lg" icon="lucide:search" />
            </Modal.Trigger>

            <Modal.Content>
                <Modal.Header>
                    <Modal.Title>Поиск предмета</Modal.Title>
                </Modal.Header>

                <Modal.Body className="grid gap-4">
                    <Input
                        className="p-2"
                        onChange={onChange}
                        placeholder="Введите название предмета"
                        type="text"
                        value={query}
                    />

                    {displayed.length === 0 && (
                        <p className="text-center text-gray-500">
                            Ничего не найдено
                        </p>
                    )}

                    <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto mask-y-from-95% mask-y-to-100% p-0.5">
                        {displayed.map((item) => (
                            <ItemCard item={item} key={item.key} />
                        ))}
                    </ul>

                    {filteredItems.length > visibleCount && (
                        <Button
                            className="mx-auto px-4 py-2"
                            onClick={() =>
                                setVisibleCount((v) => v + PAGE_STEP)
                            }
                            variant={'outline'}
                        >
                            <p className="font-semibold">Показать ещё</p>
                        </Button>
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    )
}
