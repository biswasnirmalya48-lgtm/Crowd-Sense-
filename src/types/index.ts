export interface Facility {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  crowdLevel: 'Free' | 'Busy' | 'Crowded';
  trend?: 'rising' | 'falling' | 'steady';
  recentDelta?: number;
}
