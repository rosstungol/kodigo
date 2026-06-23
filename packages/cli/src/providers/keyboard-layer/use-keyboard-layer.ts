import { useContext } from 'react'

import { KeyboardLayerContext } from '.'

export function useKeyboardLayer() {
	const context = useContext(KeyboardLayerContext)
	if (!context) {
		throw new Error(
			'useKeyboardLayer must be used within a KeyboardLayerProvider'
		)
	}

	return context
}
