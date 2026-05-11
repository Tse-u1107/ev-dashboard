import { DEFAULT_INPUT, predictRange, type PredictInput } from "./rangePredictor";

export type RouteType = "highway" | "urban" | "rural";

export interface MapPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  altitudeM: number;
}

export interface DestinationNode extends MapPoint {
  roadQuality: number;
  routeType: RouteType;
}

export interface GodModeState {
  ambientTempC: number;
  driverAggression: number;
  passengerCount: number;
  cargoMassKg: number;
  initialSoc: number;
  hvacOn: boolean;
}

export interface NodeEvaluation {
  node: DestinationNode;
  distanceKm: number;
  avgGradientDeg: number;
  elevationGainM: number;
  predictedRangeKm: number;
  physicsRangeKm: number;
  epsilonKm: number;
  marginKm: number;
  marginPct: number;
  status: "reachable" | "margin" | "unreachable";
}

export interface SensitivityBreakdown {
  neutralRangeKm: number;
  styleRangeKm: number;
  climateRangeKm: number;
  styleLossKm: number;
  climateLossKm: number;
}

export const MAP_SIZE = 100;
export const KM_PER_GRID_UNIT = 1.06;

export const HOME_BASE: MapPoint = {
  id: "home",
  name: "Home Base",
  x: 0,
  y: 0,
  altitudeM: 50,
};

export const PLATEAU_NODES: DestinationNode[] = [
  { id: "node-1", name: "Pine Gate", x: 12, y: 7, altitudeM: 220, roadQuality: 0.95, routeType: "urban" },
  { id: "node-2", name: "Dry Creek", x: 18, y: 10, altitudeM: 120, roadQuality: 0.82, routeType: "urban" },
  { id: "node-3", name: "Sun Ridge", x: 24, y: 22, altitudeM: 460, roadQuality: 0.78, routeType: "rural" },
  { id: "node-4", name: "Echo Valley", x: 35, y: 30, altitudeM: 760, roadQuality: 0.74, routeType: "rural" },
  { id: "node-5", name: "Quartz Fork", x: 45, y: 38, altitudeM: 180, roadQuality: 0.68, routeType: "rural" },
  { id: "node-6", name: "Silver Step", x: 56, y: 48, altitudeM: 910, roadQuality: 0.62, routeType: "highway" },
  { id: "node-7", name: "Cedar Pass", x: 65, y: 54, altitudeM: 1180, roadQuality: 0.58, routeType: "highway" },
  { id: "node-8", name: "Cloud Mesa", x: 78, y: 70, altitudeM: 1380, roadQuality: 0.52, routeType: "highway" },
  { id: "node-9", name: "Granite Crown", x: 90, y: 77, altitudeM: 1500, roadQuality: 0.48, routeType: "highway" },
  { id: "node-10", name: "Blue Basin", x: 96, y: 95, altitudeM: 30, roadQuality: 0.84, routeType: "highway" },
];

export const DEFAULT_GOD_MODE: GodModeState = {
  ambientTempC: 22,
  driverAggression: 1.2,
  passengerCount: 1,
  cargoMassKg: 20,
  initialSoc: 0.8,
  hvacOn: false,
};

export function computeDistanceKm(start: MapPoint, end: MapPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.max(1, Math.hypot(dx, dy) * KM_PER_GRID_UNIT);
}

export function computeAverageGradientDeg(startAltM: number, endAltM: number, distanceKm: number): number {
  const riseM = endAltM - startAltM;
  const runM = Math.max(1, distanceKm * 1000);
  return (Math.atan2(riseM, runM) * 180) / Math.PI;
}

