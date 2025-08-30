import { Icon } from '@iconify/react/dist/iconify.js'

import CLink from '@/components/ui/link/Link'
import type { AccordionItem } from '@/types/ui/accordion.type'
import { type DropdownMenuGroup } from '@/types/ui/dropdown.type'

export const Links = [
    {
        title: '',
        href: '/discord',
        iconName: 'ic:baseline-discord',
    },
]

export const MobileLinks = [
    {
        title: 'Discord',
        href: '/discord',
        iconName: 'ic:baseline-discord',
    },
]

export const DropDownLinks: DropdownMenuGroup[] = [
    {
        key: 'calculators',
        title: 'Калькуляторы',
        icon: 'lucide:calculator',
        items: [
            {
                key: 'art',
                label: 'Сборки',
                icon: 'lucide:package',
                description: 'Создайте сборку',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'TTK',
                label: 'ТТК',
                icon: 'lucide:timer-reset',
                description: 'Эффективность оружия',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'barter',
                label: 'Обменные монеты',
                icon: 'lucide:coins',
                description: 'Бартер в обменные монеты',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'bp',
                label: 'Сезонный пропуск',
                icon: 'lucide:ticket',
                description: 'Расчёт уровней',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'dpi',
                label: 'Чувствительность',
                icon: 'lucide:mouse',
                description: 'Настройка DPI',
                onClick: () => console.log('Profile clicked'),
            },
        ],
    },
    {
        key: 'сlans',
        title: 'Кланы',
        icon: 'lucide:shield-half',
        items: [
            {
                key: 'clanMaps',
                label: 'КВ карты',
                icon: 'lucide:map-pinned',
                description: 'Карты для колов',
                onClick: () => console.log('maps'),
            },
            {
                key: 'squads',
                label: 'Сбор отрядов',
                icon: 'lucide:radio-tower',
                description: 'Организация отрядов',
                disabled: true,
                onClick: () => console.log('squads'),
            },
            {
                key: 'top',
                label: 'Рейтинг кланов',
                icon: 'lucide:chart-no-axes-column',
                disabled: true,
                onClick: () => console.log('squads'),
            },
        ],
    },
    {
        key: 'other',
        title: 'Прочее',
        icon: 'lucide:more-horizontal',
        items: [
            {
                key: 'maps',
                label: 'Интерактивная карта',
                icon: 'lucide:map',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'auction',
                label: 'Аукцион',
                icon: 'lucide:landmark',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'players',
                label: 'Поиск игроков',
                icon: 'lucide:user-round-search',
                onClick: () => console.log('Profile clicked'),
            },
            {
                key: 'models',
                label: 'Просмотр моделей',
                icon: 'lucide:box',
                description: 'Скоро...',
                disabled: true,
                onClick: () => console.log('Profile clicked'),
            },
        ],
    },
]

export const DropDownMobile: AccordionItem[] = [
    {
        key: 'calculators',
        title: 'Калькуляторы',
        icon: 'lucide:calculator',
        content: (
            <div className="flex flex-col gap-2">
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:package" />
                    <p>Сборки</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:timer-reset" />
                    <p>ТТК</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:coins" />
                    <p>Обменные монеты</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:ticket" />
                    <p>Сезонный пропуск</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:mouse" />
                    <p>Чувствительность</p>
                </CLink>
            </div>
        ),
    },
    {
        key: 'clans',
        title: 'Кланы',
        icon: 'lucide:shield-half',
        content: (
            <div className="flex flex-col gap-2">
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:map-pinned" />
                    <p>КВ карты</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:radio-tower" />
                    <p>Сбор отрядов</p>
                </CLink>
                <CLink href="/art">
                    <Icon
                        className="text-xl"
                        icon="lucide:chart-no-axes-column"
                    />
                    <p>Рейтинг кланов</p>
                </CLink>
            </div>
        ),
    },
    {
        key: 'other',
        title: 'Прочее',
        icon: 'lucide:more-horizontal',
        content: (
            <div className="flex flex-col gap-2">
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:map" />
                    <p>Интерактивная карта</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:landmark" />
                    <p>Аукцион</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:user-round-search" />
                    <p>Поиск игроков</p>
                </CLink>
                <CLink href="/art">
                    <Icon className="text-xl" icon="lucide:box" />
                    <p>Просмотр моделей</p>
                </CLink>
            </div>
        ),
    },
]
