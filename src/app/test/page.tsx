'use client'

import { useState } from 'react'
import { Toaster } from 'sonner'
import { Accordion } from '@/components/ui/Accordion'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { Combobox } from '@/components/ui/Combobox'
import { CopyButton } from '@/components/ui/CopyButton'
import { Divider } from '@/components/ui/Divider'
import DropdownMenu from '@/components/ui/DropDown'
import GradientText from '@/components/ui/GradientText'
import { HoverCard } from '@/components/ui/HoverCard'
import Input from '@/components/ui/Input'
import { LightBox } from '@/components/ui/LightBox'
import { CLink } from '@/components/ui/Link'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import Slider from '@/components/ui/Slider'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'

export default function TestPage() {
	const [sliderVal, setSliderVal] = useState(50)
	const [page, setPage] = useState(1)

	return (
		<section className="mx-auto flex min-h-screen flex-col gap-24 px-6 py-12">
			<Toaster position="bottom-right" richColors />

			{/* ==================== NORMAL ==================== */}
			<div className="flex flex-col gap-8">
				<h1 className="font-bold text-2xl">UI Components</h1>

				{/* Alert */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Alert</h2>
					<Alert.Root variant="default">
						<Alert.Title>Default Alert</Alert.Title>
						<Alert.Description>
							This is a default alert.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root variant="success">
						<Alert.Title>Success</Alert.Title>
						<Alert.Description>
							Operation completed successfully.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root variant="destructive">
						<Alert.Title>Destructive</Alert.Title>
						<Alert.Description>
							Something went wrong.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root variant="warning">
						<Alert.Title>Warning</Alert.Title>
						<Alert.Description>
							Please be careful.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root variant="info">
						<Alert.Title>Info</Alert.Title>
						<Alert.Description>
							Here is some information.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root dismissible variant="default">
						<Alert.Title>Dismissible</Alert.Title>
						<Alert.Description>
							Click the X to dismiss.
						</Alert.Description>
					</Alert.Root>
				</div>

				<Divider />

				{/* Accordion */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Accordion</h2>
					<Accordion
						items={[
							{
								key: '1',
								title: 'First Item',
								content: <p>Content for the first item.</p>,
							},
							{
								key: '2',
								title: 'Second Item',
								content: <p>Content for the second item.</p>,
							},
							{
								key: '3',
								title: 'Third Item',
								content: <p>Content for the third item.</p>,
							},
						]}
					/>
				</div>

				<Divider />

				{/* Badge */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Badge</h2>
					<div className="flex flex-wrap gap-2">
						<Badge>Default</Badge>
						<Badge variant="success">Success</Badge>
						<Badge variant="danger">Danger</Badge>
						<Badge variant="exbo">Exbo</Badge>
						<Badge variant="media">Media</Badge>
					</div>
				</div>

				<Divider />

				{/* Button */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Button</h2>
					<div className="flex flex-wrap gap-2">
						<Button variant="primary">Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="danger">Danger</Button>
						<Button loading>Loading</Button>
						<Button disabled>Disabled</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button size="sm">sm</Button>
						<Button size="md">md</Button>
						<Button size="lg">lg</Button>
						<Button size="xl">xl</Button>
					</div>
				</div>

				<Divider />

				{/* Card */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Card</h2>
					<Card.Root className="w-full max-w-md">
						<Card.Header>
							<Card.Title>Card Title</Card.Title>
							<Card.Description>
								This is a card description.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<p>
								This is the card content. You can put anything
								here.
							</p>
						</Card.Content>
						<Card.Footer>
							<span className="text-sm">Footer</span>
							<Button size="sm">Action</Button>
						</Card.Footer>
					</Card.Root>
				</div>

				<Divider />

				{/* CheckBox */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">CheckBox</h2>
					<div className="flex flex-wrap items-center gap-4">
						<CheckBox />
						<CheckBox defaultChecked />
						<CheckBox label="With label" />
						<CheckBox disabled label="Disabled" />
						<CheckBox
							defaultChecked
							disabled
							label="Disabled checked"
						/>
						<CheckBox
							description="This is a description"
							label="With description"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<CheckBox label="xs" size="xs" />
						<CheckBox label="sm" size="sm" />
						<CheckBox label="md" size="md" />
						<CheckBox label="lg" size="lg" />
					</div>
				</div>

				<Divider />

				{/* Switch */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Switch</h2>
					<div className="flex flex-wrap items-center gap-4">
						<Switch />
						<Switch defaultChecked />
						<Switch label="With label" />
						<Switch disabled label="Disabled" />
						<Switch label="Small" size="sm" />
						<Switch label="Medium" size="md" />
						<Switch label="Large" size="lg" />
					</div>
				</div>

				<Divider />

				{/* Input */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Input</h2>
					<div className="max-w-sm">
						<Input placeholder="Text input" />
					</div>
					<div className="max-w-sm">
						<Input label="Label" placeholder="With label" />
					</div>
					<div className="max-w-sm">
						<Input placeholder="Password" type="password" />
					</div>
					<div className="max-w-sm">
						<Input placeholder="Number" type="number" />
					</div>
				</div>

				<Divider />

				{/* Slider */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Slider</h2>
					<div className="max-w-sm">
						<Slider
							onValueChange={setSliderVal}
							value={sliderVal}
						/>
					</div>
					<p className="text-sm">Value: {sliderVal}</p>
				</div>

				<Divider />

				{/* Divider */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Divider</h2>
					<p>Above</p>
					<Divider />
					<p>Below</p>
					<div className="flex h-20 items-center gap-4">
						<p>Left</p>
						<Divider orientation="vertical" />
						<p>Right</p>
					</div>
				</div>

				<Divider />

				{/* Skeleton */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Skeleton</h2>
					<div className="flex max-w-sm flex-col gap-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-20 w-full" />
					</div>
				</div>

				<Divider />

				{/* Pagination */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Pagination</h2>
					<Pagination
						onPageChange={setPage}
						page={page}
						totalPages={10}
					/>
				</div>

				<Divider />

				{/* GradientText */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">GradientText</h2>
					<GradientText>Animated Gradient Text</GradientText>
					<GradientText showBorder>With Border</GradientText>
					<GradientText direction="vertical">
						Vertical Direction
					</GradientText>
				</div>

				<Divider />

				{/* Tooltip */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Tooltip</h2>
					<div className="flex flex-wrap gap-4">
						<Tooltip.Root position="top">
							<Tooltip.Trigger>Hover top</Tooltip.Trigger>
							<Tooltip.Content>Top tooltip</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root position="bottom">
							<Tooltip.Trigger>Hover bottom</Tooltip.Trigger>
							<Tooltip.Content>Bottom tooltip</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root position="left">
							<Tooltip.Trigger>Hover left</Tooltip.Trigger>
							<Tooltip.Content>Left tooltip</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root position="right">
							<Tooltip.Trigger>Hover right</Tooltip.Trigger>
							<Tooltip.Content>Right tooltip</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>

				<Divider />

				{/* HoverCard */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">HoverCard</h2>
					<HoverCard.Root>
						<HoverCard.Trigger className="cursor-pointer underline">
							Hover me
						</HoverCard.Trigger>
						<HoverCard.Content>
							<p>This is hover card content.</p>
						</HoverCard.Content>
					</HoverCard.Root>
				</div>

				<Divider />

				{/* Tabs */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Tabs</h2>
					<Tabs.Root defaultValue="tab1">
						<Tabs.List>
							<Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
							<Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
							<Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="tab1">
							<p>Content for Tab 1</p>
						</Tabs.Content>
						<Tabs.Content value="tab2">
							<p>Content for Tab 2</p>
						</Tabs.Content>
						<Tabs.Content value="tab3">
							<p>Content for Tab 3</p>
						</Tabs.Content>
					</Tabs.Root>
				</div>

				<Divider />

				{/* CLink */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Link</h2>
					<div className="flex flex-wrap gap-3">
						<CLink href="/">Default</CLink>
						<CLink href="/" variant="primary">
							Primary
						</CLink>
						<CLink href="/" variant="secondary">
							Secondary
						</CLink>
						<CLink href="/" variant="ghost">
							Ghost
						</CLink>
						<CLink href="/" variant="danger">
							Danger
						</CLink>
						<CLink external href="https://example.com">
							External
						</CLink>
						<CLink disabled href="/">
							Disabled
						</CLink>
					</div>
				</div>

				<Divider />

				{/* CopyButton */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">CopyButton</h2>
					<div className="flex gap-2">
						<CopyButton text="Hello world" />
						<CopyButton text="Outline" variant="outline" />
						<CopyButton text="Ghost" variant="ghost" />
					</div>
				</div>

				<Divider />

				{/* Combobox */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Combobox</h2>
					<div className="max-w-sm">
						<Combobox
							options={[
								{ value: '1', label: 'Option 1' },
								{ value: '2', label: 'Option 2' },
								{ value: '3', label: 'Option 3' },
								{ value: '4', label: 'Option 4' },
							]}
							placeholder="Select an option"
						/>
					</div>
				</div>

				<Divider />

				{/* DropDown */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">DropDown</h2>
					<DropdownMenu
						icon="lucide:menu"
						items={[
							{ key: 'edit', content: 'Edit' },
							{ key: 'divider', divider: true, content: '' },
							{ key: 'delete', content: 'Delete' },
						]}
						title="Actions"
					/>
				</div>

				<Divider />

				{/* Modal */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Modal</h2>
					<Modal.Root>
						<Modal.Trigger>Open Modal</Modal.Trigger>
						<Modal.Content>
							<Modal.Header>
								<Modal.Title>Modal Title</Modal.Title>
								<Modal.Description>
									This is a modal description.
								</Modal.Description>
							</Modal.Header>
							<Modal.Body>
								<p>Modal body content goes here.</p>
							</Modal.Body>
							<Modal.Footer>
								<Modal.Action>Confirm</Modal.Action>
								<Modal.Close>Cancel</Modal.Close>
							</Modal.Footer>
						</Modal.Content>
					</Modal.Root>
				</div>

				<Divider />

				{/* LightBox */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">LightBox</h2>
					<LightBox.Root>
						<LightBox.Trigger>Open LightBox</LightBox.Trigger>
						<LightBox.Content
							alt="Placeholder"
							src="https://placehold.co/800x600"
						/>
					</LightBox.Root>
				</div>
			</div>

			{/* ==================== DARK:bg-primary на компонентах ==================== */}
			<div className="flex flex-col gap-8">
				<h1 className="font-bold text-2xl">
					UI Components (dark:bg-primary)
				</h1>

				{/* Alert */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Alert</h2>
					<Alert.Root className="dark:bg-primary" variant="default">
						<Alert.Title>Default Alert</Alert.Title>
						<Alert.Description>
							This is a default alert.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root className="dark:bg-primary" variant="success">
						<Alert.Title>Success</Alert.Title>
						<Alert.Description>
							Operation completed successfully.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root
						className="dark:bg-primary"
						variant="destructive"
					>
						<Alert.Title>Destructive</Alert.Title>
						<Alert.Description>
							Something went wrong.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root className="dark:bg-primary" variant="warning">
						<Alert.Title>Warning</Alert.Title>
						<Alert.Description>
							Please be careful.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root className="dark:bg-primary" variant="info">
						<Alert.Title>Info</Alert.Title>
						<Alert.Description>
							Here is some information.
						</Alert.Description>
					</Alert.Root>
					<Alert.Root
						className="dark:bg-primary"
						dismissible
						variant="default"
					>
						<Alert.Title>Dismissible</Alert.Title>
						<Alert.Description>
							Click the X to dismiss.
						</Alert.Description>
					</Alert.Root>
				</div>

				<Divider />

				{/* Accordion */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Accordion</h2>
					<Accordion
						className="rounded-xl dark:bg-primary"
						items={[
							{
								key: '1',
								title: 'First Item',
								content: <p>Content for the first item.</p>,
							},
							{
								key: '2',
								title: 'Second Item',
								content: <p>Content for the second item.</p>,
							},
							{
								key: '3',
								title: 'Third Item',
								content: <p>Content for the third item.</p>,
							},
						]}
					/>
				</div>

				<Divider />

				{/* Badge */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Badge</h2>
					<div className="flex flex-wrap gap-2">
						<Badge className="dark:bg-primary">Default</Badge>
						<Badge variant="success">Success</Badge>
						<Badge variant="danger">Danger</Badge>
						<Badge variant="exbo">Exbo</Badge>
						<Badge variant="media">Media</Badge>
					</div>
				</div>

				<Divider />

				{/* Button */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Button</h2>
					<div className="flex flex-wrap gap-2">
						<Button className="dark:bg-primary" variant="primary">
							Primary
						</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="danger">Danger</Button>
						<Button className="dark:bg-primary" loading>
							Loading
						</Button>
						<Button disabled>Disabled</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button className="dark:bg-primary" size="sm">
							sm
						</Button>
						<Button className="dark:bg-primary" size="md">
							md
						</Button>
						<Button className="dark:bg-primary" size="lg">
							lg
						</Button>
						<Button className="dark:bg-primary" size="xl">
							xl
						</Button>
					</div>
				</div>

				<Divider />

				{/* Card */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Card</h2>
					<Card.Root className="w-full max-w-md dark:bg-primary">
						<Card.Header>
							<Card.Title>Card Title</Card.Title>
							<Card.Description>
								This is a card description.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<p>
								This is the card content. You can put anything
								here.
							</p>
						</Card.Content>
						<Card.Footer>
							<span className="text-sm">Footer</span>
							<Button size="sm">Action</Button>
						</Card.Footer>
					</Card.Root>
				</div>

				<Divider />

				{/* CheckBox */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">CheckBox</h2>
					<div className="flex flex-wrap items-center gap-4">
						<CheckBox className="dark:bg-primary" />
						<CheckBox className="dark:bg-primary" defaultChecked />
						<CheckBox
							className="dark:bg-primary"
							label="With label"
						/>
						<CheckBox
							className="dark:bg-primary"
							disabled
							label="Disabled"
						/>
						<CheckBox
							className="dark:bg-primary"
							defaultChecked
							disabled
							label="Disabled checked"
						/>
						<CheckBox
							className="dark:bg-primary"
							description="This is a description"
							label="With description"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<CheckBox
							className="dark:bg-primary"
							label="xs"
							size="xs"
						/>
						<CheckBox
							className="dark:bg-primary"
							label="sm"
							size="sm"
						/>
						<CheckBox
							className="dark:bg-primary"
							label="md"
							size="md"
						/>
						<CheckBox
							className="dark:bg-primary"
							label="lg"
							size="lg"
						/>
					</div>
				</div>

				<Divider />

				{/* Switch */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Switch</h2>
					<div className="flex flex-wrap items-center gap-4">
						<Switch className="dark:bg-primary" />
						<Switch className="dark:bg-primary" defaultChecked />
						<Switch
							className="dark:bg-primary"
							label="With label"
						/>
						<Switch
							className="dark:bg-primary"
							disabled
							label="Disabled"
						/>
						<Switch
							className="dark:bg-primary"
							label="Small"
							size="sm"
						/>
						<Switch
							className="dark:bg-primary"
							label="Medium"
							size="md"
						/>
						<Switch
							className="dark:bg-primary"
							label="Large"
							size="lg"
						/>
					</div>
				</div>

				<Divider />

				{/* Input */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Input</h2>
					<div className="max-w-sm">
						<Input
							className="dark:bg-primary"
							placeholder="Text input"
						/>
					</div>
					<div className="max-w-sm">
						<Input
							className="dark:bg-primary"
							label="Label"
							placeholder="With label"
						/>
					</div>
					<div className="max-w-sm">
						<Input
							className="dark:bg-primary"
							placeholder="Password"
							type="password"
						/>
					</div>
					<div className="max-w-sm">
						<Input
							className="dark:bg-primary"
							placeholder="Number"
							type="number"
						/>
					</div>
				</div>

				<Divider />

				{/* Slider */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Slider</h2>
					<div className="max-w-sm">
						<Slider
							className="rounded-xl p-2 dark:bg-primary"
							onValueChange={setSliderVal}
							value={sliderVal}
						/>
					</div>
					<p className="text-sm">Value: {sliderVal}</p>
				</div>

				<Divider />

				{/* Divider */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Divider</h2>
					<p>Above</p>
					<Divider className="dark:bg-primary" />
					<p>Below</p>
					<div className="flex h-20 items-center gap-4">
						<p>Left</p>
						<Divider
							className="dark:bg-primary"
							orientation="vertical"
						/>
						<p>Right</p>
					</div>
				</div>

				<Divider />

				{/* Skeleton */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Skeleton</h2>
					<div className="flex max-w-sm flex-col gap-2">
						<Skeleton className="h-4 w-3/4 dark:bg-primary" />
						<Skeleton className="h-4 w-1/2 dark:bg-primary" />
						<Skeleton className="h-4 w-2/3 dark:bg-primary" />
						<Skeleton className="h-20 w-full dark:bg-primary" />
					</div>
				</div>

				<Divider />

				{/* Pagination */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Pagination</h2>
					<div className="inline-flex rounded-xl p-2 dark:bg-primary">
						<Pagination
							onPageChange={setPage}
							page={page}
							totalPages={10}
						/>
					</div>
				</div>

				<Divider />

				{/* GradientText */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">GradientText</h2>
					<GradientText className="rounded-xl p-2 dark:bg-primary">
						Animated Gradient Text
					</GradientText>
					<GradientText
						className="rounded-xl p-2 dark:bg-primary"
						showBorder
					>
						With Border
					</GradientText>
					<GradientText
						className="rounded-xl p-2 dark:bg-primary"
						direction="vertical"
					>
						Vertical Direction
					</GradientText>
				</div>

				<Divider />

				{/* Tooltip */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Tooltip</h2>
					<div className="flex flex-wrap gap-4">
						<Tooltip.Root
							className="rounded-xl p-2 dark:bg-primary"
							position="top"
						>
							<Tooltip.Trigger>Hover top</Tooltip.Trigger>
							<Tooltip.Content>Top tooltip</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root
							className="rounded-xl p-2 dark:bg-primary"
							position="bottom"
						>
							<Tooltip.Trigger>Hover bottom</Tooltip.Trigger>
							<Tooltip.Content>Bottom tooltip</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root
							className="rounded-xl p-2 dark:bg-primary"
							position="left"
						>
							<Tooltip.Trigger>Hover left</Tooltip.Trigger>
							<Tooltip.Content>Left tooltip</Tooltip.Content>
						</Tooltip.Root>
						<Tooltip.Root
							className="rounded-xl p-2 dark:bg-primary"
							position="right"
						>
							<Tooltip.Trigger>Hover right</Tooltip.Trigger>
							<Tooltip.Content>Right tooltip</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>

				<Divider />

				{/* HoverCard */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">HoverCard</h2>
					<HoverCard.Root className="rounded-xl p-2 dark:bg-primary">
						<HoverCard.Trigger className="cursor-pointer underline">
							Hover me
						</HoverCard.Trigger>
						<HoverCard.Content>
							<p>This is hover card content.</p>
						</HoverCard.Content>
					</HoverCard.Root>
				</div>

				<Divider />

				{/* Tabs */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Tabs</h2>
					<Tabs.Root
						className="rounded-xl p-2 dark:bg-primary"
						defaultValue="dark-tab1"
					>
						<Tabs.List>
							<Tabs.Trigger value="dark-tab1">Tab 1</Tabs.Trigger>
							<Tabs.Trigger value="dark-tab2">Tab 2</Tabs.Trigger>
							<Tabs.Trigger value="dark-tab3">Tab 3</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="dark-tab1">
							<p>Content for Tab 1</p>
						</Tabs.Content>
						<Tabs.Content value="dark-tab2">
							<p>Content for Tab 2</p>
						</Tabs.Content>
						<Tabs.Content value="dark-tab3">
							<p>Content for Tab 3</p>
						</Tabs.Content>
					</Tabs.Root>
				</div>

				<Divider />

				{/* CLink */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Link</h2>
					<div className="flex flex-wrap gap-3">
						<CLink className="dark:bg-primary" href="/">
							Default
						</CLink>
						<CLink
							className="dark:bg-primary"
							href="/"
							variant="primary"
						>
							Primary
						</CLink>
						<CLink
							className="dark:bg-primary"
							href="/"
							variant="secondary"
						>
							Secondary
						</CLink>
						<CLink
							className="dark:bg-primary"
							href="/"
							variant="ghost"
						>
							Ghost
						</CLink>
						<CLink
							className="dark:bg-primary"
							href="/"
							variant="danger"
						>
							Danger
						</CLink>
						<CLink
							className="dark:bg-primary"
							external
							href="https://example.com"
						>
							External
						</CLink>
						<CLink className="dark:bg-primary" disabled href="/">
							Disabled
						</CLink>
					</div>
				</div>

				<Divider />

				{/* CopyButton */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">CopyButton</h2>
					<div className="flex gap-2">
						<CopyButton
							className="dark:bg-primary"
							text="Hello world"
						/>
						<CopyButton
							className="dark:bg-primary"
							text="Outline"
							variant="outline"
						/>
						<CopyButton
							className="dark:bg-primary"
							text="Ghost"
							variant="ghost"
						/>
					</div>
				</div>

				<Divider />

				{/* Combobox */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Combobox</h2>
					<div className="max-w-sm">
						<Combobox
							className="dark:bg-primary"
							options={[
								{ value: '1', label: 'Option 1' },
								{ value: '2', label: 'Option 2' },
								{ value: '3', label: 'Option 3' },
								{ value: '4', label: 'Option 4' },
							]}
							placeholder="Select an option"
						/>
					</div>
				</div>

				<Divider />

				{/* DropDown */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">DropDown</h2>
					<DropdownMenu
						className="dark:bg-primary"
						icon="lucide:menu"
						items={[
							{ key: 'edit', content: 'Edit' },
							{ key: 'divider', divider: true, content: '' },
							{ key: 'delete', content: 'Delete' },
						]}
						title="Actions"
					/>
				</div>

				<Divider />

				{/* Modal */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">Modal</h2>
					<Modal.Root>
						<Modal.Trigger>Open Modal</Modal.Trigger>
						<Modal.Content className="dark:bg-primary">
							<Modal.Header>
								<Modal.Title>Modal Title</Modal.Title>
								<Modal.Description>
									This is a modal description.
								</Modal.Description>
							</Modal.Header>
							<Modal.Body>
								<p>Modal body content goes here.</p>
							</Modal.Body>
							<Modal.Footer>
								<Modal.Action>Confirm</Modal.Action>
								<Modal.Close>Cancel</Modal.Close>
							</Modal.Footer>
						</Modal.Content>
					</Modal.Root>
				</div>

				<Divider />

				{/* LightBox */}
				<div className="flex flex-col gap-3">
					<h2 className="font-semibold text-lg">LightBox</h2>
					<LightBox.Root>
						<LightBox.Trigger className="dark:bg-primary">
							Open LightBox
						</LightBox.Trigger>
						<LightBox.Content
							alt="Placeholder"
							className="dark:bg-primary"
							src="https://placehold.co/800x600"
						/>
					</LightBox.Root>
				</div>
			</div>
		</section>
	)
}