function makePredictInput(
  state: GodModeState,
  node: DestinationNode,
  overrides: Partial<GodModeState> = {}
): { input: PredictInput; distanceKm: number; gradientDeg: number; elevationGainM: number } {
  const merged = { ...state, ...overrides };
  const distanceKm = computeDistanceKm(HOME_BASE, node);
  const avgGradientDeg = computeAverageGradientDeg(HOME_BASE.altitudeM, node.altitudeM, distanceKm);
  const elevationGainM = Math.max(0, node.altitudeM - HOME_BASE.altitudeM);

  const speedPenalty = (1 - node.roadQuality) * 18;
  const baseSpeed = Math.max(35, 92 - speedPenalty);
  const batteryTempC = merged.ambientTempC + (merged.hvacOn ? 3 : 5);

  return {
    input: {
      ...DEFAULT_INPUT,
      soc: merged.initialSoc,
      ambient_temp_c: merged.ambientTempC,
      battery_temp_c: batteryTempC,
      avg_gradient_deg: avgGradientDeg,
      elevation_gain_m: elevationGainM,
      cargo_mass_kg: merged.cargoMassKg,
      passenger_count: merged.passengerCount,
      driver_aggression: merged.driverAggression,
      hvac_usage: merged.hvacOn ? 1 : 0,
      avg_highway_speed: baseSpeed,
      route_type: node.routeType,
      road_quality: node.roadQuality,
    },
    distanceKm,
    gradientDeg: avgGradientDeg,
    elevationGainM,
  };
}

async function predictNodeRangeKm(
  state: GodModeState,
  node: DestinationNode,
  overrides: Partial<GodModeState> = {}
): Promise<{ rangeKm: number; physicsKm: number; epsilonKm: number; distanceKm: number; gradientDeg: number; elevationGainM: number }> {
  const prepared = makePredictInput(state, node, overrides);
  const result = await predictRange(prepared.input);
  const clampedRange = Math.max(0, result.physics_range_km + result.epsilon);

  return {
    rangeKm: clampedRange,
    physicsKm: result.physics_range_km,
    epsilonKm: result.epsilon,
    distanceKm: prepared.distanceKm,
    gradientDeg: prepared.gradientDeg,
    elevationGainM: prepared.elevationGainM,
  };
}

export async function evaluateNode(state: GodModeState, node: DestinationNode): Promise<NodeEvaluation> {
  const prediction = await predictNodeRangeKm(state, node);
  const marginKm = prediction.rangeKm - prediction.distanceKm;
  const marginPct = prediction.rangeKm <= 0 ? -100 : (marginKm / prediction.rangeKm) * 100;
  let status: NodeEvaluation["status"] = "unreachable";

  if (marginKm >= 0) {
    status = marginPct < 10 ? "margin" : "reachable";
  }

  return {
    node,
    distanceKm: prediction.distanceKm,
    avgGradientDeg: prediction.gradientDeg,
    elevationGainM: prediction.elevationGainM,
    predictedRangeKm: prediction.rangeKm,
    physicsRangeKm: prediction.physicsKm,
    epsilonKm: prediction.epsilonKm,
    marginKm,
    marginPct,
    status,
  };
}

export async function evaluateAllNodes(state: GodModeState): Promise<NodeEvaluation[]> {
  const evaluated = await Promise.all(PLATEAU_NODES.map((node) => evaluateNode(state, node)));
  return evaluated.sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function computeSensitivity(
  state: GodModeState,
  node: DestinationNode
): Promise<SensitivityBreakdown> {
  const neutral = await predictNodeRangeKm(state, node, {
    driverAggression: 1.0,
    ambientTempC: 22,
    hvacOn: false,
  });
  const styleOnly = await predictNodeRangeKm(state, node, {
    driverAggression: state.driverAggression,
    ambientTempC: 22,
    hvacOn: false,
  });
  const climate = await predictNodeRangeKm(state, node, {
    driverAggression: state.driverAggression,
    ambientTempC: state.ambientTempC,
    hvacOn: state.hvacOn,
  });

  const styleLossKm = Math.max(0, neutral.rangeKm - styleOnly.rangeKm);
  const climateLossKm = Math.max(0, styleOnly.rangeKm - climate.rangeKm);

  return {
    neutralRangeKm: neutral.rangeKm,
    styleRangeKm: styleOnly.rangeKm,
    climateRangeKm: climate.rangeKm,
    styleLossKm,
    climateLossKm,
  };
}
