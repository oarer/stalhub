export class IconStore {
	onRedraw: (() => void) | null = null

	constructor() {
		this.onRedraw = null
	}
}
