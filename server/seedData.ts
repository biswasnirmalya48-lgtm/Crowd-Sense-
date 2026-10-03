// ==========================================
// IEM SALT LAKE - FACILITY CAPACITIES CONFIG
// Easily edit capacities and facilities below
// ==========================================
export const IEM_FACILITIES_CONFIG = [
  { id: 'library', name: 'Library', capacity: 150, groups: ['Study'] },
  { id: 'computer-lab', name: 'Computer Lab', capacity: 60, groups: ['Labs', 'Study'] },
  { id: 'workshop', name: 'Workshop', capacity: 40, groups: ['Labs'] },
  { id: 'chemistry-lab', name: 'Chemistry Lab', capacity: 30, groups: ['Labs'] },
  { id: 'ev-lab', name: 'EV Lab', capacity: 25, groups: ['Labs'] },
  { id: 'language-lab', name: 'Language Lab', capacity: 40, groups: ['Labs', 'Study'] },
  { id: 'canteen', name: 'Canteen', capacity: 200, groups: ['Food and Leisure'] },
  { id: 'sports-room', name: 'Sports Room', capacity: 40, groups: ['Food and Leisure'] },
] as const;

export interface Facility {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  groups: string[];
  lastUpdated: string;
  trend: 'rising' | 'falling' | 'steady';
  recentDelta: number;
  hourlyBaseline: number[];
}

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'library',
    name: 'Library',
    capacity: 150,
    currentOccupancy: 85,
    groups: ['Study'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Busier in the afternoon and before exams
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 5, 22, 38, 52, 65, 76, 82, 85, 78, 62, 45, 25, 10, 0, 0, 0, 0
    ]
  },
  {
    id: 'computer-lab',
    name: 'Computer Lab',
    capacity: 60,
    currentOccupancy: 48,
    groups: ['Labs', 'Study'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Busy only during class hours (10 AM - 4 PM), nearly empty after
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 0, 10, 35, 78, 85, 55, 75, 84, 68, 18, 5, 0, 0, 0, 0, 0, 0
    ]
  },
  {
    id: 'workshop',
    name: 'Workshop',
    capacity: 40,
    currentOccupancy: 31,
    groups: ['Labs'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Class hours 10 AM - 4 PM
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 0, 5, 25, 72, 80, 48, 70, 75, 58, 12, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  {
    id: 'chemistry-lab',
    name: 'Chemistry Lab',
    capacity: 30,
    currentOccupancy: 22,
    groups: ['Labs'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Class hours 10 AM - 4 PM
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 0, 5, 20, 68, 78, 42, 65, 74, 52, 10, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  {
    id: 'ev-lab',
    name: 'EV Lab',
    capacity: 25,
    currentOccupancy: 8,
    groups: ['Labs'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Class hours 10 AM - 4 PM
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 0, 5, 18, 60, 70, 38, 62, 70, 45, 8, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  {
    id: 'language-lab',
    name: 'Language Lab',
    capacity: 40,
    currentOccupancy: 12,
    groups: ['Labs', 'Study'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Class hours & study sessions
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 0, 10, 25, 55, 62, 35, 50, 58, 40, 12, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  {
    id: 'canteen',
    name: 'Canteen',
    capacity: 200,
    currentOccupancy: 165,
    groups: ['Food and Leisure'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Busiest 1-2 PM (13:00-14:00) and break times (11:00 AM), quiet otherwise
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 5, 15, 28, 48, 70, 55, 94, 90, 42, 28, 15, 5, 0, 0, 0, 0, 0
    ]
  },
  {
    id: 'sports-room',
    name: 'Sports Room',
    capacity: 40,
    currentOccupancy: 14,
    groups: ['Food and Leisure'],
    trend: 'steady',
    recentDelta: 0,
    lastUpdated: new Date().toISOString(),
    // Busier in the late afternoon (3 PM - 6 PM)
    hourlyBaseline: [
      0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 15, 20, 25, 30, 42, 72, 85, 80, 48, 15, 0, 0, 0, 0
    ]
  }
];
