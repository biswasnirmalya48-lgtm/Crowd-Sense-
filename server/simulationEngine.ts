import { Facility, INITIAL_FACILITIES } from './seedData.js';

export interface FacilityWithDetails extends Facility {
  occupancyPercentage: number;
  availableSpots: number;
  crowdLevel: 'Free' | 'Busy' | 'Crowded';
}

export class SimulationEngine {
  private facilities: Map<string, Facility> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private tickIntervalMs: number = 5000;

  constructor() {
    this.resetToDefaults();
    this.startAutoSimulation();
  }

  public resetToDefaults() {
    this.facilities.clear();
    const currentHour = new Date().getHours();

    for (const fac of INITIAL_FACILITIES) {
      const baselinePct = fac.hourlyBaseline[currentHour] ?? 35;
      const noise = Math.random() * 8 - 4;
      const computedPct = Math.max(0, Math.min(100, baselinePct + noise));
      const startingOccupancy = Math.max(0, Math.min(fac.capacity, Math.round((computedPct / 100) * fac.capacity)));

      this.facilities.set(fac.id, {
        ...fac,
        currentOccupancy: startingOccupancy,
        trend: 'steady',
        recentDelta: 0,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  public startAutoSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  private tick() {
    const hour = new Date().getHours();

    for (const [id, fac] of this.facilities.entries()) {
      const baselinePct = fac.hourlyBaseline[hour] ?? 25;
      const currentPct = (fac.currentOccupancy / fac.capacity) * 100;
      
      // Drift slightly towards diurnal baseline with small random noise
      const drift = (baselinePct - currentPct) * 0.08;
      const randomNoise = (Math.random() * 4 - 2); // small drift between -2 and +2
      const netDelta = Math.round(drift + randomNoise);

      if (netDelta !== 0) {
        // Guarantee numbers never go below 0 or above capacity
        const newOccupancy = Math.max(0, Math.min(fac.capacity, fac.currentOccupancy + netDelta));
        const actualDelta = newOccupancy - fac.currentOccupancy;
        const trend = actualDelta > 1 ? 'rising' : actualDelta < -1 ? 'falling' : 'steady';

        this.facilities.set(id, {
          ...fac,
          currentOccupancy: newOccupancy,
          trend: actualDelta !== 0 ? trend : fac.trend,
          recentDelta: actualDelta,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }

  public checkIn(id: string, count: number = 1): FacilityWithDetails | null {
    const fac = this.facilities.get(id);
    if (!fac) return null;

    const newOcc = Math.max(0, Math.min(fac.capacity, fac.currentOccupancy + count));
    const delta = newOcc - fac.currentOccupancy;
    const updated: Facility = {
      ...fac,
      currentOccupancy: newOcc,
      trend: delta > 0 ? 'rising' : fac.trend,
      recentDelta: delta,
      lastUpdated: new Date().toISOString()
    };
    this.facilities.set(id, updated);
    return this.enrichFacility(updated);
  }

  public checkOut(id: string, count: number = 1): FacilityWithDetails | null {
    const fac = this.facilities.get(id);
    if (!fac) return null;

    const newOcc = Math.max(0, Math.min(fac.capacity, fac.currentOccupancy - count));
    const delta = newOcc - fac.currentOccupancy;
    const updated: Facility = {
      ...fac,
      currentOccupancy: newOcc,
      trend: delta < 0 ? 'falling' : fac.trend,
      recentDelta: delta,
      lastUpdated: new Date().toISOString()
    };
    this.facilities.set(id, updated);
    return this.enrichFacility(updated);
  }

  public getAllFacilities(): FacilityWithDetails[] {
    const list = Array.from(this.facilities.values());
    return list.map((f) => this.enrichFacility(f));
  }

  public getFacilityById(id: string): FacilityWithDetails | null {
    const fac = this.facilities.get(id);
    if (!fac) return null;
    return this.enrichFacility(fac);
  }

  private enrichFacility(facility: Facility): FacilityWithDetails {
    const occupancyPercentage = Math.round((facility.currentOccupancy / facility.capacity) * 100);
    const availableSpots = Math.max(0, facility.capacity - facility.currentOccupancy);

    // Green "Free" under 40%, Yellow "Busy" 40-75%, Red "Crowded" over 75%
    let crowdLevel: 'Free' | 'Busy' | 'Crowded' = 'Free';
    if (occupancyPercentage > 75) crowdLevel = 'Crowded';
    else if (occupancyPercentage >= 40) crowdLevel = 'Busy';

    return {
      ...facility,
      occupancyPercentage,
      availableSpots,
      crowdLevel
    };
  }
}

export const simulationEngine = new SimulationEngine();
