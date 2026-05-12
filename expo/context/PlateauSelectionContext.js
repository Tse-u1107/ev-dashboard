import React, { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_INPUT } from "../services/rangePredictor";
import {
  HOME_BASE,
  PLATEAU_NODES,
  computeDistanceKm,
} from "../services/plateauRangeEngine";
import {
  WEATHER_NODES,
  averageInterpolatedTempAlongPath,
  interpolateWeatherAtPoint,
} from "../services/plateauWeather";

const PlateauSelectionContext = createContext(null);
const DEFAULT_GOD_MODE_STATE = {
  ambientTempC: 22,
  driverAggression: 1.2,
  passengerCount: 1,
  cargoMassKg: 20,
  initialSoc: 0.8,
  hvacOn: false,
};

function makeSelection(nodeId) {
  const selectedNode = PLATEAU_NODES.find((node) => node.id === nodeId) ?? PLATEAU_NODES[0];
  const ambientTempC = averageInterpolatedTempAlongPath(selectedNode, 36, WEATHER_NODES);
  const destinationWeather = interpolateWeatherAtPoint(selectedNode, WEATHER_NODES);
  return {
    selectedNodeId: selectedNode.id,
    selectedNode,
    ambientTempC,
    destinationWeather,
    distanceKm: computeDistanceKm(HOME_BASE, selectedNode),
  };
}

export function PlateauSelectionProvider({ children }) {
  const [selection, setSelection] = useState(() => makeSelection(PLATEAU_NODES[0].id));
  const [godModeState, setGodModeState] = useState(() => ({ ...DEFAULT_GOD_MODE_STATE }));

  const value = useMemo(
    () => ({
      ...selection,
      godModeState,
      setSelectedNodeById: (nodeId) => {
        setSelection(makeSelection(nodeId));
      },
      updateGodModeField: (key, fieldValue) => {
        setGodModeState((prev) => {
          if (prev[key] === fieldValue) {
            return prev;
          }
          return { ...prev, [key]: fieldValue };
        });
      },
      predictInputPatch: {
        ...DEFAULT_INPUT,
        ambient_temp_c: selection.ambientTempC,
        headwind_ms: selection.destinationWeather.windMs,
        precipitation_mm: selection.destinationWeather.precipMm,
        soc: godModeState.initialSoc,
        driver_aggression: godModeState.driverAggression,
      },
    }),
    [godModeState, selection]
  );

  return <PlateauSelectionContext.Provider value={value}>{children}</PlateauSelectionContext.Provider>;
}

export function usePlateauSelection() {
  const context = useContext(PlateauSelectionContext);
  if (!context) {
    throw new Error("usePlateauSelection must be used within PlateauSelectionProvider.");
  }
  return context;
}
