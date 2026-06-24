import type { KeyBinding, TextareaRenderable } from '@opentui/core'
import { useRenderer } from '@opentui/react'
import { useCallback, useEffect, useRef } from 'react'

import { useKeyboardLayer } from '../providers/keyboard-layer/use-keyboard-layer'
import { useToast } from '../providers/toast'
import { CommandMenu } from './command-menu'
import type { Command } from './command-menu/types'
import { useCommandMenu } from './command-menu/use-command-menu'
import { StatusBar } from './status-bar'

type InputBarProps = {
	onSubmit: (text: string) => void
	disabled?: boolean
}

export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
	{ name: 'return', action: 'submit' },
	{ name: 'enter', action: 'submit' },
	{ name: 'return', shift: true, action: 'newline' },
	{ name: 'enter', shift: true, action: 'newline' },
]

export function InputBar({ onSubmit, disabled = false }: InputBarProps) {
	const textareaRef = useRef<TextareaRenderable>(null)
	const onSubmitRef = useRef<() => void>(() => {})
	const renderer = useRenderer()
	const toast = useToast()
	const { isTopLayer, setResponder } = useKeyboardLayer()

	const {
		showCommandMenu,
		commandQuery,
		selectedIndex,
		scrollRef,
		handleContentChange,
		resolveCommand,
		setSelectedIndex,
	} = useCommandMenu()

	const handleCommand = useCallback(
		(command: Command | undefined) => {
			const textarea = textareaRef.current
			if (!textarea || !command) return

			textarea.setText('')

			if (command.action) {
				command.action({
					exit: () => renderer.destroy(),
					toast,
				})
			} else {
				textarea.insertText(`${command.value} `)
			}
		},
		[renderer, toast]
	)

	const handleCommandExecute = useCallback(
		(index: number) => {
			const command = resolveCommand(index)

			handleCommand(command)
		},
		[handleCommand, resolveCommand]
	)

	const handleTextareaContentChange = useCallback(() => {
		const textarea = textareaRef.current
		if (!textarea) return

		handleContentChange(textarea.plainText)
	}, [handleContentChange])

	const handleSubmit = useCallback(() => {
		if (disabled) return

		const textarea = textareaRef.current
		if (!textarea) return

		const text = textarea.plainText.trim()
		if (text.length === 0) return

		onSubmit(text)
		textarea.setText('')
	}, [disabled, onSubmit])

	useEffect(() => {
		const textarea = textareaRef.current
		if (!textarea) return

		textarea.onSubmit = () => {
			onSubmitRef.current()
		}
	}, [])

	onSubmitRef.current = () => {
		if (disabled) return

		if (showCommandMenu) {
			const command = resolveCommand(selectedIndex)
			handleCommand(command)

			return
		}

		handleSubmit()
	}

	useEffect(() => {
		setResponder('base', () => {
			if (disabled) return false

			const textarea = textareaRef.current
			if (textarea && textarea.plainText.length > 0) {
				textarea.setText('')
				return true
			}
			return false
		})

		return () => setResponder('base', null)
	}, [disabled, setResponder])

	return (
		<box width='100%' alignItems='center'>
			<box border={['left']} borderColor='cyan' width='100%'>
				<box
					position='relative'
					justifyContent='center'
					paddingX={2}
					paddingY={1}
					backgroundColor='#1a1a1a'
					gap={1}
				>
					{showCommandMenu && (
						<box
							position='absolute'
							bottom='100%'
							left={0}
							width='100%'
							backgroundColor='#1a1a1a'
							zIndex={10}
						>
							<CommandMenu
								query={commandQuery}
								selectedIndex={selectedIndex}
								scrollRef={scrollRef}
								onSelect={setSelectedIndex}
								onExecute={handleCommandExecute}
							/>
						</box>
					)}
					<textarea
						ref={textareaRef}
						focused={!disabled && (isTopLayer('base') || isTopLayer('command'))}
						placeholder='Ask anything...'
						keyBindings={TEXTAREA_KEY_BINDINGS}
						onContentChange={handleTextareaContentChange}
					/>
					<StatusBar />
				</box>
			</box>
		</box>
	)
}
