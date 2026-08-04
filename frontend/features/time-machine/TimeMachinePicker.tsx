'use client'

type TimeMachinePickerProps = {
  value: string
  onChange: (value: string) => void
  onApply: () => void
  onReset: () => void
  isActive: boolean
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function splitValue(value: string): { date: string; time: string } {
  if (!value.includes('T')) return { date: '', time: '' }
  const [date, time] = value.split('T')
  return { date, time: time.slice(0, 5) }
}

const presets = [
  { id: '15m', label: '15 min ago', offsetMs: 15 * 60 * 1000 },
  { id: '1h', label: '1 hour ago', offsetMs: 60 * 60 * 1000 },
  { id: '6h', label: '6 hours ago', offsetMs: 6 * 60 * 60 * 1000 },
  { id: '1d', label: 'Yesterday', offsetMs: 24 * 60 * 60 * 1000 }
] as const

export function TimeMachinePicker({ value, onChange, onApply, onReset, isActive }: TimeMachinePickerProps) {
  const { date, time } = splitValue(value)

  function updatePart(nextDate: string, nextTime: string) {
    if (!nextDate && !nextTime) {
      onChange('')
      return
    }
    onChange(`${nextDate || '1970-01-01'}T${nextTime || '00:00'}`)
  }

  function applyPreset(offsetMs: number) {
    onChange(toLocalInputValue(new Date(Date.now() - offsetMs)))
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Time Machine</h2>
      <div className="flex flex-col gap-3">
        <div className="quick-time-row">
          {presets.map(preset => (
            <button
              key={preset.id}
              type="button"
              className="quick-time-chip"
              onClick={() => applyPreset(preset.offsetMs)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="field-label">Date</span>
            <input
              type="date"
              className="control"
              value={date}
              onChange={event => updatePart(event.target.value, time)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="field-label">Time</span>
            <input
              type="time"
              className="control"
              value={time}
              onChange={event => updatePart(date, event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={onApply}>
            View Snapshot
          </button>
          <button type="button" className="btn btn-secondary" onClick={onReset} disabled={!isActive}>
            Return Live
          </button>
        </div>
        {isActive && <p className="historical-badge">Historical view active</p>}
      </div>
    </section>
  )
}
