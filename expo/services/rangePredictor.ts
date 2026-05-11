export interface PredictInput {
  soc: number;
  soh: number;
  cell_delta_mv: number;
  battery_temp_c: number;
  ambient_temp_c: number;
  headwind_ms: number;
  precipitation_mm: number;
  avg_gradient_deg: number;
  elevation_gain_m: number;
  regen_opportunity_pct: number;
  cargo_mass_kg: number;
  passenger_count: number;
  driver_aggression: number;
  hvac_usage: number;
  avg_highway_speed: number;
  route_type: string;
  time_of_day: number;
  road_quality?: number;
}

export interface PredictResult {
  range_km: number;
  ci_low: number;
  ci_high: number;
  physics_range_km: number;
  epsilon: number;
}

export const DEFAULT_INPUT: PredictInput = {
  soc: 0.8, // battery charge
  soh: 0.95, // state of health, internal sensor
  cell_delta_mv: 7, // internal sensor, the difference (in millivolts) between the highest-voltage cell and the lowest-voltage cell.
  battery_temp_c: 28, // internal battery thermometer
  ambient_temp_c: 22, // openweathermaps 
  headwind_ms: 1.5, // headwind, seosor
  precipitation_mm: 0, // openweathermaps
  avg_gradient_deg: 1.2, // sensor, barometer
  elevation_gain_m: 120, // sensor, barometer
  regen_opportunity_pct: 0.25, // braking temporarily fuels battery
  cargo_mass_kg: 40, // passengers, weight sensor
  passenger_count: 2, // passengers, weight sensor
  driver_aggression: 1.0, // acceleration by driver
  hvac_usage: 0.4, // a/c ventilation usage
  avg_highway_speed: 85, // internal sensor, tracks how far the driver is straying from that optimal peak.
  route_type: "highway", // openstreetmaps
  time_of_day: 14, // internal clock
  road_quality: 0.85, // map engine: 0.0 poor road -> 1.0 excellent road
};

export async function predictRange(input: PredictInput): Promise<PredictResult> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_URL. Set it in your Expo environment.");
  }

  const response = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let errorMessage = `Predict request failed (${response.status} ${response.statusText})`;
    try {
      const errorBody = await response.text();
      if (errorBody) {
        errorMessage = `${errorMessage}: ${errorBody}`;
      }
    } catch {
      // Ignore body parse errors and keep base error message.
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as PredictResult;
}
