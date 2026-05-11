import { HOME_BASE, MAP_SIZE, PLATEAU_NODES, type MapPoint } from "./plateauRangeEngine";

export interface WeatherSampleNode extends MapPoint {
  tempC: number;
  windMs: number;
  precipMm: number;
}

export interface WeatherAtPoint {
  tempC: number;
  windMs: number;
  precipMm: number;
}

const EPSILON = 1e-6;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function idwValue(
  x: number,
  y: number,
  nodes: WeatherSampleNode[],
  pick: (node: WeatherSampleNode) => number
): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (let idx = 0; idx < nodes.length; idx += 1) {
    const node = nodes[idx];
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < EPSILON) {
      return pick(node);
    }
    const weight = 1 / (dist * dist);
    weightedSum += weight * pick(node);
    weightTotal += weight;
  }

  if (weightTotal <= EPSILON) {
    return 0;
  }
  return weightedSum / weightTotal;
}

export const WEATHER_NODES: WeatherSampleNode[] = PLATEAU_NODES.map((node, index) => {
  const pattern = Math.sin((index + 1) * 1.23);
  const tempDrift = Math.cos((index + 1) * 0.71);
  return {
    ...node,
    tempC: clamp(18 + pattern * 8 + node.altitudeM * -0.004, -8, 38),
    windMs: clamp(2.2 + Math.abs(tempDrift) * 6 + (1 - node.roadQuality) * 2.5, 0.4, 16),
    precipMm: clamp(Math.abs(Math.sin((index + 3) * 0.92)) * 6.5, 0, 14),
  };
});

export function interpolateWeatherAtPoint(
  point: Pick<MapPoint, "x" | "y">,
  nodes: WeatherSampleNode[] = WEATHER_NODES
): WeatherAtPoint {
  return {
    tempC: idwValue(point.x, point.y, nodes, (node) => node.tempC),
    windMs: idwValue(point.x, point.y, nodes, (node) => node.windMs),
    precipMm: idwValue(point.x, point.y, nodes, (node) => node.precipMm),
  };
}

export function buildInterpolatedTemperatureGrid(
  size: number = MAP_SIZE,
  nodes: WeatherSampleNode[] = WEATHER_NODES
): number[][] {
  const safeSize = Math.max(2, Math.round(size));
  const grid: number[][] = Array.from({ length: safeSize }, () => Array<number>(safeSize).fill(0));
  for (let y = 0; y < safeSize; y += 1) {
    for (let x = 0; x < safeSize; x += 1) {
      grid[y][x] = idwValue(x, y, nodes, (node) => node.tempC);
    }
  }
  return grid;
}

export function averageInterpolatedTempAlongPath(
  target: Pick<MapPoint, "x" | "y">,
  samples: number = 32,
  nodes: WeatherSampleNode[] = WEATHER_NODES
): number {
  const safeSamples = Math.max(2, Math.round(samples));
  let sum = 0;

  for (let idx = 0; idx < safeSamples; idx += 1) {
    const t = idx / (safeSamples - 1);
    const x = HOME_BASE.x + (target.x - HOME_BASE.x) * t;
    const y = HOME_BASE.y + (target.y - HOME_BASE.y) * t;
    const weather = interpolateWeatherAtPoint({ x, y }, nodes);
    sum += weather.tempC;
  }

  return sum / safeSamples;
}
