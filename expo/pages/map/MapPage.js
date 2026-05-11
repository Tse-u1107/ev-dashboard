import React, { useEffect, useMemo, useRef } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { colors, spacing, borderRadius, typography, shadows } from "../../theme";
import { Card } from "../../components/common";
import {
  HOME_BASE,
  MAP_SIZE,
  PLATEAU_NODES,
  computeDistanceKm,
} from "../../services/plateauRangeEngine";
import {
  WEATHER_NODES,
  buildInterpolatedTemperatureGrid,
  interpolateWeatherAtPoint,
} from "../../services/plateauWeather";
import { usePlateauSelection } from "../../context/PlateauSelectionContext";

const TILE_SIZE = 3;
const CARD_WIDTH = 250;

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
    return "🌧️";
  }
  if (windMs >= 9) {
    return "💨";
  }
  if (tempC <= 8) {
    return "❄️";
  }
  if (tempC >= 30) {
    return "☀️";
  }
  return "⛅";
}

export default function MapPage() {
  const weatherScrollRef = useRef(null);
  const { selectedNodeId, setSelectedNodeById } = usePlateauSelection();

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
            x={x * TILE_SIZE}
            y={(MAP_SIZE - 1 - y) * TILE_SIZE}
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

  useEffect(() => {
    if (!weatherScrollRef.current) {
      return;
    }
    weatherScrollRef.current.scrollTo({
      x: selectedIndex * (CARD_WIDTH + spacing.md),
      y: 0,
      animated: true,
    });
  }, [selectedIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Plateau Country</Text>
        <Text style={styles.pageSubtitle}>IDW heat map + destination weather feed</Text>

        <Card style={styles.mapCard}>
          <View style={styles.mapArea}>
            <Svg width={MAP_SIZE * TILE_SIZE} height={MAP_SIZE * TILE_SIZE} style={styles.heatLayer}>
              {heatRects}
            </Svg>

            <View style={[styles.homeMarker, { left: HOME_BASE.x * TILE_SIZE - 8, top: (MAP_SIZE - HOME_BASE.y) * TILE_SIZE - 8 }]}>
              <Text style={styles.markerText}>H</Text>
            </View>

            {PLATEAU_NODES.map((node) => {
              const active = selectedNodeId === node.id;
              return (
                <Pressable
                  key={node.id}
                  style={[
                    styles.nodeMarker,
                    {
                      left: node.x * TILE_SIZE - (active ? 10 : 8),
                      top: (MAP_SIZE - node.y) * TILE_SIZE - (active ? 10 : 8),
                    },
                    active ? styles.nodeMarkerActive : null,
                  ]}
                  onPress={() => setSelectedNodeById(node.id)}
                >
                  <Text style={styles.markerText}>{node.id.split("-")[1]}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.mapLegendRow}>
            <Text style={styles.legendText}>Cold</Text>
            <Svg width={160} height={8} style={styles.gradientBar}>
              <Defs>
                <LinearGradient id="heatRamp" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#0ea5e9" />
                  <Stop offset="33%" stopColor="#22c55e" />
                  <Stop offset="66%" stopColor="#facc15" />
                  <Stop offset="100%" stopColor="#ef4444" />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width={160} height={8} fill="url(#heatRamp)" rx={4} ry={4} />
            </Svg>
            <Text style={styles.legendText}>Hot</Text>
          </View>
        </Card>

        <View style={styles.carouselWrap}>
          <ScrollView
            horizontal
            ref={weatherScrollRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={CARD_WIDTH + spacing.md}
            decelerationRate="fast"
          >
            {PLATEAU_NODES.map((node) => {
              const weather = weatherByNode[node.id];
              const selected = node.id === selectedNodeId;
              return (
                <Pressable
                  key={node.id}
                  onPress={() => setSelectedNodeById(node.id)}
                  style={[styles.weatherCard, selected ? styles.weatherCardSelected : null]}
                >
                  <Text style={styles.weatherNodeName}>{node.name}</Text>
                  <Text style={styles.weatherIcon}>{weatherIcon(weather.tempC, weather.precipMm, weather.windMs)}</Text>
                  <Text style={styles.weatherPrimary}>{weather.tempC.toFixed(1)} C</Text>
                  <Text style={styles.weatherSecondary}>Wind {weather.windMs.toFixed(1)} m/s</Text>
                  <Text style={styles.weatherSecondary}>Rain {weather.precipMm.toFixed(1)} mm</Text>
                  <Text style={styles.weatherDistance}>
                    {computeDistanceKm(HOME_BASE, node).toFixed(1)} km from Home Base
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
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
  },
  mapArea: {
    width: MAP_SIZE * TILE_SIZE,
    height: MAP_SIZE * TILE_SIZE,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    alignSelf: "center",
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
  },
  nodeMarkerActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: "#facc15",
    backgroundColor: "rgba(2, 6, 23, 0.9)",
  },
  markerText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#f8fafc",
  },
  mapLegendRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  legendText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  gradientBar: {
    marginHorizontal: spacing.sm,
  },
  carouselWrap: {
    marginTop: spacing.lg,
  },
  carouselContent: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  weatherCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    ...shadows.md,
  },
  weatherCardSelected: {
    borderColor: "#facc15",
    transform: [{ scale: 1.02 }],
  },
  weatherNodeName: {
    ...typography.captionBold,
    color: "#e2e8f0",
  },
  weatherIcon: {
    fontSize: 34,
    marginVertical: spacing.xs,
  },
  weatherPrimary: {
    ...typography.h3,
    color: "#ffffff",
  },
  weatherSecondary: {
    ...typography.caption,
    color: "rgba(255,255,255,0.9)",
  },
  weatherDistance: {
    ...typography.small,
    color: "rgba(255,255,255,0.74)",
    marginTop: spacing.sm,
  },
});
