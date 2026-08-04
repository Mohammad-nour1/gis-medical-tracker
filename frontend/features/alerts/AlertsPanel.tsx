'use client'

import { useGeoMedStreamEvents, useGeoMedConnectionStatus } from 'react-med-geo-streamer'

export function AlertsPanel() {
  const alerts = useGeoMedStreamEvents('occupancy-critical')
  const connectionStatus = useGeoMedConnectionStatus()

  return (
    <section className="panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title mb-0">Emergency Alerts</h2>
        <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-1 text-xs text-[var(--color-text-muted)]">
          {connectionStatus}
        </span>
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No critical occupancy alerts.</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {alerts.map(alert => (
            <li key={alert.id} className="rounded-[var(--radius-control)] border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-sm">
              <p className="font-medium text-[var(--color-danger-text)]">{alert.payload.facilityName}</p>
              <p className="text-xs text-[var(--color-status-red)]">Critical occupancy detected</p>
              <p className="text-xs text-[var(--color-text-muted)]">{new Date(alert.receivedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
