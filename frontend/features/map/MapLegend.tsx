export function MapLegend() {
  return (
    <aside className="map-legend" aria-label="Map legend">
      <p className="map-legend-title">Map Legend</p>
      <ul className="map-legend-list">
        <li>
          <span className="legend-swatch legend-facility-green" aria-hidden="true" />
          <span>
            <strong>Facility GREEN</strong>
          </span>
        </li>
        <li>
          <span className="legend-swatch legend-facility-red" aria-hidden="true" />
          <span>
            <strong>Facility RED</strong>
          </span>
        </li>
        <li>
          <span className="legend-swatch legend-ambulance-available" aria-hidden="true" />
          <span>
            <strong>Ambulance available</strong>
          </span>
        </li>
        <li>
          <span className="legend-swatch legend-ambulance-dispatched" aria-hidden="true" />
          <span>
            <strong>Ambulance dispatched</strong>
          </span>
        </li>
        <li>
          <span className="legend-swatch legend-enroute-arrow" aria-hidden="true">▲</span>
          <span>
            <strong>Arrow → emergency</strong>
          </span>
        </li>
        <li>
          <span className="legend-swatch legend-cluster" aria-hidden="true">8</span>
          <span>
            <strong>Cluster count</strong>
          </span>
        </li>
      </ul>
    </aside>
  )
}
