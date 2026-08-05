'use client'

import { useMemo, useState } from 'react'
import { FacilityRecord, AmbulanceRecord } from '../../types/records'
import { manualDispatch, ApiClientError } from '../../state/apiClient'
import { isArabicLabel } from '../../../core/shared/facilityNames'

type ManualDispatchPanelProps = {
  facilities: FacilityRecord[]
  ambulances: AmbulanceRecord[]
  onDispatched: () => Promise<void>
}

export function ManualDispatchPanel({ facilities, ambulances, onDispatched }: ManualDispatchPanelProps) {
  const [facilityId, setFacilityId] = useState('')
  const [ambulanceId, setAmbulanceId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableAmbulances = ambulances.filter(ambulance => ambulance.status === 'available')

  const facilityOptions = useMemo(() => {
    const seen = new Set<string>()
    return [...facilities]
      .sort((left, right) => left.name.localeCompare(right.name))
      .filter(facility => {
        if (isArabicLabel(facility.name)) return false
        const key = `${facility.name}|${facility.governorate}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }, [facilities])

  async function handleSubmit() {
    if (!facilityId || !ambulanceId) {
      setErrorMessage('Select facility and ambulance')
      return
    }
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await manualDispatch(facilityId, ambulanceId)
      await onDispatched()
      setFacilityId('')
      setAmbulanceId('')
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Dispatch failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Manual Dispatch</h2>
      <div className="space-y-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="field-label">Facility</span>
          <select className="control" value={facilityId} onChange={event => setFacilityId(event.target.value)}>
            <option value="">Select facility</option>
            {facilityOptions.map(facility => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="field-label">Ambulance</span>
          <select className="control" value={ambulanceId} onChange={event => setAmbulanceId(event.target.value)}>
            <option value="">Select ambulance</option>
            {availableAmbulances.map(ambulance => (
              <option key={ambulance.id} value={ambulance.id}>{ambulance.code}</option>
            ))}
          </select>
        </label>
        {errorMessage && <p className="alert-error">{errorMessage}</p>}
        <button
          type="button"
          disabled={isSubmitting}
          className="btn btn-success w-full"
          onClick={handleSubmit}
        >
          Dispatch Ambulance
        </button>
      </div>
    </section>
  )
}
