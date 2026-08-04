'use client'

import { FacilityFilterState } from '../../types/records'

type FacilityFiltersProps = {
  filter: FacilityFilterState
  governorates: string[]
  onChange: (next: FacilityFilterState) => void
}

export function FacilityFilters({ filter, governorates, onChange }: FacilityFiltersProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">Filters</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-text-muted)]">Facility Type</span>
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-text-muted)]">Governorate</span>
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-text-muted)]">Facility Status</span>
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-text-muted)]">Ambulance Status</span>
          <select
            className="control"
            value={filter.ambulanceStatus}
            onChange={event => onChange({ ...filter, ambulanceStatus: event.target.value as FacilityFilterState['ambulanceStatus'] })}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="dispatched">Dispatched</option>
          </select>
        </label>
      </div>
    </section>
  )
}
