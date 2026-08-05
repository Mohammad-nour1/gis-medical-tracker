'use client'

import { FacilityFilterState } from '../../types/records'

type FacilityFiltersProps = {
  filter: FacilityFilterState
  governorates: string[]
  onChange: (next: FacilityFilterState) => void
}

function chipLabel(filter: FacilityFilterState): string[] {
  const chips: string[] = []
  if (filter.type !== 'all') chips.push(`Type: ${filter.type}`)
  if (filter.governorate !== 'all') chips.push(`Gov: ${filter.governorate}`)
  if (filter.status !== 'all') chips.push(`Facility: ${filter.status}`)
  if (filter.ambulanceStatus === 'hidden') chips.push('Ambulances: hidden')
  else if (filter.ambulanceStatus !== 'all') chips.push(`Ambulance: ${filter.ambulanceStatus}`)
  return chips
}

export function FacilityFilters({ filter, governorates, onChange }: FacilityFiltersProps) {
  const chips = chipLabel(filter)
  const hasActive = chips.length > 0

  return (
    <section className="panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title mb-0">Filters</h2>
        {hasActive && (
          <button
            type="button"
            className="btn btn-secondary !px-3 !py-1 !text-xs"
            onClick={() =>
              onChange({ type: 'all', governorate: 'all', status: 'all', ambulanceStatus: 'all' })
            }
          >
            Reset all
          </button>
        )}
      </div>

      {hasActive ? (
        <div className="filter-chip-row mb-3">
          {chips.map(chip => (
            <span key={chip} className="filter-chip" data-tone={chip.includes('RED') ? 'red' : chip.includes('GREEN') ? 'green' : 'neutral'}>
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className="filter-help mb-3">Facility filters do not hide ambulances unless Ambulance Status is set to Hide</p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="field-label">Facility Type</span>
          <select
            className="control"
            value={filter.type}
            onChange={event => onChange({ ...filter, type: event.target.value as FacilityFilterState['type'] })}
          >
            <option value="all">All</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="field_unit">Field Unit</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="field-label">Governorate</span>
          <select
            className="control"
            value={filter.governorate}
            onChange={event => onChange({ ...filter, governorate: event.target.value })}
          >
            <option value="all">All</option>
            {governorates.map(governorate => (
              <option key={governorate} value={governorate}>{governorate}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="field-label">Facility Status</span>
          <select
            className="control"
            value={filter.status}
            onChange={event => onChange({ ...filter, status: event.target.value as FacilityFilterState['status'] })}
          >
            <option value="all">All</option>
            <option value="GREEN">GREEN</option>
            <option value="RED">RED</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="field-label">Ambulance Status</span>
          <select
            className="control"
            value={filter.ambulanceStatus}
            onChange={event => onChange({ ...filter, ambulanceStatus: event.target.value as FacilityFilterState['ambulanceStatus'] })}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="dispatched">Dispatched</option>
            <option value="hidden">Hide ambulances</option>
          </select>
        </label>
      </div>
    </section>
  )
}
