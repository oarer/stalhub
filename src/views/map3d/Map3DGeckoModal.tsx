'use client'
import { Modal } from '@/components/ui/Modal'

export default function Map3DGeckoModal() {
	return (
		<Modal.Root defaultOpen>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Обнаружен Gecko</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					В Firefox/Gecko WebGPU работает плохо. Для 3D-карты лучше
					использовать Chrome или Edge.
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>Понятно</Modal.Close>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
