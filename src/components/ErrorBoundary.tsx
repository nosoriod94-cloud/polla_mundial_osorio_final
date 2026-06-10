import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-4 space-y-2">
            <h1 className="font-bold text-red-600">Error en la aplicación</h1>
            <p className="text-sm text-gray-700 break-words">{this.state.error.message}</p>
            <pre className="text-xs text-gray-400 overflow-auto whitespace-pre-wrap">{this.state.error.stack}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
