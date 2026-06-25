import type { ScrollBoxRenderable } from '@opentui/core'
import { useKeyboard } from '@opentui/react'
import { type RefObject, useMemo, useRef, useState } from 'react'

import { useKeyboardLayer } from '../../providers/keyboard-layer/use-keyboard-layer'
import { getFilteredCommands } from './filter-commands'
import type { Command } from './types'

type UseCommandMenuReturn = {
	showCommandMenu: boolean
	commandQuery: string
	selectedIndex: number
	scrollRef: RefObject<ScrollBoxRenderable | null>
	handleContentChange: (text: string) => void
	resolveCommand: (index: number) => Command | undefined
	setSelectedIndex: (index: number) => void
}

export function useCommandMenu(): UseCommandMenuReturn {
	const [textValue, setTextValue] = useState('')
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [showCommandMenu, setShowCommandMenu] = useState(false)
	const scrollRef = useRef<ScrollBoxRenderable>(null)
	const { push, pop, isTopLayer } = useKeyboardLayer()

	const commandQuery =
		showCommandMenu && textValue.startsWith('/') ? textValue.slice(1) : ''

	const filteredCommands = useMemo(
		() => getFilteredCommands(commandQuery),
		[commandQuery]
	)

	const closeCommandMenu = () => {
		setShowCommandMenu(false)
		pop('command')
	}

	const handleContentChange = (text: string) => {
		setTextValue(text)
		setSelectedIndex(0)

		const scrollBox = scrollRef.current
		if (scrollBox) {
			scrollBox.scrollTo(0)
		}

		const prefix = text.startsWith('/') ? text.slice(1) : null
		if (prefix !== null && !prefix.includes(' ')) {
			setShowCommandMenu(true)
			push('command', () => {
				closeCommandMenu()

				return true
			})
		} else {
			closeCommandMenu()
		}
	}

	const resolveCommand = (index: number): Command | undefined => {
		const command = filteredCommands[index]

		if (command) {
			closeCommandMenu()
		}

		return command
	}

	useKeyboard((key) => {
		if (!showCommandMenu || !isTopLayer('command')) return

		if (key.name === 'escape') {
			key.preventDefault()
			closeCommandMenu()
		} else if (key.name === 'up') {
			key.preventDefault()
			setSelectedIndex((i: number) => {
				const newIndex = Math.max(0, i - 1)
				const scrollBar = scrollRef.current

				if (scrollBar && newIndex < scrollBar.scrollTop) {
					scrollBar.scrollTo(newIndex)
				}

				return newIndex
			})
		} else if (key.name === 'down') {
			key.preventDefault()
			setSelectedIndex((i: number) => {
				if (filteredCommands.length === 0) return 0

				const newIndex = Math.min(filteredCommands.length - 1, i + 1)
				const scrollBar = scrollRef.current

				if (scrollBar) {
					const viewportHeight = scrollBar.viewport.height
					const visibleEnd = scrollBar.scrollTop + viewportHeight - 1

					if (newIndex > visibleEnd) {
						scrollBar.scrollTo(newIndex - viewportHeight + 1)
					}
				}

				return newIndex
			})
		}
	})

	return {
		showCommandMenu,
		commandQuery,
		selectedIndex,
		scrollRef,
		handleContentChange,
		resolveCommand,
		setSelectedIndex,
	}
}
