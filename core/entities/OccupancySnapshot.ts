export class OccupancySnapshot {
  constructor(
    public readonly id: string,
    public readonly facilityId: string,
    public readonly occupiedBeds: number,
    public readonly totalBeds: number,
    public readonly status: 'RED' | 'GREEN',
    public readonly recordedAt: Date
  ) {}
}