import {
	createContext,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from 'react'

import { Toast } from './toast'
import { DEFAULT_DURATION, type ToastOptions } from './types'

export type ToastContextValue = {
	show: (options: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

type ToastProviderProps = {
	children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null)
	const timeoutHandleRef = useRef<NodeJS.Timeout | null>(null)

	const clearCurrentTimeout = useCallback(() => {
		if (timeoutHandleRef.current) {
			clearTimeout(timeoutHandleRef.current)
			timeoutHandleRef.current = null
		}
	}, [])

	const show = useCallback(
		(options: ToastOptions) => {
			const duration = options.duration ?? DEFAULT_DURATION

			clearCurrentTimeout()

			setCurrentToast({
				variant: options.variant ?? 'info',
				...options,
				duration,
			})

			timeoutHandleRef.current = setTimeout(() => {
				setCurrentToast(null)
			}, duration).unref()
		},
		[clearCurrentTimeout]
	)

	const value: ToastContextValue = {
		show,
	}

	return (
		<ToastContext.Provider value={value}>
			{children}
			<Toast currentToast={currentToast} />
		</ToastContext.Provider>
	)
}
