import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_GOD_MODE,
  PLATEAU_NODES,
  computeSensitivity,
  evaluateAllNodes,
} from "../services/plateauRangeEngine";

export function useGodModeController() {
  const [state, setState] = useState(DEFAULT_GOD_MODE);
  const [nodeEvaluations, setNodeEvaluations] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(PLATEAU_NODES[0]?.id ?? null);
  const [sensitivity, setSensitivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const runIdRef = useRef(0);

  const selectedNode = useMemo(
    () => PLATEAU_NODES.find((node) => node.id === selectedNodeId) ?? null,
    [selectedNodeId]
  );

  useEffect(() => {
    let cancelled = false;
    runIdRef.current += 1;
    const currentRun = runIdRef.current;

    async function recalculate() {
      setLoading(true);
      setError(null);
      try {
        const evaluations = await evaluateAllNodes(state);
        if (cancelled || currentRun !== runIdRef.current) {
          return;
        }
        setNodeEvaluations(evaluations);

        const targetNode = selectedNode ?? evaluations[0]?.node ?? null;
        if (!targetNode) {
          setSensitivity(null);
          return;
        }

        const nextSensitivity = await computeSensitivity(state, targetNode);
        if (cancelled || currentRun !== runIdRef.current) {
          return;
        }
        setSensitivity(nextSensitivity);
      } catch (err) {
        if (cancelled || currentRun !== runIdRef.current) {
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to recompute map statuses.";
        setError(message);
      } finally {
        if (!cancelled && currentRun === runIdRef.current) {
          setLoading(false);
        }
      }
    }

    void recalculate();
    return () => {
      cancelled = true;
    };
  }, [selectedNode, state]);

  function updateField(key, value) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return {
    state,
    updateField,
    nodeEvaluations,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    sensitivity,
    loading,
    error,
  };
}
