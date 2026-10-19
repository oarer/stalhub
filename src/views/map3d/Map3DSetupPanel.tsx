'use client'
import { Icon } from '@iconify/react'
import { useContext } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import DestinationMap from './DestinationMap'
import { gameFolderFiles } from './local-folder'
import Map3DGeckoModal from './Map3DGeckoModal'
import { Map3DContext } from './Map3DView'
import {
	preloadGroups,
	preparationComplete,
	sumPreparationTraffic,
	trafficLabel,
} from './preparation'
import type { EditorSettings } from './settings'

export default function Map3DSetupPanel() {
	const c = useContext(Map3DContext)
	if (!c) throw new Error('Map3DContext is not available')
	const {
		catalog,
		instance,
		setInstance,
		setReady,
		coordinates,
		setCoordinates,
		autoHeight,
		setAutoHeight,
		folder,
		setFolder,
		picking,
		folderPicked,
		fileInput,
		settings,
		change,
		ready,
		preparing,
		preparation,
		sceneWarm,
		previousTraffic,
		parentTraffic,
		folderHint,
		error,
		setError,
		launch,
		gecko,
	} = c
	const focus =
			'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[3px]',
		field = `w-full min-w-0 rounded-lg border border-border-secondary bg-card px-3 py-2.5 text-foreground [font:inherit] tabular-nums focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[3px]`

	return (
		<div className="relative mx-auto grid max-w-350 grid-cols-[minmax(0,1fr)_minmax(420px,540px)] gap-16 px-10 pt-12 pb-16 max-[1000px]:grid-cols-[minmax(0,1fr)_minmax(380px,1fr)] max-[760px]:grid-cols-1 max-[1000px]:gap-8 max-[760px]:gap-7 max-[1000px]:px-6 max-[760px]:px-5 max-[1000px]:py-8 max-[760px]:pt-7">
			<div className="flex flex-col gap-6">
				<div className="relative h-fit rounded-lg">
					<DestinationMap
						map={
							catalog.find(
								(r: { slug: string; map?: string | null }) =>
									r.slug === instance
							)?.map ?? 'map'
						}
						onSelect={(x, z) => {
							setCoordinates((c: string[]) => [
								x.toFixed(2),
								c[1],
								z.toFixed(2),
							])
							setAutoHeight(true)
						}}
						position={{
							x: Number(coordinates[0].replace(',', '.')),
							z: Number(coordinates[2].replace(',', '.')),
						}}
					/>
					<div className="relative flex items-center gap-3 rounded-b-lg bg-card px-5 pb-5 max-[1000px]:flex-wrap max-[760px]:p-3.5">
						<Icon
							className="text-2xl text-primary"
							icon="lucide:map-pin"
						/>
						<span className="text-[13px] leading-[1.6]">
							Точка появления
							<br />
							<strong>
								{coordinates[0]}, {coordinates[2]}
							</strong>
						</span>
						<span className="ml-auto text-[13px] text-muted-foreground leading-[1.6]">
							Карта {instance}
						</span>
					</div>
				</div>
				<section
					aria-label="Предзагрузка выбранной области"
					className="text-xs leading-[1.6]"
				>
					<div className="flex items-baseline justify-between gap-3 max-[760px]:flex-wrap">
						<strong className="text-sm">
							{preparationComplete(sceneWarm)
								? 'Можно отправляться — область готова'
								: preparing
									? 'Подготовим выбранное место'
									: 'Загружаем выбранную область'}
						</strong>
						<span className="whitespace-nowrap text-primary tabular-nums">
							{trafficLabel(
								sceneWarm?.network.transferBytes ??
									sumPreparationTraffic(
										previousTraffic.current,
										parentTraffic.current
									).transferBytes
							)}{' '}
							по сети за эту настройку
						</span>
					</div>
					<p className="mt-2 mb-4 max-w-none text-muted-foreground text-xs leading-[1.6]">
						{folder
							? 'Дальний обзор, объекты и текстуры сразу в выбранном качестве.'
							: 'Дальний обзор, объекты и текстуры в низком разрешении.'}{' '}
						При входе продолжаем использовать эту же сцену.
					</p>
					{sceneWarm ? (
						<>
							<dl className="grid grid-cols-3 gap-4 max-[760px]:gap-3">
								{[
									[
										'Блоки',
										sceneWarm.world.loaded,
										sceneWarm.world.selected,
									],
									[
										'Дальний обзор',
										sceneWarm.world.horizon?.ready ?? 0,
										sceneWarm.world.horizon?.wanted ?? 0,
									],
									[
										'Объекты',
										sceneWarm.world.objects
											?.completedChunks ?? 0,
										sceneWarm.world.objects?.chunks ?? 0,
									],
								].map(([label, done, total]) => (
									<div key={label}>
										<dt>{label}</dt>
										<dd className="font-semibold tabular-nums">
											{done} / {total}
										</dd>
										<progress
											aria-label={`${label}: загружено ${done} из ${total}`}
											className="mt-1.5 block h-1 w-full accent-primary"
											max={Math.max(1, Number(total))}
											value={Number(done)}
										/>
									</div>
								))}
							</dl>
							<div className="my-3.5 text-muted-foreground">
								Вариантов моделей готово:{' '}
								{sceneWarm.world.objects?.templates ?? 0} ·
								Текстур готово:{' '}
								{sceneWarm.world.textures?.resident ?? 0} · в
								очереди:{' '}
								{(sceneWarm.world.textures?.firstActive ?? 0) +
									(sceneWarm.world.textures?.firstQueued ??
										0)}
							</div>
							<details className="border-border-secondary border-t pt-3">
								<summary className="cursor-pointer">
									Что загрузилось ·{' '}
									{(sceneWarm.elapsedMs / 1000).toFixed(0)} с
								</summary>
								<dl className="mt-3">
									{Object.entries(
										sceneWarm.network.groups
									).map(([key, g]) => (
										<div
											className="flex justify-between gap-3 py-1"
											key={key}
										>
											<dt>
												{preloadGroups[key] ?? key} ·{' '}
												{g.requests} запросов
											</dt>
											<dd className="whitespace-nowrap tabular-nums">
												{trafficLabel(g.transferBytes)}
											</dd>
										</div>
									))}
								</dl>
								<p className="my-2 mb-4 max-w-none text-muted-foreground text-xs leading-[1.6]">
									Обращений к кэшу:{' '}
									{sceneWarm.world.cacheHits ?? 0}. Из
									HTTP-кэша: {sceneWarm.network.httpCacheHits}{' '}
									запросов. Локальные файлы не расходуют
									сетевой трафик.
								</p>
							</details>
							{!!sceneWarm.world.failed && (
								<p
									className="my-2 mb-4 max-w-none text-muted-foreground text-xs leading-[1.6]"
									role="status"
								>
									Не удалось загрузить часть ресурсов (
									{sceneWarm.world.failed}). Можно войти и
									повторить загрузку.
								</p>
							)}
						</>
					) : (
						<p
							className="my-2 mb-4 max-w-none text-muted-foreground text-xs leading-[1.6]"
							role="status"
						>
							{ready
								? 'Собираем геометрию, модели и первые текстуры…'
								: 'Подключаем движок…'}
						</p>
					)}
				</section>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					launch()
				}}
			>
				<h2 className="font-bold text-2xl">Графика и ресурсы</h2>
				<p className="mt-2.5 mb-6.5 text-[13px] text-muted-foreground leading-[1.7]">
					{folder
						? 'Из папки игры текстуры загружаются сразу в выбранном качестве.'
						: 'Текстуры появляются сразу и постепенно улучшаются до выбранного качества.'}
				</p>
				<div className="grid grid-cols-2 gap-4 max-[760px]:gap-2.5">
					<div>
						<span>Качество графики</span>
						<Combobox
							onValueChange={(v) =>
								change(
									'graphics',
									v as EditorSettings['graphics']
								)
							}
							options={[
								{ value: 'low', label: 'Низкое' },
								{ value: 'balanced', label: 'Среднее' },
								{ value: 'high', label: 'Высокое' },
							]}
							translateOptions={false}
							value={settings.graphics}
						/>
					</div>
					<div>
						<span>Дальность детализации</span>
						<Combobox
							onValueChange={(v) =>
								change(
									'distance',
									Number(v) as EditorSettings['distance']
								)
							}
							options={[
								{ value: '2', label: 'Близко' },
								{ value: '3', label: 'Обычно' },
								{ value: '5', label: 'Далеко' },
								{ value: '8', label: 'Очень далеко' },
							]}
							translateOptions={false}
							value={String(settings.distance)}
						/>
					</div>
				</div>
				<div className="mt-7 mb-4.5 flex items-center gap-3 border-border-secondary border-y py-4.5 max-[760px]:flex-wrap">
					<Icon
						className="shrink-0 text-2xl text-primary"
						icon="lucide:folder-open"
					/>
					<div className="flex-1 max-[760px]:min-w-45">
						<strong className="text-[13px]">
							{folder
								? folder.name
								: 'Ресурсы с вашего компьютера'}
						</strong>
						<p className="mt-1 text-muted-foreground text-xs leading-[1.6]">
							{folder
								? 'Папка подключена. Недостающие ресурсы подгрузятся с сервера.'
								: 'Выберите папку игры для быстрой загрузки. Файлы останутся на вашем компьютере.'}
						</p>
					</div>
					<Button
						className={`shrink-0 max-[760px]:ml-9 ${focus}`}
						disabled={picking}
						onClick={() => void folderPicked()}
						size="sm"
						type="button"
						variant="secondary"
					>
						{picking
							? 'Проверяем…'
							: folder
								? 'Изменить'
								: 'Выбрать папку'}
					</Button>
					{folder && (
						<Button
							aria-label="Отключить папку игры"
							className={`shrink-0 cursor-pointer p-1.5 ${focus}`}
							onClick={() => setFolder(undefined)}
							size="sm"
							type="button"
							variant="secondary"
						>
							<Icon icon="lucide:x" />
						</Button>
					)}
				</div>
				<input
					hidden
					multiple
					ref={fileInput}
					type="file"
					{...{ webkitdirectory: '' }}
					onChange={(e) => {
						try {
							if (e.target.files?.length)
								setFolder(gameFolderFiles([...e.target.files]))
						} catch (e) {
							setError((e as Error).message)
						} finally {
							e.target.value = ''
						}
					}}
				/>
				{folderHint && !folder && (
					<Alert.Root variant="default">
						<Alert.Description>{folderHint}</Alert.Description>
					</Alert.Root>
				)}
				<div className="flex items-center justify-between">
					Хранить ресурсы в браузере
					<Combobox
						className="max-w-35"
						onValueChange={(v) =>
							change(
								'cacheMB',
								Number(v) as EditorSettings['cacheMB']
							)
						}
						options={[128, 512, 1024, 2048, 4096, 8192].map(
							(n) => ({
								value: String(n),
								label: n < 1024 ? `${n} МБ` : `${n / 1024} ГБ`,
							})
						)}
						translateOptions={false}
						value={String(settings.cacheMB)}
					/>
				</div>
				<details className="mt-6" open>
					<summary className="mb-3.5 cursor-pointer font-semibold text-sm">
						Место появления
					</summary>
					<div>
						Карта
						<Combobox
							onValueChange={(v) => {
								setReady(false)
								setInstance(v)
							}}
							options={(catalog.length
								? catalog
								: [{ slug: instance }]
							).map(
								(r: { slug: string; map?: string | null }) => ({
									value: r.slug,
									label: r.slug,
								})
							)}
							translateOptions={false}
							value={instance}
						/>
					</div>
					<div className="mt-3 grid grid-cols-3 gap-2.5">
						{['X', 'Y', 'Z'].map((axis: string, i: number) => (
							<label
								className="flex flex-col gap-2 text-[13px]"
								key={axis}
							>
								{axis}
								<input
									className={field}
									inputMode="decimal"
									onChange={(e) => {
										setCoordinates((c: string[]) =>
											c.map((v: string, k: number) =>
												k === i ? e.target.value : v
											)
										)
										if (i === 1) setAutoHeight(false)
									}}
									value={coordinates[i]}
								/>
							</label>
						))}
					</div>
					<label className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
						<input
							checked={autoHeight}
							className="h-4 w-4 accent-primary"
							onChange={(e) => setAutoHeight(e.target.checked)}
							type="checkbox"
						/>
						Появиться над поверхностью
					</label>
				</details>
				{gecko && <Map3DGeckoModal />}
				{error && (
					<Alert.Root variant="destructive">
						<Alert.Description>{error}</Alert.Description>
					</Alert.Root>
				)}
				<div className="mt-6">
					<Button
						className={`w-full gap-2.5 ${focus}`}
						disabled={
							!ready || picking || preparing || !preparation
						}
						type="submit"
					>
						<Icon icon="lucide:compass" />
						{!ready || preparing
							? 'Подготавливаем редактор…'
							: preparationComplete(sceneWarm)
								? 'Отправиться в Зону'
								: 'Войти, пока идёт загрузка'}
					</Button>
					<small className="mt-2.5 block text-center text-muted-foreground text-xs">
						{folder
							? 'Используем выбранную папку игры'
							: 'Без папки игры ресурсы загрузятся с сервера'}
					</small>
				</div>
			</form>
		</div>
	)
}
