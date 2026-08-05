import 'leaflet'

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    maxClusterRadius?: number
    spiderfyOnMaxZoom?: boolean
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon | Icon
  }

  class MarkerCluster extends Marker {
    getAllChildMarkers(): Marker[]
    getChildCount(): number
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions)
    addLayer(layer: Layer): this
    clearLayers(): this
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}

declare module 'leaflet.markercluster' {}
