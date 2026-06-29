import { useTerminalDimensions } from '@opentui/react'

import type { ToastOptions, ToastVariant } from './types'

type ToastProps = {
	currentToast: ToastOptions | null
}

export function Toast({ currentToast }: ToastProps) {
	const { width } = useTerminalDimensions()

	if (!currentToast) return null

	const variantColors: Record<ToastVariant, string> = {
		success: '#82e0aa',
		error: '#e74c5e',
		info: '#56d6c2',
	}

	const borderColor = currentToast.variant
		? variantColors[currentToast.variant]
		: variantColors.info

	return (
		<box
			position='absolute'
			justifyContent='center'
			alignItems='flex-start'
			top={2}
			right={2}
			width={Math.max(1, Math.min(60, width - 6))}
			paddingY={1}
			paddingX={2}
			backgroundColor='#1a1a1a'
			borderColor={borderColor}
			border={['left', 'right']}
		>
			<box flexDirection='column' gap={1} width='100%'>
				<text fg='#e1e1e1' wrapMode='word' width='100%'>
					{currentToast.message}
				</text>
			</box>
		</box>
	)
}
