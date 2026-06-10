import { cn } from '@/lib/utils'
import type { PickType } from '@/lib/types'

interface PredictionToggleProps {
  value: PickType | undefined
  onChange: (v: PickType) => void
  disabled?: boolean
  localLabel: string
  visitanteLabel: string
}

export function PredictionToggle({ value, onChange, disabled, localLabel, visitanteLabel }: PredictionToggleProps) {
  const options: { label: string; value: PickType; activeClass: string }[] = [
    { label: localLabel, value: 'local', activeClass: 'bg-green-600 text-white border-green-600' },
    { label: 'Empate', value: 'empate', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
    { label: visitanteLabel, value: 'visitante', activeClass: 'bg-blue-600 text-white border-blue-600' },
  ]

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(opt.value)}
          className={cn(
            'flex-1 py-2 px-1 text-xs font-medium border-r last:border-r-0 border-gray-200 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            value === opt.value
              ? opt.activeClass
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
