export interface RoadMap {
    name: string
    desc: string
    icon: string
    status: 'review' | 'inDev' | 'production' | 'cancel'
    subTask?: RoadMap[]
}

export const statusConfig = {
    review: {
        label: 'На рассмотрении',
        icon: 'mdi:clock-outline',
        color: 'text-sky-600 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-600',
        bgColor: 'bg-sky-50 dark:bg-sky-900/25',
    },
    inDev: {
        label: 'В разработке',
        icon: 'mdi:code-braces',
        color: 'text-orange-600 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/25',
    },
    production: {
        label: 'Продакшн',
        icon: 'mdi:check-circle',
        color: 'text-green-600 dark:text-green-300',
        border: 'border-green-200 dark:border-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/25',
    },
    cancel: {
        label: 'Отменено',
        icon: 'mdi:close-circle',
        color: 'text-red-600 dark:text-red-300',
        border: 'border-red-200 dark:border-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/25',
    },
}

export const roadMap: RoadMap[] = [
    {
        name: 'Начальная страница',
        desc: 'Титульная и приветствующая страница для новых пользователей',
        icon: 'lucide:home',
        status: 'production',
        subTask: [
            {
                name: 'Дизайн сайта',
                desc: 'Подобрана палитра, стиль и концепт будущего сайта',
                icon: 'lucide:palette',
                status: 'production',
            },
            {
                name: 'UI составляющее сайта',
                desc: 'UI-библиотека для создания инструментов и компонентов в едином стиле',
                icon: 'lucide:layout',
                status: 'production',
            },
        ],
    },
    {
        name: 'Интерактивная карта',
        desc: 'Карты всех локаций и метки событий',
        icon: 'lucide:map',
        status: 'inDev',
        subTask: [
            {
                name: 'Карты всех локаций',
                desc: 'Южная зона, Любеч-3, Северная зона и локации ивентовых событий',
                icon: 'lucide:map-pin',
                status: 'inDev',
            },
            {
                name: 'Метки всех спотов, тайников, пузырей и аванпостов',
                desc: 'Метки событий с изображениями и информацией об открытии',
                icon: 'lucide:flag',
                status: 'inDev',
            },
            {
                name: 'Функция экспорта меток',
                desc: 'Экспорт меток событий в игру через замену файлов конфига',
                icon: 'lucide:download',
                status: 'review',
            },
        ],
    },
    {
        name: 'Аукцион',
        desc: 'Инструмент для просмотра и анализа лотов аукциона',
        icon: 'lucide:gavel',
        status: 'review',
        subTask: [
            {
                name: 'Просмотр последних лотов',
                desc: 'Страница с последними выложенными лотами аукциона',
                icon: 'lucide:list',
                status: 'review',
            },
            {
                name: 'Отслеживание графика цены',
                desc: 'Поиск и отслеживание цены конкретного предмета',
                icon: 'lucide:trending-up',
                status: 'review',
            },
            {
                name: 'Выгодные лоты',
                desc: 'Отображение резко упавших в цене предметов и выгодных лотов',
                icon: 'lucide:tag',
                status: 'review',
            },
        ],
    },
    {
        name: 'Поиск игроков',
        desc: 'Список последних и популярных персонажей в поиске',
        icon: 'lucide:users',
        status: 'review',
        subTask: [
            {
                name: 'Страница с персонажами',
                desc: 'Список по 5 последних и популярных персонажей',
                icon: 'lucide:user',
                status: 'review',
            },
        ],
    },
    {
        name: 'Просмотр моделей',
        desc: 'Справочник и 3D-предпросмотр предметов',
        icon: 'lucide:package',
        status: 'review',
        subTask: [
            {
                name: 'Справочник базовых вещей',
                desc: 'Википедия с базовыми вещами из EXBO Database',
                icon: 'lucide:book',
                status: 'review',
            },
            {
                name: 'Справочник недостающих вещей',
                desc: 'Добавление вещей, отсутствующих в EXBO Database',
                icon: 'lucide:book-plus',
                status: 'review',
            },
            {
                name: '3D предпросмотр',
                desc: 'Примерка обвесов и краски на оружие и броню',
                icon: 'lucide:view',
                status: 'review',
            },
        ],
    },
    {
        name: 'Калькулятор сборок',
        desc: 'Система сохранения сборок в локальном хранилище',
        icon: 'lucide:calculator',
        status: 'inDev',
        subTask: [
            {
                name: 'Система сохранения сборок',
                desc: 'Сохранение сборки в локальном хранилище браузера',
                icon: 'lucide:save',
                status: 'inDev',
            },
        ],
    },
    {
        name: 'Калькулятор ТТК',
        desc: 'Калькулятор времени до убийства',
        icon: 'lucide:clock',
        status: 'inDev',
    },
    {
        name: 'Обменные монеты',
        desc: 'Система для работы с обменными монетами',
        icon: 'lucide:coins',
        status: 'inDev',
    },
    {
        name: 'Сезонный пропуск',
        desc: 'Информация и отслеживание сезонного пропуска',
        icon: 'lucide:ticket',
        status: 'inDev',
    },
    {
        name: 'Чувствительность',
        desc: 'Настройка чувствительности для игры',
        icon: 'lucide:sliders',
        status: 'inDev',
    },
    {
        name: 'КВ Карты',
        desc: 'Холст для тактик и сохранения в локальном хранилище',
        icon: 'lucide:map',
        status: 'cancel',
        subTask: [
            {
                name: 'Холст для рисования',
                desc: 'Холст для тактик с метками палаток, баррикад и отрядов',
                icon: 'lucide:brush',
                status: 'cancel',
            },
            {
                name: 'Сохранение тактик',
                desc: 'Сохранение тактик в локальном хранилище',
                icon: 'lucide:save',
                status: 'cancel',
            },
        ],
    },
    {
        name: 'Сбор отрядов',
        desc: 'Сохранение отрядов с их снаряжением',
        icon: 'lucide:users',
        status: 'cancel',
    },
    {
        name: 'Рейтинг кланов',
        desc: 'Отслеживание рейтинга кланов в реальном времени',
        icon: 'lucide:bar-chart',
        status: 'inDev',
        subTask: [
            {
                name: 'Отслеживание рейтинга',
                desc: 'Рейтинг кланов в реальном времени без перезагрузки',
                icon: 'lucide:refresh-cw',
                status: 'inDev',
            },
        ],
    },
]
