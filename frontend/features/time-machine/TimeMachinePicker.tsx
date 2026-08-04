'use client'

type TimeMachinePickerProps = {
  value: string
  onChange: (value: string) => void
  onApply: () => void
  onReset: () => void
  isActive: boolean
}

export function TimeMachinePicker({ value, onChange, onApply, onReset, isActive }: TimeMachinePickerProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">Time Machine</h2>
      <div className="flex flex-col gap-3">
        <input
          type="datetime-local"
          className="control"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary" onClick={onApply}>
            View Snapshot
          </button>
          <button type="button" className="btn btn-secondary" onClick={onReset} disabled={!isActive}>
            Return Live
          </button>
        </div>
        {isActive && <p className="text-xs text-[var(--color-ambulance-dispatched)]">Historical view active</p>}
      </div>
    </section>
  )
}
