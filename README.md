# CrowdSense – Campus Facility Crowd Monitor

link : https://crowdsense.ai.studio

A real-time, responsive web application for university students and facility administrators to monitor live campus crowd levels, discover less-crowded alternative spaces, view 24-hour predictive occupancy forecasts, and receive smart vacancy notifications.

---

## 🌟 Key Features

1. **Live Campus Facility Dashboard**
   - Live occupancy percentage per facility with color-coded density badges:
     - 🟢 **Low Crowd (<40%)**: Green
     - 🟡 **Moderate (40–75%)**: Amber
     - 🔴 **Crowded (>75%)**: Rose/Red
   - Animated visual progress bar with capacity indicators.
   - Trend direction indicator (↗ Rising, ↘ Falling, → Steady) with recent net delta.
   - Live timestamp tracking ("Updated 5s ago").
   - Instant Check-in (+1) / Check-out (-1) buttons for quick interactive demonstration.

2. **Smart Alternatives Recommendation Engine**
   - Automatically triggered whenever a facility is Moderate or Crowded.
   - Recommends the 2 nearest less-crowded facilities of a similar or complementary type.
   - Computes walking distance and estimated walk time (e.g. `2 min walk`, `3 min walk`) using Euclidean campus coordinates.
   - Displays clear recommendation rationale (e.g., "Same facility type with 48 open workstations (28% full)").

3. **24-Hour Diurnal Crowd Prediction**
   - Interactive Recharts area chart showing 24-hour predictive occupancy curve.
   - Highlights current hour with a vertical line and live benchmark.
   - Highlights "Best time to visit" with lowest projected congestion window.
   - Highlights quietest windows (<35%) and rush hours (>75%).

4. **Interactive Campus Spatial Map**
   - Custom responsive SVG campus map depicting campus quads, academic blocks, athletic fields, and walkways.
   - Color-coded pins with live occupancy percentages and pulsing beacons for crowded zones.
   - Hover tooltips and one-click pin selection to open detailed 24h predictions and check-in controls.

5. **Search & Multi-Dimensional Filters**
   - Search by facility name, block, building, or amenities (e.g., "silent", "gpu", "coffee").
   - Filter by facility category: Library, Lab, Fitness, Dining, Lounge, Sports.
   - Filter by density tier (Low, Moderate, Crowded).
   - "Show only less crowded (<40%)" one-click toggle switch.
   - Sort by Least Crowded, Most Crowded, Largest Capacity, or Alphabetical.

6. **Check-in Simulation & Admin Console**
   - Real-time "+1 Entry" and "-1 Exit" simulation buttons on facility cards and modal.
   - Burst (+5 / -5) buttons.
   - Admin Panel with individual occupancy sliders for all facilities.
   - One-click event scenarios:
     - *Exam Week Crunch* (Library and Labs spike to >90%)
     - *Lunch Rush* (Cafeteria spikes to 96%)
     - *After-Class Gym Surge* (Fitness center peaks at 92%)
     - *Rainy Day Indoors* (Outdoor sports drop to 4%; indoor lounges pack)
     - *Quiet Weekend* (All facilities drop to 15–25%)
   - Campus Time Travel selector (test morning 8:00 AM vs lunch 12:30 PM vs evening 18:00 PM vs late night).

7. **In-App Threshold Notifications**
   - "Notify me when below X%" feature (choose 30%, 40%, 50% or custom target).
   - Instant in-app toast notification when occupancy drops below the target threshold.
   - Web Audio API synthesized audio chime (with mute/unmute toggle).

8. **Peak Hours & Weekly Intelligence**
   - Day × Hour Heatmap (7 Days × 18 Hours, 06:00 to 23:00) with color-intensity cells and hover tooltips.
   - Weekly Peak vs. Daily Average bar chart.
   - Actionable student tips for avoiding lines at dining commons and libraries.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Web Audio API
- **Backend**: Node.js, Express, TypeScript (run via `tsx`)
- **Build Tool**: Vite
- **Data Engine**: Stateful background diurnal simulation engine with Poisson micro-fluctuations and REST endpoints

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Run

1. Clone or open the project directory:
   ```bash
   npm install
   ```

2. Start the development server (runs both the Express backend and Vite frontend on port 3000):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 📡 REST API Endpoints

