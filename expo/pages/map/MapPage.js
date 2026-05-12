import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import {
  AlertCircle,
  CheckCircle2,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  Wind,
} from "lucide-react-native";
import { colors, spacing, borderRadius, typography, shadows } from "../../theme";
import { Card } from "../../components/common";
import GodModeSidebar from "../../components/plateau/GodModeSidebar";
import {
  DEFAULT_GOD_MODE,
  HOME_BASE,
  MAP_SIZE,
  PLATEAU_NODES,
  computeDistanceKm,
  evaluateAllNodes,
} from "../../services/plateauRangeEngine";
import {
  WEATHER_NODES,
  buildInterpolatedTemperatureGrid,
  interpolateWeatherAtPoint,
} from "../../services/plateauWeather";
import { usePlateauSelection } from "../../context/PlateauSelectionContext";

const TILE_SIZE = 3;
const CANVAS_SIZE = MAP_SIZE * TILE_SIZE;
const SVG_PADDING = 20;
const PADDED_CANVAS_SIZE = CANVAS_SIZE + SVG_PADDING * 2;
const WEATHER_CARD_GAP = spacing.md;
const STATUS_COLORS = {
  reachable: colors.success,
  margin: colors.warning,
  unreachable: colors.error,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function toHex(n) {
  const rounded = Math.max(0, Math.min(255, Math.round(n)));
  return rounded.toString(16).padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rampColor(tempC, minTemp, maxTemp) {
  if (maxTemp <= minTemp) {
    return "#34d399";
  }
  const normalized = clamp01((tempC - minTemp) / (maxTemp - minTemp));
  const anchors = [
    { t: 0, c: [14, 165, 233] },
    { t: 0.33, c: [34, 197, 94] },
    { t: 0.66, c: [250, 204, 21] },
    { t: 1, c: [239, 68, 68] },
  ];

  for (let idx = 1; idx < anchors.length; idx += 1) {
    const left = anchors[idx - 1];
    const right = anchors[idx];
    if (normalized <= right.t) {
      const localT = (normalized - left.t) / Math.max(0.0001, right.t - left.t);
      return rgbToHex(
        lerp(left.c[0], right.c[0], localT),
        lerp(left.c[1], right.c[1], localT),
        lerp(left.c[2], right.c[2], localT)
      );
    }
  }

  return "#ef4444";
}

function weatherIcon(tempC, precipMm, windMs) {
  if (precipMm >= 4) {
    return CloudRain;
  }
  if (windMs >= 9) {
    return Wind;
  }
  if (tempC <= 8) {
    return Snowflake;
  }
  if (tempC >= 30) {
    return Sun;
  }
  return CloudSun;
}

export default function MapPage() {
  const weatherScrollRef = useRef(null);
  const viewportWidth = Dimensions.get("window").width;
  const weatherCardWidth = Math.max(260, viewportWidth - spacing.lg * 2 - 8);
  const { selectedNodeId, setSelectedNodeById } = usePlateauSelection();
  const [godModeState, setGodModeState] = useState(DEFAULT_GOD_MODE);
  const [nodeEvaluations, setNodeEvaluations] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);

  const updateGodModeField = useCallback((key, value) => {
    setGodModeState((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setEvaluating(true);
    setEvaluationError(null);

    async function recalculateReachability() {
      try {
        const evaluations = await evaluateAllNodes(godModeState);
        if (!cancelled) {
          setNodeEvaluations(evaluations);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to evaluate reachability.";
          setEvaluationError(message);
        }
      } finally {
        if (!cancelled) {
          setEvaluating(false);
        }
      }
    }

    void recalculateReachability();
    return () => {
      cancelled = true;
    };
  }, [godModeState]);

  const evaluationsByNodeId = useMemo(() => {
    return nodeEvaluations.reduce((acc, entry) => {
      acc[entry.node.id] = entry;
      return acc;
    }, {});
  }, [nodeEvaluations]);

  const weatherByNode = useMemo(() => {
    const map = {};
    for (let idx = 0; idx < PLATEAU_NODES.length; idx += 1) {
      const node = PLATEAU_NODES[idx];
      map[node.id] = interpolateWeatherAtPoint(node, WEATHER_NODES);
    }
    return map;
  }, []);

  const heatGrid = useMemo(() => buildInterpolatedTemperatureGrid(MAP_SIZE, WEATHER_NODES), []);

  const gridRange = useMemo(() => {
    let minTemp = Number.POSITIVE_INFINITY;
    let maxTemp = Number.NEGATIVE_INFINITY;
    for (let y = 0; y < heatGrid.length; y += 1) {
      for (let x = 0; x < heatGrid[y].length; x += 1) {
        const value = heatGrid[y][x];
        minTemp = Math.min(minTemp, value);
        maxTemp = Math.max(maxTemp, value);
      }
    }
    return { minTemp, maxTemp };
  }, [heatGrid]);

  const heatRects = useMemo(() => {
    const cells = [];
    for (let y = 0; y < heatGrid.length; y += 1) {
      for (let x = 0; x < heatGrid[y].length; x += 1) {
        const tempC = heatGrid[y][x];
        cells.push(
          <Rect
            key={`${x}-${y}`}
            x={x * TILE_SIZE + SVG_PADDING}
            y={(MAP_SIZE - 1 - y) * TILE_SIZE + SVG_PADDING}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={rampColor(tempC, gridRange.minTemp, gridRange.maxTemp)}
          />
        );
      }
    }
    return cells;
  }, [gridRange.maxTemp, gridRange.minTemp, heatGrid]);

  const selectedIndex = useMemo(
    () => Math.max(0, PLATEAU_NODES.findIndex((node) => node.id === selectedNodeId)),
    [selectedNodeId]
  );
  const toMapPercentX = useCallback(
    (x) => `${((x * TILE_SIZE + SVG_PADDING) / PADDED_CANVAS_SIZE) * 100}%`,
    []
  );
  const toMapPercentY = useCallback(
    (y) => `${(((MAP_SIZE - y) * TILE_SIZE + SVG_PADDING) / PADDED_CANVAS_SIZE) * 100}%`,
    []
  );

  useEffect(() => {
    if (!weatherScrollRef.current) {
      return;
    }
    weatherScrollRef.current.scrollTo({
      x: selectedIndex * (weatherCardWidth + WEATHER_CARD_GAP),
      y: 0,
      animated: true,
    });
  }, [selectedIndex, weatherCardWidth]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Plateau Country</Text>
        <Text style={styles.pageSubtitle}>IDW heat map + destination weather feed</Text>

        <Card style={styles.mapCard}>
          <View style={styles.mapArea}>
            <Svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${PADDED_CANVAS_SIZE} ${PADDED_CANVAS_SIZE}`}
              style={styles.heatLayer}
            >
              {heatRects}
            </Svg>

            <View
              style={[
                styles.homeMarker,
                {
                  left: toMapPercentX(HOME_BASE.x),
                  top: toMapPercentY(HOME_BASE.y),
                },
              ]}
            >
              <Text style={styles.markerText}>H</Text>
            </View>

            {PLATEAU_NODES.map((node) => {
              const active = selectedNodeId === node.id;
              const status = evaluationsByNodeId[node.id]?.status ?? "unreachable";
              return (
                <Pressable
                  key={node.id}
                  style={[
                    styles.nodeMarker,
                    { backgroundColor: STATUS_COLORS[status] },
                    {
                      left: toMapPercentX(node.x),
                      top: toMapPercentY(node.y),
                    },
                    active ? styles.nodeMarkerActive : null,
                  ]}
                  onPress={() => setSelectedNodeById(node.id)}
                >
                  <Text style={styles.markerText}>{node.id.split("-")[1]}</Text>
                </Pressable>
              );
            })}

            <View style={styles.mapOverlayLegend}>
              <View style={styles.tempLegendRow}>
                <Text style={styles.legendText}>Temp</Text>
                <Svg width={136} height={6} style={styles.gradientBar}>
                  <Defs>
                    <LinearGradient id="heatRamp" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#0ea5e9" />
                      <Stop offset="33%" stopColor="#22c55e" />
                      <Stop offset="66%" stopColor="#facc15" />
                      <Stop offset="100%" stopColor="#ef4444" />
                    </LinearGradient>
                  </Defs>
                  <Rect x={0} y={0} width={136} height={6} fill="url(#heatRamp)" rx={4} ry={4} />
                </Svg>
                <Text style={styles.legendText}>Heat</Text>
              </View>
              <View style={styles.statusLegendRow}>
                <View style={styles.statusLegendItem}>
                  <CheckCircle2 size={12} color={STATUS_COLORS.reachable} />
                  <Text style={styles.legendText}>Reachable</Text>
                </View>
                <View style={styles.statusLegendItem}>
                  <AlertCircle size={12} color={STATUS_COLORS.margin} />
                  <Text style={styles.legendText}>Margin</Text>
                </View>
                <View style={styles.statusLegendItem}>
                  <AlertCircle size={12} color={STATUS_COLORS.unreachable} />
                  <Text style={styles.legendText}>Unreachable</Text>
                </View>
              </View>
            </View>
          </View>
          {evaluating ? <Text style={styles.evalText}>Recomputing reachability...</Text> : null}
          {evaluationError ? <Text style={styles.evalErrorText}>{evaluationError}</Text> : null}
        </Card>

        <View style={styles.carouselWrap}>
          <ScrollView
            horizontal
            ref={weatherScrollRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={weatherCardWidth + WEATHER_CARD_GAP}
            decelerationRate="fast"
            snapToAlignment="start"
            disableIntervalMomentum
          >
            {PLATEAU_NODES.map((node) => {
              const weather = weatherByNode[node.id];
              const selected = node.id === selectedNodeId;
              const WeatherGlyph = weatherIcon(weather.tempC, weather.precipMm, weather.windMs);
              return (
                <Pressable
                  key={node.id}
                  onPress={() => setSelectedNodeById(node.id)}
                  style={[
                    styles.weatherCard,
                    { width: weatherCardWidth },
                    selected ? styles.weatherCardSelected : null,
                  ]}
                >
                  <View style={styles.weatherCardHeader}>
                    <Text style={styles.weatherNodeName}>{node.name}</Text>
                    <WeatherGlyph size={20} color="#67e8f9" />
                  </View>
                  <Text style={styles.weatherPrimary}>{weather.tempC.toFixed(1)} C</Text>
                  <View style={styles.weatherMetricsGrid}>
                    <Text style={styles.weatherSecondary}>Wind {weather.windMs.toFixed(1)} m/s</Text>
                    <Text style={styles.weatherSecondary}>Rain {weather.precipMm.toFixed(1)} mm</Text>
                    <Text style={styles.weatherSecondary}>
                      Reachability: {evaluationsByNodeId[node.id]?.status ?? "unknown"}
                    </Text>
                  </View>
                  <Text style={styles.weatherDistance}>
                    {computeDistanceKm(HOME_BASE, node).toFixed(1)} km from Home Base
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Card style={styles.godModeCard}>
          <Text style={styles.godModeTitle}>God Mode Controls</Text>
          <Text style={styles.godModeSubtitle}>
            Sliders restored here on the Map page.
          </Text>
          <GodModeSidebar state={godModeState} updateField={updateGodModeField} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  pageTitle: {
    ...typography.h2,
    color: "#f8fafc",
    marginTop: spacing.sm,
  },
  pageSubtitle: {
    ...typography.caption,
    color: "rgba(248, 250, 252, 0.75)",
    marginBottom: spacing.md,
  },
  mapCard: {
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.35)",
    padding: spacing.sm,
  },
  mapArea: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "#0b1220",
  },
  heatLayer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  homeMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    marginLeft: -8,
    marginTop: -8,
  },
  nodeMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderWidth: 1,
    borderColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -8,
    marginTop: -8,
  },
  nodeMarkerActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: "#facc15",
    backgroundColor: "rgba(2, 6, 23, 0.9)",
    marginLeft: -10,
    marginTop: -10,
  },
  markerText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#f8fafc",
  },
  mapOverlayLegend: {
    position: "absolute",
    left: spacing.xs,
    top: spacing.xs,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  legendText: {
    ...typography.small,
    color: "rgba(226, 232, 240, 0.9)",
  },
  tempLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  gradientBar: {
    marginHorizontal: spacing.xs,
  },
  statusLegendRow: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statusLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  evalText: {
    ...typography.small,
    color: "rgba(248, 250, 252, 0.9)",
    marginTop: spacing.sm,
  },
  evalErrorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.sm,
  },
  carouselWrap: {
    marginTop: spacing.lg,
  },
  godModeCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: "rgba(30, 30, 40, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.28)",
  },
  godModeTitle: {
    ...typography.bodyBold,
    color: "#f8fafc",
  },
  godModeSubtitle: {
    ...typography.small,
    color: "rgba(203, 213, 225, 0.75)",
    marginTop: 2,
  },
  carouselContent: {
    paddingRight: spacing.lg,
    gap: WEATHER_CARD_GAP,
  },
  weatherCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    ...shadows.md,
  },
  weatherCardSelected: {
    borderColor: "#facc15",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  weatherCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherNodeName: {
    ...typography.captionBold,
    color: "#e2e8f0",
  },
  weatherPrimary: {
    ...typography.h3,
    color: "#ffffff",
    marginTop: spacing.xs,
  },
  weatherMetricsGrid: {
    marginTop: spacing.xs,
    gap: 2,
  },
  weatherSecondary: {
    ...typography.caption,
    color: "rgba(226,232,240,0.9)",
  },
  weatherDistance: {
    ...typography.small,
    color: "rgba(148,163,184,0.95)",
    marginTop: spacing.sm,
  },
});
