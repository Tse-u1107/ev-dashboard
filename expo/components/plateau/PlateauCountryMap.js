import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme";

const STATUS_COLORS = {
  reachable: colors.success,
  margin: colors.warning,
  unreachable: colors.error,
};

function markerStyle(x, y) {
  return {
    left: `${x}%`,
    bottom: `${y}%`,
  };
}

export default function PlateauCountryMap({ homeBase, evaluations, selectedNodeId, onSelectNode }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.mapArea}>
        {Array.from({ length: 11 }).map((_, idx) => (
          <View key={`v-${idx}`} style={[styles.gridLine, { left: `${idx * 10}%`, top: 0, bottom: 0 }]} />
        ))}
        {Array.from({ length: 11 }).map((_, idx) => (
          <View key={`h-${idx}`} style={[styles.gridLine, { bottom: `${idx * 10}%`, left: 0, right: 0 }]} />
        ))}

        <View style={[styles.homeMarkerWrap, markerStyle(homeBase.x, homeBase.y)]}>
          <View style={styles.homeMarker} />
          <Text style={styles.homeText}>HOME</Text>
        </View>

        {evaluations.map((item) => {
          const selected = item.node.id === selectedNodeId;
          const color = STATUS_COLORS[item.status];

          return (
            <Pressable
              key={item.node.id}
              style={[styles.nodeWrap, markerStyle(item.node.x, item.node.y)]}
              onPress={() => onSelectNode(item.node.id)}
            >
              <View
                style={[
                  styles.nodeDot,
                  { backgroundColor: color },
                  selected ? styles.nodeDotSelected : null,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: STATUS_COLORS.reachable }]} />
          <Text style={styles.legendText}>Reachable</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: STATUS_COLORS.margin }]} />
          <Text style={styles.legendText}>Margin &lt; 10%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: STATUS_COLORS.unreachable }]} />
          <Text style={styles.legendText}>Unreachable</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.sm,
  },
  mapArea: {
    height: 280,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#E7F0FF",
    overflow: "hidden",
    position: "relative",
    padding: spacing.sm,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(31, 41, 55, 0.08)",
    width: 1,
    height: 1,
  },
  homeMarkerWrap: {
    position: "absolute",
    transform: [{ translateX: -8 }, { translateY: 8 }],
    alignItems: "center",
  },
  homeMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  homeText: {
    ...typography.smallBold,
    color: colors.primary,
    marginTop: 2,
  },
  nodeWrap: {
    position: "absolute",
    transform: [{ translateX: -9 }, { translateY: 9 }],
    alignItems: "center",
  },
  nodeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  nodeDotSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  legendRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
