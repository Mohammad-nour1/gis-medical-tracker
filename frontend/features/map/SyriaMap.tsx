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
  focusFacilityId?: string | null
  focusToken?: string | null
}

function facilityIcon(status: FacilityRecord['status'], emphasized: boolean) {
  const color = status === 'RED' ? designTokens.color.statusRed : designTokens.color.statusGreen
  const size = emphasized ? designTokens.map.facilityMarkerSize + 6 : designTokens.map.facilityMarkerSize
  const glow = status === 'RED' ? 'rgba(255,92,122,0.55)' : 'rgba(45,212,160,0.55)'
  const ring = emphasized
    ? `<span style="position:absolute;inset:-10px;border-radius:9999px;border:2px solid ${color};opacity:.55;"></span>`
    : ''
  return L.divIcon({
    className: 'geo-marker',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${ring}
      <span style="position:absolute;inset:-6px;border-radius:9999px;background:${glow};filter:blur(6px);opacity:.85;"></span>
      <span style="position:absolute;inset:0;border-radius:9999px;border:2px solid rgba(255,255,255,.92);background:${color};box-shadow:0 0 12px ${glow};"></span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

function ambulanceIcon(status: AmbulanceRecord['status'], headingDeg?: number, enRoute?: boolean) {
  const color = status === 'dispatched' || enRoute
    ? designTokens.color.ambulanceDispatched
    : designTokens.color.ambulanceAvailable
  const size = designTokens.map.ambulanceMarkerSize + (enRoute ? 6 : 2)
  const glow = status === 'dispatched' || enRoute ? 'rgba(251,191,36,0.65)' : 'rgba(56,189,248,0.55)'
  const showArrow = Boolean(enRoute)
  const facing = headingDeg ?? 0
  const arrow = !showArrow
    ? ''
    : `<span class="ambulance-arrow" style="transform:translateX(-50%) rotate(${facing}deg);">▲</span>`
  return L.divIcon({
    className: 'geo-marker',
    html: `<div style="position:relative;width:${size + 16}px;height:${size + 22}px;">
      ${arrow}
      <span style="position:absolute;left:50%;top:58%;width:${size}px;height:${size}px;margin-left:-${size / 2}px;margin-top:-${size / 2}px;border-radius:5px;border:2px solid #fff;background:${color};transform:rotate(45deg);box-shadow:0 0 12px ${glow};"></span>
    </div>`,
    iconSize: [size + 16, size + 22],
    iconAnchor: [(size + 16) / 2, (size + 22) / 2]
  })
}

export function SyriaMap({
  facilities,
  ambulances,
  historicalMode,
  focusFacilityId = null,
  focusToken = null
}: SyriaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const facilityClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const ambulanceLayerRef = useRef<L.LayerGroup | null>(null)
  const ambulanceMarkersRef = useRef<Map<string, L.Marker>>(new Map())
  const lastFocusTokenRef = useRef<string | null>(null)

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

    const latestLocationByAmbulance = new Map<string, (typeof locationEvents)[number]>()
    for (const event of locationEvents) {
      if (!latestLocationByAmbulance.has(event.payload.ambulanceId)) {
        latestLocationByAmbulance.set(event.payload.ambulanceId, event)
      }
    }

    for (const [ambulanceId, event] of latestLocationByAmbulance) {
      const current = next.get(ambulanceId)
      if (!current) continue
      next.set(ambulanceId, {
        ...current,
        location: event.payload.location,
        headingDeg: event.payload.headingDeg,
        targetFacilityId: event.payload.targetFacilityId ?? null
      })
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
      const emphasized = focusFacilityId === facility.id
      const marker = L.marker([facility.location.latitude, facility.location.longitude], {
        icon: facilityIcon(facility.status, emphasized),
        facilityStatus: facility.status,
        zIndexOffset: emphasized ? 600 : 0
      } as L.MarkerOptions & { facilityStatus: FacilityRecord['status'] })
      marker.bindPopup(`
        <strong>${facility.name}</strong><br/>
        ${facility.type} · ${facility.governorate}<br/>
        Beds: ${facility.occupiedBeds}/${facility.totalBeds}<br/>
        Status: ${facility.status}
      `)
      cluster.addLayer(marker)
    }
  }, [liveFacilities, focusFacilityId])

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
      const enRoute = Boolean(ambulance.targetFacilityId)
      const icon = ambulanceIcon(ambulance.status, ambulance.headingDeg, enRoute)
      const existing = ambulanceMarkersRef.current.get(ambulance.id)
      if (existing) {
        existing.setLatLng(position)
        existing.setIcon(icon)
        existing.setZIndexOffset(enRoute ? 700 : 200)
        continue
      }
      const marker = L.marker(position, { icon, zIndexOffset: enRoute ? 700 : 200 })
      marker.bindPopup(`<strong>${ambulance.code}</strong><br/>Status: ${ambulance.status}`)
      ambulanceMarkersRef.current.set(ambulance.id, marker)
      layer.addLayer(marker)
    }
  }, [liveAmbulances])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusFacilityId || historicalMode) return
    const token = focusToken ?? focusFacilityId
    if (lastFocusTokenRef.current === token) return
    const target = liveFacilities.find(facility => facility.id === focusFacilityId)
    if (!target) return
    lastFocusTokenRef.current = token
    map.flyTo([target.location.latitude, target.location.longitude], Math.max(map.getZoom(), 9), {
      animate: true,
      duration: 0.55
    })
  }, [focusFacilityId, focusToken, liveFacilities, historicalMode])

  return <div ref={mapContainerRef} className="map-shell" />
}
