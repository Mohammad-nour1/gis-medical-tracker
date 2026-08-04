import assert from 'node:assert/strict'
import test from 'node:test'
import { Facility } from '../../entities/Facility'
import { Ambulance } from '../../entities/Ambulance'
import { OccupancySnapshot } from '../../entities/OccupancySnapshot'
import { RouteAssignment } from '../../entities/RouteAssignment'
import { CalculateAvailableBeds } from '../CalculateAvailableBeds'
import { EvaluateOccupancyStatus, DefaultOccupancyThresholdStrategy } from '../EvaluateOccupancyStatus'
import { FindNearestAmbulance } from '../FindNearestAmbulance'
import { AssignRouteAndDispatch } from '../AssignRouteAndDispatch'
import { ProcessFacilityMonitoringCycle } from '../ProcessFacilityMonitoringCycle'
import { FacilityRepository } from '../../ports/FacilityRepository'
import { OccupancySnapshotRepository } from '../../ports/OccupancySnapshotRepository'
import { AmbulanceRepository } from '../../ports/AmbulanceRepository'
import { RouteAssignmentRepository } from '../../ports/RouteAssignmentRepository'
import { GeoDistanceCalculator } from '../../ports/GeoDistanceCalculator'
import { RealtimeBroadcaster } from '../../ports/RealtimeBroadcaster'
import { IdGenerator } from '../../ports/IdGenerator'

class FakeIdGenerator implements IdGenerator {
  private counter = 0
  generate(): string {
    this.counter += 1
    return `id-${this.counter}`
  }
}

class FakeFacilityRepository implements FacilityRepository {
  public statuses: Array<{ id: string; status: Facility['status'] }> = []
  async findAll() { return [] }
  async findById() { return null }
  async findByGovernorate() { return [] }
  async findWithFilters() { return [] }
  async updateStatus(id: string, status: Facility['status']) {
    this.statuses.push({ id, status })
  }
  async updateOccupiedBeds() {}
}

class FakeOccupancySnapshotRepository implements OccupancySnapshotRepository {
  public records: OccupancySnapshot[] = []
  async record(snapshot: OccupancySnapshot) {
    this.records.push(snapshot)
  }
  async findClosestTo() { return null }
  async findAllClosestToTimestamp() { return [] }
}

class FakeAmbulanceRepository implements AmbulanceRepository {
  constructor(private ambulances: Ambulance[]) {}
  async findAll() { return this.ambulances }
  async findAvailable() { return this.ambulances.filter(ambulance => ambulance.status === 'available') }
  async findById(id: string) { return this.ambulances.find(ambulance => ambulance.id === id) ?? null }
  async updateStatus(id: string, status: Ambulance['status']) {
    const ambulance = this.ambulances.find(item => item.id === id)
    if (ambulance) {
      Object.assign(ambulance, { status })
    }
  }
  async updateLocation() {}
}

class FakeRouteAssignmentRepository implements RouteAssignmentRepository {
  public assignments: RouteAssignment[] = []
  async save(assignment: RouteAssignment) {
    this.assignments.push(assignment)
  }
}

class FakeGeoDistanceCalculator implements GeoDistanceCalculator {
  constructor(private nearest: Ambulance | null) {}
  async findNearestAmbulance() {
    return this.nearest
  }
}

class FakeBroadcaster implements RealtimeBroadcaster {
  public events: Array<{ channel: string; event: string; payload: unknown }> = []
  async broadcast(channel: string, event: string, payload: unknown) {
    this.events.push({ channel, event, payload })
  }
}

function createFacility(occupiedBeds: number, totalBeds = 100): Facility {
  return new Facility(
    'facility-1',
    'Damascus Central',
    'hospital',
    'Damascus',
    totalBeds,
    occupiedBeds,
    { latitude: 33.5, longitude: 36.3 },
    'GREEN'
  )
}

test('RED path triggers alert then nearest ambulance then dispatch', async () => {
  const facilityRepository = new FakeFacilityRepository()
  const occupancySnapshotRepository = new FakeOccupancySnapshotRepository()
  const nearest = new Ambulance('amb-1', 'AMB-01', { latitude: 33.51, longitude: 36.31 }, 'available')
  const ambulanceRepository = new FakeAmbulanceRepository([nearest])
  const routeAssignmentRepository = new FakeRouteAssignmentRepository()
  const broadcaster = new FakeBroadcaster()
  const idGenerator = new FakeIdGenerator()

  const assignRouteAndDispatch = new AssignRouteAndDispatch(
    routeAssignmentRepository,
    ambulanceRepository,
    broadcaster,
    idGenerator
  )

  const cycle = new ProcessFacilityMonitoringCycle(
    facilityRepository,
    occupancySnapshotRepository,
    new CalculateAvailableBeds(),
    new EvaluateOccupancyStatus(new DefaultOccupancyThresholdStrategy(90)),
    new FindNearestAmbulance(ambulanceRepository, new FakeGeoDistanceCalculator(nearest)),
    assignRouteAndDispatch,
    broadcaster,
    idGenerator
  )

  await cycle.execute(createFacility(95))

  assert.equal(facilityRepository.statuses[0]?.status, 'RED')
  assert.equal(broadcaster.events[0]?.event, 'occupancy-critical')
  assert.equal(routeAssignmentRepository.assignments[0]?.ambulanceId, 'amb-1')
  assert.equal(broadcaster.events.some(event => event.event === 'ambulance-dispatched'), true)
  assert.equal(occupancySnapshotRepository.records.length, 1)
})

test('GREEN path never dispatches ambulance and still assigns route record', async () => {
  const facilityRepository = new FakeFacilityRepository()
  const occupancySnapshotRepository = new FakeOccupancySnapshotRepository()
  const ambulanceRepository = new FakeAmbulanceRepository([])
  const routeAssignmentRepository = new FakeRouteAssignmentRepository()
  const broadcaster = new FakeBroadcaster()
  const idGenerator = new FakeIdGenerator()

  const assignRouteAndDispatch = new AssignRouteAndDispatch(
    routeAssignmentRepository,
    ambulanceRepository,
    broadcaster,
    idGenerator
  )

  const cycle = new ProcessFacilityMonitoringCycle(
    facilityRepository,
    occupancySnapshotRepository,
    new CalculateAvailableBeds(),
    new EvaluateOccupancyStatus(new DefaultOccupancyThresholdStrategy(90)),
    new FindNearestAmbulance(ambulanceRepository, new FakeGeoDistanceCalculator(null)),
    assignRouteAndDispatch,
    broadcaster,
    idGenerator
  )

  await cycle.execute(createFacility(50))

  assert.equal(facilityRepository.statuses[0]?.status, 'GREEN')
  assert.equal(routeAssignmentRepository.assignments[0]?.ambulanceId, null)
  assert.equal(broadcaster.events.some(event => event.event === 'occupancy-critical'), false)
  assert.equal(broadcaster.events.some(event => event.event === 'status-changed'), true)
})
