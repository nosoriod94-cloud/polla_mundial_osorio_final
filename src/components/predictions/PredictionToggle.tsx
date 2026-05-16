import { cn } from '@/lib/utils'
import type { PickType } from '@/lib/types'

interface PredictionToggleProps {
  value: PickType | undefined
  onChange: (v: PickType) => void
  disabled?: boolean
}

const OPTIONS: { label: string; value: PickType; activeClass: string }[] = [
  { label: 'Local', value: 'local', activeClass: 'bg-green-600 text-white border-green-600' },
  { label: 'Empate', value: 'empate', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { label: 'Visitante', value: 'visitante', activeClass: 'bg-blue-600 text-white border-blue-600' },
]

export function PredictionToggle({ value, onChange, disabled }: PredictionToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200">
      {OPTIONS.map((opt) => (
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
