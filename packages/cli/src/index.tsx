import { createCliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'

import { Header } from './components/header'
import { InputBar } from './components/input-bar'
import { KeyboardLayerProvider } from './providers/keyboard-layer'
import { ToastProvider } from './providers/toast'

function App() {
	const handleSubmit = (_text: string) => {
		// TODO: Process user input
	}

	return (
		<KeyboardLayerProvider>
			<ToastProvider>
				<box
					justifyContent='center'
					alignItems='center'
					width='100%'
					height='100%'
					gap={2}
					backgroundColor='#000'
				>
					<Header />
					<box width='100%' maxWidth={72} paddingX={2}>
						<InputBar onSubmit={handleSubmit} />
					</box>
				</box>
			</ToastProvider>
		</KeyboardLayerProvider>
	)
}

const renderer = await createCliRenderer({
	targetFps: 60,
	exitOnCtrlC: false,
	clearOnShutdown: true,
	onDestroy: () => process.exit(0),
})
const root = createRoot(renderer)
root.render(<App />)
