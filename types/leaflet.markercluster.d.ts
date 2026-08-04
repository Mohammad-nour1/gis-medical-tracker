import 'leaflet.markercluster'

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions)
    addLayer(layer: Layer): this
    clearLayers(): this
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}

declare module 'leaflet.markercluster' {}
