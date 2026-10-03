import React, { useState, useEffect, useMemo } from 'react';
import { Facility } from './types';
import { api } from './services/api';

// ==============================================================
// CONFIGURATION: THRESHOLDS, GROUPS & CAPACITIES
// Easily edit thresholds, groups, and capacities in one place:
// ==============================================================
export const CROWD_THRESHOLDS = {
  FREE_MAX: 39, // Under 40% is Green "Free"
  BUSY_MAX: 75, // 40% - 75% is Yellow "Busy"
  // Over 75% is Red "Crowded"
} as const;

export const SIMILARITY_GROUPS: Record<string, string[]> = {
  'Labs': ['Computer Lab', 'Chemistry Lab', 'EV Lab', 'Language Lab', 'Workshop'],
  'Study': ['Library', 'Language Lab', 'Computer Lab'],
  'Food and Leisure': ['Canteen', 'Sports Room'],
};

export const IEM_CAMPUS_PLACES = [
  { name: 'Library', capacity: 150 },
  { name: 'Computer Lab', capacity: 60 },
  { name: 'Workshop', capacity: 40 },
  { name: 'Chemistry Lab', capacity: 30 },
  { name: 'EV Lab', capacity: 25 },
  { name: 'Language Lab', capacity: 40 },
  { name: 'Canteen', capacity: 200 },
  { name: 'Sports Room', capacity: 40 },
];

export default function App() {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCrowds = async () => {
      try {
        const data = await api.getFacilities();
        if (isMounted) {
          setFacilities(data);
        }
      } catch {
        // Silently retry on next poll interval
      }
    };

    fetchCrowds();
    const interval = setInterval(fetchCrowds, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Status badge calculation: Green "Free" < 40%, Yellow "Busy" 40-75%, Red "Crowded" > 75%
  const getStatus = (pct: number) => {
    if (pct > CROWD_THRESHOLDS.BUSY_MAX) {
      return {
        label: 'Crowded',
        badge: 'text-red-700 bg-red-50 border-red-200',
        bar: 'bg-red-500',
        isHigh: true,
      };
    }
    if (pct > CROWD_THRESHOLDS.FREE_MAX) {
      return {
        label: 'Busy',
        badge: 'text-amber-700 bg-amber-50 border-amber-200',
        bar: 'bg-amber-500',
        isHigh: true,
      };
    }
    return {
      label: 'Free',
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      bar: 'bg-emerald-500',
      isHigh: false,
    };
  };

  // Sort cards so the least crowded place is first
  const sorted = useMemo(() => {
    return [...facilities].sort((a, b) => a.occupancyPercentage - b.occupancyPercentage);
  }, [facilities]);

  const leastCrowded = sorted[0];

  // ==============================================================
  // SMART ALTERNATIVES CALCULATION
  // ==============================================================
  const getAlternativesData = (currentPlace: Facility) => {
    // 1. Only show for places that are Yellow (Busy) or Red (Crowded)
    if (currentPlace.occupancyPercentage <= CROWD_THRESHOLDS.FREE_MAX) {
      return null;
    }

    // 2. Identify similarity groups for current place
    const matchedGroups = Object.entries(SIMILARITY_GROUPS)
      .filter(([_, places]) => places.includes(currentPlace.name))
      .map(([_, places]) => places)
      .flat();

    const otherPlaces = facilities.filter((f) => f.id !== currentPlace.id);

    // Filter rule: Never suggest a Red place (> 75%), must be less crowded than current place
    const eligiblePlaces = otherPlaces.filter(
      (f) =>
        f.occupancyPercentage <= CROWD_THRESHOLDS.BUSY_MAX &&
        f.occupancyPercentage < currentPlace.occupancyPercentage
    );

    // 3. Ranking: From same group first, sorted by lowest crowd %
    const sameGroupCandidates = eligiblePlaces
      .filter((f) => matchedGroups.includes(f.name))
      .sort((a, b) => a.occupancyPercentage - b.occupancyPercentage);

    let finalSuggestions: Facility[] = [];

    if (sameGroupCandidates.length > 0) {
      finalSuggestions = sameGroupCandidates.slice(0, 2);
    } else {
      // Fallback: least crowded places overall across campus
      const overallCandidates = eligiblePlaces.sort(
        (a, b) => a.occupancyPercentage - b.occupancyPercentage
      );
      finalSuggestions = overallCandidates.slice(0, 2);
    }

    // 5. Honest messages: If no non-red alternative exists
    const isEverythingBusy = finalSuggestions.length === 0;

    return {
      suggestions: finalSuggestions,
      isEverythingBusy,
      leastCrowdedOverallName: leastCrowded?.name || currentPlace.name,
    };
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-10 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header: IEM Salt Lake - Campus Crowd Monitor */}
      <header className="mb-8">
        <h1 className="text-sm font-semibold tracking-wide uppercase text-gray-500 mb-1">
          IEM Salt Lake - Campus Crowd Monitor
        </h1>
        {leastCrowded && (
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            Least crowded right now: <span className="text-emerald-600">{leastCrowded.name}</span>
          </p>
        )}
      </header>

      {/* List of places (cards) */}
      <main className="space-y-4">
        {sorted.map((place) => {
          const status = getStatus(place.occupancyPercentage);
          const altData = getAlternativesData(place);

          return (
            <div
              key={place.id}
              className="p-5 sm:p-6 rounded-xl border border-gray-200 bg-white"
            >
              {/* Name & Status Badge */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {place.name}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${status.badge}`}
                >
                  {status.label}
                </span>
              </div>

              {/* People count / capacity */}
              <div className="text-sm text-gray-600 mb-3">
                {place.currentOccupancy} / {place.capacity} people ({place.occupancyPercentage}%)
              </div>

              {/* Percentage bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${status.bar}`}
                  style={{ width: `${Math.min(100, Math.max(2, place.occupancyPercentage))}%` }}
                />
              </div>

              {/* Less crowded alternatives (Triggered on Yellow/Red places) */}
              {altData && (
                <div className="mt-4 pt-3.5 border-t border-gray-100">
                  {altData.isEverythingBusy ? (
                    // Honest message when everything is busy / red
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Everything is busy right now. Least crowded:{' '}
                      <span className="font-semibold text-gray-800">
                        {altData.leastCrowdedOverallName}
                      </span>
                      . Try again in 30 minutes.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold tracking-wide uppercase text-gray-400">
                        Less crowded alternatives
                      </div>

                      {altData.suggestions.map((alt, index) => {
                        const altStatus = getStatus(alt.occupancyPercentage);
                        const diff = Math.max(
                          1,
                          place.occupancyPercentage - alt.occupancyPercentage
                        );
                        const isRising = alt.trend === 'rising';

                        return (
                          <div
                            key={alt.id}
                            className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">
                                {alt.name}
                              </span>

                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${altStatus.badge}`}
                              >
                                {alt.occupancyPercentage}% {altStatus.label}
                              </span>

                              {index === 0 && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  Go here instead
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-gray-500 flex items-center gap-2">
                              <span>
                                Only {alt.occupancyPercentage}% full, {diff}% less crowded than {place.name}
                              </span>

                              {isRising && (
                                <span className="text-amber-700 font-medium">
                                  • Filling up, go soon
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
