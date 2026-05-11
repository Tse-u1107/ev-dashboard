import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../common";
import { colors, spacing, typography } from "../../theme";
import GodModeSidebar from "./GodModeSidebar";
import PlateauCountryMap from "./PlateauCountryMap";
import { HOME_BASE } from "../../services/plateauRangeEngine";
import { useGodModeController } from "../../hooks/useGodModeController";

function statusText(status) {
  if (status === "reachable") {
    return "Reachable";
  }
  if (status === "margin") {
    return "Margin < 10%";
  }
  return "Unreachable";
}

export default function PlateauSimulatorCard() {
  const {
    state,
    updateField,
    nodeEvaluations,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    sensitivity,
    loading,
    error,
  } = useGodModeController();

  const selectedEvaluation = useMemo(
    () => nodeEvaluations.find((item) => item.node.id === selectedNodeId) ?? null,
    [nodeEvaluations, selectedNodeId]
  );

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Plateau Country Route Feasibility</Text>
      <Text style={styles.caption}>100 x 100 grid map with Home Base at (0,0 | 50m).</Text>

      <PlateauCountryMap
        homeBase={HOME_BASE}
        evaluations={nodeEvaluations}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
      />

      <GodModeSidebar state={state} updateField={updateField} />

      <View style={styles.metricsSection}>
        <Text style={styles.metricsTitle}>Selected Destination</Text>
        {!selectedEvaluation ? (
          <Text style={styles.emptyText}>Loading route details...</Text>
        ) : (
          <>
            <Text style={styles.nodeName}>{selectedNode?.name}</Text>
            <View style={styles.nodeGrid}>
              <Text style={styles.nodeLine}>Distance: {selectedEvaluation.distanceKm.toFixed(1)} km</Text>
              <Text style={styles.nodeLine}>Altitude: {selectedEvaluation.node.altitudeM.toFixed(0)} m</Text>
              <Text style={styles.nodeLine}>Avg Gradient: {selectedEvaluation.avgGradientDeg.toFixed(2)} deg</Text>
              <Text style={styles.nodeLine}>Road Quality: {(selectedEvaluation.node.roadQuality * 100).toFixed(0)}%</Text>
              <Text style={styles.nodeLine}>Predicted Range: {selectedEvaluation.predictedRangeKm.toFixed(1)} km</Text>
              <Text style={styles.nodeLine}>Physics + epsilon: {selectedEvaluation.physicsRangeKm.toFixed(1)} + {selectedEvaluation.epsilonKm.toFixed(1)} km</Text>
              <Text style={styles.nodeLine}>Status: {statusText(selectedEvaluation.status)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.metricsSection}>
        <Text style={styles.metricsTitle}>Sensitivity Panel</Text>
        {!sensitivity ? (
          <Text style={styles.emptyText}>Calculating sensitivity...</Text>
        ) : (
          <>
            <Text style={styles.nodeLine}>Style loss (aggression): {sensitivity.styleLossKm.toFixed(1)} km</Text>
            <Text style={styles.nodeLine}>Climate loss (temp + HVAC): {sensitivity.climateLossKm.toFixed(1)} km</Text>
            <Text style={styles.subtleLine}>
              Neutral: {sensitivity.neutralRangeKm.toFixed(1)} km | Style-only: {sensitivity.styleRangeKm.toFixed(1)} km | Current climate: {sensitivity.climateRangeKm.toFixed(1)} km
            </Text>
          </>
        )}
      </View>

      <View style={styles.metricsSection}>
        <Text style={styles.metricsTitle}>All Destination Nodes</Text>
        {nodeEvaluations.map((item) => (
          <TouchableOpacity key={item.node.id} onPress={() => setSelectedNodeId(item.node.id)} style={styles.nodeRow}>
            <Text style={styles.nodeRowName}>{item.node.name}</Text>
            <Text style={styles.nodeRowStatus}>
              {item.distanceKm.toFixed(0)} km - {statusText(item.status)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <Text style={styles.loadingText}>Updating predictions...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text,
  },
  caption: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  metricsTitle: {
    ...typography.captionBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  nodeName: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  nodeGrid: {
    gap: 2,
  },
  nodeLine: {
    ...typography.caption,
    color: colors.text,
  },
  subtleLine: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nodeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  nodeRowName: {
    ...typography.caption,
    color: colors.text,
  },
  nodeRowStatus: {
    ...typography.smallBold,
    color: colors.textSecondary,
  },
  loadingText: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
