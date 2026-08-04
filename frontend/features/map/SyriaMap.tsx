'use client'

import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster'
import { useGeoMedStreamEvents } from 'react-med-geo-streamer'
import { AmbulanceRecord, FacilityRecord } from '../../types/records'
import { designTokens } from '../../design/tokens'

type SyriaMapProps = {
  facilities: FacilityRecord[]
  ambulances: AmbulanceRecord[]
  historicalMode: boolean
}

function facilityIcon(status: FacilityRecord['status']) {
  const color = status === 'RED' ? designTokens.color.statusRed : designTokens.color.statusGreen
  const size = designTokens.map.facilityMarkerSize
  const glow = status === 'RED' ? 'rgba(255,92,122,0.55)' : 'rgba(45,212,160,0.55)'
  return L.divIcon({
    className: 'geo-marker',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <span style="position:absolute;inset:-6px;border-radius:9999px;background:${glow};filter:blur(6px);opacity:.85;"></span>
      <span style="position:absolute;inset:0;border-radius:9999px;border:2px solid rgba(255,255,255,.92);background:${color};box-shadow:0 0 12px ${glow};"></span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

function ambulanceIcon(status: AmbulanceRecord['status']) {
  const color = status === 'dispatched'
    ? designTokens.color.ambulanceDispatched
    : designTokens.color.ambulanceAvailable
  const size = designTokens.map.ambulanceMarkerSize
  const glow = status === 'dispatched' ? 'rgba(251,191,36,0.55)' : 'rgba(56,189,248,0.55)'
  return L.divIcon({
    className: 'geo-marker',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <span style="position:absolute;inset:-5px;border-radius:6px;background:${glow};filter:blur(5px);opacity:.8;"></span>
      <span style="position:absolute;inset:0;border-radius:5px;border:2px solid rgba(255,255,255,.92);background:${color};transform:rotate(45deg);box-shadow:0 0 10px ${glow};"></span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export function SyriaMap({ facilities, ambulances, historicalMode }: SyriaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const facilityClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const ambulanceLayerRef = useRef<L.LayerGroup | null>(null)
  const ambulanceMarkersRef = useRef<Map<string, L.Marker>>(new Map())

  const locationEvents = useGeoMedStreamEvents('ambulance-location')
  const dispatchEvents = useGeoMedStreamEvents('ambulance-dispatched')
  const statusEvents = useGeoMedStreamEvents('status-changed')

  const liveAmbulances = useMemo(() => {
    if (historicalMode) return ambulances
    const next = new Map(ambulances.map(ambulance => [ambulance.id, { ...ambulance }]))

    for (const event of [...dispatchEvents].reverse()) {
      const current = next.get(event.payload.ambulanceId)
      if (current) {
        next.set(event.payload.ambulanceId, {
          ...current,
          status: 'dispatched',
          location: current.location
        })
      }
    }

    for (const event of [...locationEvents].reverse()) {
      const current = next.get(event.payload.ambulanceId)
      if (current) {
        next.set(event.payload.ambulanceId, {
          ...current,
          location: event.payload.location
        })
      }
    }

    return Array.from(next.values())
  }, [ambulances, locationEvents, dispatchEvents, historicalMode])

  const liveFacilities = useMemo(() => {
    if (historicalMode) return facilities
    const next = facilities.map(facility => ({ ...facility }))
    for (const event of [...statusEvents].reverse()) {
      const target = next.find(facility => facility.id === event.payload.facilityId)
      if (target) target.status = event.payload.status
    }
    return next
  }, [facilities, statusEvents, historicalMode])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [designTokens.map.centerLatitude, designTokens.map.centerLongitude],
      zoom: designTokens.map.zoom,
      minZoom: designTokens.map.minZoom,
      maxZoom: designTokens.map.maxZoom,
      attributionControl: false
    })

    L.control.attribution({
      position: 'bottomright',
      prefix: false
    }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM'
    }).addTo(map)

    facilityClusterRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      iconCreateFunction(cluster) {
        const childMarkers = cluster.getAllChildMarkers()
        let redCount = 0
        for (const marker of childMarkers) {
          if ((marker.options as { facilityStatus?: string }).facilityStatus === 'RED') {
            redCount += 1
          }
        }
        const count = childMarkers.length
        const mostlyRed = redCount >= count / 2
        const color = mostlyRed ? designTokens.color.statusRed : designTokens.color.statusGreen
        const size = count >= 10 ? 46 : 38
        return L.divIcon({
          html: `<div class="facility-cluster" style="--cluster-color:${color};width:${size}px;height:${size}px;">${count}</div>`,
          className: 'facility-cluster-wrap',
          iconSize: L.point(size, size),
          iconAnchor: L.point(size / 2, size / 2)
        })
      }
    })
    ambulanceLayerRef.current = L.layerGroup()

    map.addLayer(facilityClusterRef.current)
    map.addLayer(ambulanceLayerRef.current)

    mapRef.current = map

    const handleResize = () => {
      map.invalidateSize()
    }
    window.addEventListener('resize', handleResize)
    window.setTimeout(handleResize, 0)

    return () => {
      window.removeEventListener('resize', handleResize)
      map.remove()
      mapRef.current = null
      facilityClusterRef.current = null
      ambulanceLayerRef.current = null
      ambulanceMarkersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    const cluster = facilityClusterRef.current
    if (!cluster) return
    cluster.clearLayers()
    for (const facility of liveFacilities) {
      const marker = L.marker([facility.location.latitude, facility.location.longitude], {
        icon: facilityIcon(facility.status),
        facilityStatus: facility.status
      } as L.MarkerOptions & { facilityStatus: FacilityRecord['status'] })
      marker.bindPopup(`
        <strong>${facility.name}</strong><br/>
        ${facility.type} · ${facility.governorate}<br/>
        Beds: ${facility.occupiedBeds}/${facility.totalBeds}<br/>
        Status: ${facility.status}
      `)
      cluster.addLayer(marker)
    }
  }, [liveFacilities])

  useEffect(() => {
    const layer = ambulanceLayerRef.current
    if (!layer) return

    const activeIds = new Set(liveAmbulances.map(ambulance => ambulance.id))

    for (const [id, marker] of ambulanceMarkersRef.current.entries()) {
      if (!activeIds.has(id)) {
        layer.removeLayer(marker)
        ambulanceMarkersRef.current.delete(id)
      }
    }

    for (const ambulance of liveAmbulances) {
      const position: L.LatLngExpression = [ambulance.location.latitude, ambulance.location.longitude]
      const existing = ambulanceMarkersRef.current.get(ambulance.id)
      if (existing) {
        existing.setLatLng(position)
        existing.setIcon(ambulanceIcon(ambulance.status))
        continue
      }
      const marker = L.marker(position, { icon: ambulanceIcon(ambulance.status) })
      marker.bindPopup(`<strong>${ambulance.code}</strong><br/>Status: ${ambulance.status}`)
      ambulanceMarkersRef.current.set(ambulance.id, marker)
      layer.addLayer(marker)
    }
  }, [liveAmbulances])

  return <div ref={mapContainerRef} className="map-shell" />
}