The Express server exposes the following REST endpoints under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/facilities` | Returns all facilities with current occupancy %, status, trend, and alternatives |
| `GET` | `/api/facilities/:id` | Returns single facility details and amenities |
| `GET` | `/api/facilities/:id/forecast` | Returns 24-hour hourly prediction points and best visit windows |
| `POST` | `/api/facilities/:id/checkin` | Simulates entry (`{ count: 1 }`), increments occupancy, updates trend to rising |
| `POST` | `/api/facilities/:id/checkout` | Simulates exit (`{ count: 1 }`), decrements occupancy, updates trend to falling |
| `PUT` | `/api/facilities/:id` | Admin override: sets exact occupancy number (`{ occupancy: 120 }`) |
| `GET` | `/api/insights/heatmap` | Returns 7-day × 24-hour crowd density matrix (supports optional `?facilityId=`) |
| `GET` | `/api/insights/weekly` | Returns day-by-day weekly peak vs. average occupancy stats |
| `GET` | `/api/simulation/status` | Returns simulation engine status, tick rate, and simulated campus hour |
| `POST` | `/api/simulation/settings` | Updates auto-simulation state (`{ isRunning: boolean, intervalMs: number }`) |
| `POST` | `/api/simulation/scenario` | Triggers a preset event (`{ scenario: 'exam_crunch' \| 'lunch_rush' \| ... }`) |
| `POST` | `/api/simulation/time` | Fast-forwards campus time (`{ hour: 12 }` or `{ hour: null }` for system clock) |
| `POST` | `/api/simulation/reset` | Resets all facilities to their realistic diurnal baseline |

---

## 🧠 How the Data Simulation Works

1. **Diurnal Baseline Curves**:
   Each facility has an empirical 24-hour diurnal profile (`hourlyBaseline: number[24]`) reflecting realistic campus human behavior:
   - **Central Library**: Slow mornings (5-18%), gradual daytime build-up, major evening study peak (6:00 PM – 9:30 PM, reaching 85-88%).
   - **Computer Labs**: Peak during engineering lab hours (10:00 AM – 4:00 PM, reaching 82%). Lab 2 is configured as a quieter alternative.
   - **Campus Fitness Center**: Twin rush windows: morning workout (6:30 AM – 8:30 AM, ~78%) and after-class evening surge (5:00 PM – 8:00 PM, ~88%).
   - **Main Dining Commons**: Breakfast spike (8:00 AM), massive lunch surge (11:30 AM – 2:00 PM, up to 96%), and dinner surge (6:00 PM – 7:30 PM).
   - **Sports Ground**: Early morning workouts and late afternoon recreational sports.
   - **Student Common Room**: Steady social flow throughout the day and open 24/7.

2. **Micro-Fluctuation Engine**:
   Every 5 seconds, the engine runs a tick:
   - Calculates the delta between current occupancy and the diurnal baseline for the current campus hour.
   - Adds slight Gaussian random noise to mimic students walking in and out.
   - Updates `recentDelta`, `trend` (`rising`, `falling`, `steady`), and `lastUpdated`.

3. **Smart Alternatives Matching Algorithm**:
   When a facility is Moderate or Crowded (occupancy ≥ 40%):
   - Finds facilities with lower occupancy.
   - Prioritizes same facility type (e.g., Computer Lab 1 → Computer Lab 2) or compatible spaces (Library → Lounge / Quiet Lab).
   - Computes walking distance and time from map coordinate geometry.
   - Ranks candidates by lowest density and shortest walking time.

---

## 🔌 Plugging in Real Physical Sensors Later

CrowdSense is designed with modular endpoints ready for zero-friction physical sensor ingestion:

### 1. Wi-Fi Access Point (AP) Associations (Zero Added Hardware)
Most campus enterprise Wi-Fi systems (Cisco Meraki, Aruba, Ruckus, Ubiquiti UniFi) expose real-time client association counts per Access Point / BSSID:
```bash
# Push live Wi-Fi association count from campus network controller
curl -X PUT https://campus.edu/api/facilities/central-library \
  -H "Content-Type: application/json" \
  -d '{"occupancy": 312}'
```
*Tip: Apply an 0.85 multiplier to Wi-Fi client counts to account for students with multiple devices (phone + laptop).*

### 2. Overhead Vision AI / Optical People Counters
Overhead 3D Time-of-Flight (ToF) or edge AI cameras (e.g. YOLOv8 on NVIDIA Jetson, Axis People Counter, Milesight) count bidirectional doorway crossings:
```bash
# Webhook fired on door line crossing
curl -X POST https://campus.edu/api/facilities/gym/checkin \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'
```

### 3. RFID / Digital Student ID Turnstiles
Turnstiles at library and dining entrances send an event on student card tap (NFC or QR code scan):
```bash
# Turnstile entry tap
curl -X POST https://campus.edu/api/facilities/cafeteria/checkin \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'
```

---

## 📂 Project Structure

```
├── server.ts                       # Express server with REST APIs & Vite middleware
├── server/
│   ├── seedData.ts                 # Seed facilities & 24h diurnal profiles
│   └── simulationEngine.ts         # Stateful crowd simulation engine & alternatives logic
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Navbar with LIVE indicator, clock, theme toggle
│   │   ├── SummaryStrip.tsx        # Top metrics: least/most crowded & campus average
│   │   ├── FilterBar.tsx           # Category pills, density filters, search & sorter
│   │   ├── FacilityCard.tsx        # Individual facility card with progress bar & trends
│   │   ├── SmartAlternatives.tsx   # Nearby less-crowded alternative spaces
│   │   ├── CampusMap.tsx           # Interactive SVG campus map with pulsing pins
│   │   ├── ForecastChart.tsx       # 24h Recharts predictive curve & optimal window
│   │   ├── FacilityDetailModal.tsx # Detailed facility sheet with live simulation controls
│   │   ├── PeakHoursInsights.tsx   # Day × Hour Heatmap & Weekly trend analysis
│   │   ├── AdminSimulationDrawer.tsx # Manual sliders, scenarios & simulation controls
│   │   ├── NotificationToastContainer.tsx # In-app toast alerts & audio chime
│   │   └── SensorIntegrationModal.tsx    # IoT hardware integration documentation
│   ├── services/
│   │   └── api.ts                  # Frontend API client
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Main dashboard container & polling engine
│   ├── index.css                   # Tailwind CSS styling & animations
│   └── main.tsx                    # React DOM entry point
├── package.json
└── README.md
```
