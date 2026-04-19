'use client'

import Script from 'next/script'
import { unbounded } from '@/app/fonts'
import Sidebar from '@/components/ui/sideBar/SideBar'

export default function MarkerEditorPage() {
	return (
		<main className="mx-auto mt-20 mb-8 flex w-full max-w-[1900px] flex-col gap-3 px-2 sm:px-4">
			<Script src="/marker-editor-app/app.js" strategy="afterInteractive" />

			<div className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2 ring-2 ring-border/60 backdrop-blur-md">
				<div className="flex flex-col">
					<h1
						className={`${unbounded.className} bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-xl text-transparent dark:from-sky-300 dark:to-cyan-100`}
					>
						Редактор меток
					</h1>
					<p className="text-neutral-600 text-xs dark:text-neutral-300">
						Полный пайплайн: CFG -&gt; картинка -&gt; настройка -&gt; генерация -&gt; запекание -&gt; редактирование -&gt; сохранение
					</p>
				</div>
			</div>

			<section className="relative h-[calc(100vh-8.5rem)] min-h-[760px]">
				<Sidebar
					className="z-30 max-h-[calc(100vh-10rem)] min-w-[340px] gap-3 rounded-xl bg-background/70 p-3 ring-2 ring-border/60"
					defaultOpen={true}
				>
					<div className="hidden" id="map-stats" />
					<div className="hidden" id="load-stats" />

					<input
						accept=".cfg,.json,application/json,text/plain"
						id="cfg-file-input"
						style={{ display: 'none' }}
						type="file"
					/>
					<button
						className="rounded-lg bg-background px-3 py-2 text-sm ring-2 ring-border-secondary"
						id="cfg-pick-btn"
						type="button"
					>
						Загрузить CFG
					</button>
					<div className="text-xs text-neutral-500" id="cfg-status">
						CFG: не выбран
					</div>

					<div className="my-1 h-px bg-border/60" />
					<div className="space-y-1">
						<label className="text-xs text-neutral-500">Файл изображения</label>
						<input
							accept="image/*"
							className="w-full rounded-lg bg-background px-2 py-1.5 text-sm ring-2 ring-border-secondary"
							id="image-input"
							type="file"
						/>
					</div>

					<div className="space-y-1">
						<label className="text-xs text-neutral-500">Целевое разрешение</label>
						<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
							<input
								className="w-full rounded-lg bg-background px-2 py-1.5 text-sm ring-2 ring-border-secondary"
								defaultValue={100}
								id="target-width"
								max={4096}
								step={1}
								type="number"
							/>
							<button
								className="rounded-lg bg-background px-2 py-1.5 ring-2 ring-border-secondary"
								id="aspect-lock-btn"
								title="Связь сторон"
								type="button"
							>
								🔒
							</button>
							<input
								className="w-full rounded-lg bg-background px-2 py-1.5 text-sm ring-2 ring-border-secondary"
								defaultValue={100}
								id="target-height"
								max={4096}
								step={1}
								type="number"
							/>
						</div>
						<div className="text-xs text-neutral-500" id="target-resolution-note">
							100 x 100
						</div>
						<div className="text-xs text-neutral-500" id="source-image-size">
							Оригинал: не загружен
						</div>
					</div>

					<div className="my-1 h-px bg-border/60" />
					<div className="space-y-1">
						<label className="text-xs text-neutral-500" htmlFor="gen-icon">
							Иконка
						</label>
						<select
							className="w-full rounded-lg bg-background px-2 py-1.5 text-sm ring-2 ring-border-secondary"
							defaultValue="0"
							id="gen-icon"
						>
							<option value="0">custom</option>
							<option value="1">chest</option>
							<option value="2">cross</option>
							<option value="3">flag</option>
							<option value="4">flash</option>
							<option value="5">magnifier</option>
							<option value="6">question</option>
						</select>
					</div>

					<label className="flex items-center gap-2 text-sm">
						<input defaultChecked id="auto-icons" type="checkbox" />
						<span>Авто-иконки</span>
					</label>
					<label className="flex items-center gap-2 text-sm">
						<input id="high-perf-mode" type="checkbox" />
						<span>High-perf mode (кружки)</span>
					</label>
					<div className="space-y-1">
						<label className="text-xs text-neutral-500" htmlFor="sticker-scale">
							Масштаб (в тайлах)
						</label>
						<input
							className="w-full rounded-lg bg-background px-2 py-1.5 text-sm ring-2 ring-border-secondary"
							defaultValue={1}
							id="sticker-scale"
							max={200}
							min={0.2}
							step={0.2}
							type="number"
						/>
					</div>

					<div className="my-1 h-px bg-border/60" />
					<div className="grid grid-cols-2 gap-2">
						<button
							className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-500"
							id="generate-btn"
							type="button"
						>
							Сгенерировать
						</button>
						<button
							className="rounded-lg bg-background px-3 py-2 text-sm ring-2 ring-border-secondary"
							id="clear-generated-btn"
							type="button"
						>
							Очистить
						</button>
					</div>
					<button
						className="rounded-lg bg-background px-3 py-2 text-sm ring-2 ring-border-secondary"
						id="bake-image-btn"
						type="button"
					>
						Запечь картинку в буфер
					</button>
					<div className="text-xs text-neutral-500" id="gen-stats">
						Нет сгенерированных меток
					</div>

					<div className="my-1 h-px bg-border/60" />
					<button
						className="rounded-lg bg-background px-3 py-2 text-sm ring-2 ring-border-secondary"
						id="delete-selected-btn"
						type="button"
					>
						Удалить выделенные
					</button>

					<div className="my-1 h-px bg-border/60" />
					<button
						className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"
						id="bake-cfg-btn"
						type="button"
					>
						Сохранить / запечь CFG
					</button>
				</Sidebar>

				<section className="relative h-full min-h-0 overflow-hidden rounded-xl bg-black/40 ring-2 ring-border/60">
					<canvas className="h-full w-full cursor-grab" id="viewer" />
					<div className="hidden" id="perf-stats" />
				</section>
			</section>
		</main>
	)
}
