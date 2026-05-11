import React, { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_INPUT } from "../services/rangePredictor";
import { HOME_BASE, PLATEAU_NODES, computeDistanceKm } from "../services/plateauRangeEngine";
import {
  WEATHER_NODES,
  averageInterpolatedTempAlongPath,
  interpolateWeatherAtPoint,
} from "../services/plateauWeather";

const PlateauSelectionContext = createContext(null);

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

  const value = useMemo(
    () => ({
      ...selection,
      setSelectedNodeById: (nodeId) => {
        setSelection(makeSelection(nodeId));
      },
      predictInputPatch: {
        ...DEFAULT_INPUT,
        ambient_temp_c: selection.ambientTempC,
        headwind_ms: selection.destinationWeather.windMs,
        precipitation_mm: selection.destinationWeather.precipMm,
      },
    }),
    [selection]
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
