import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Card, StatusBadge } from '../../components/common';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { predictRange, DEFAULT_INPUT } from '../../services/rangePredictor';
import { getRecentTrips, initDb, savePlannedTrip } from '../../services/tripStore';
import { usePlateauSelection } from '../../context/PlateauSelectionContext';

export default function HomePage({ navigation }) {
  const [soc, setSoc] = useState('0.72');
  const [aggression, setAggression] = useState('1.5');
  const [origin, setOrigin] = useState('Home Base');
  const [destination, setDestination] = useState('Pine Gate');
  const [plannedDistanceKm, setPlannedDistanceKm] = useState('1');
  const [result, setResult] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planError, setPlanError] = useState(null);
  const [planSuccess, setPlanSuccess] = useState(null);
  const {
    selectedNode,
    distanceKm: selectedDistanceKm,
    ambientTempC,
    destinationWeather,
  } = usePlateauSelection();

  const parsedSoc = useMemo(() => {
    const value = Number.parseFloat(soc);
    return Number.isFinite(value) ? value : DEFAULT_INPUT.soc;
  }, [soc]);

  const parsedAgg = useMemo(() => {
    const value = Number.parseFloat(aggression);
    return Number.isFinite(value) ? value : DEFAULT_INPUT.driver_aggression;
  }, [aggression]);

  const latestTrip = recentTrips[0] ?? null;

  useEffect(() => {
    if (!selectedNode) {
      return;
    }
    setOrigin('Home Base');
    setDestination(selectedNode.name);
    setPlannedDistanceKm(selectedDistanceKm.toFixed(1));
  }, [selectedDistanceKm, selectedNode]);

  const latestTripDetails = useMemo(() => {
    if (!latestTrip) {
      return null;
    }

    const features = latestTrip.features ?? {};
    const startName = typeof features.origin_name === 'string' ? features.origin_name : 'Unknown origin';
    const startAddress = typeof features.origin_address === 'string' ? features.origin_address : 'Address unavailable';
    const endName = typeof features.destination_name === 'string' ? features.destination_name : 'Unknown destination';
    const endAddress = typeof features.destination_address === 'string' ? features.destination_address : 'Address unavailable';
    const plannedKm = Number(features.planned_distance_km);

    return {
      startName,
      startAddress,
      endName,
      endAddress,
      plannedKm: Number.isFinite(plannedKm) ? plannedKm : latestTrip.actual_km,
      predictedKm: latestTrip.predicted_km,
    };
  }, [latestTrip]);

  const batteryData = {
    soc: parsedSoc,
    driver_aggression: parsedAgg,
    soh: 0.94,
    temperature: 22,
    cellDelta: 60,
  };

  const rangeData = {
    estimated: result ? result.range_km.toFixed(0) : '--',
    low: result ? result.ci_low.toFixed(0) : '--',
    high: result ? result.ci_high.toFixed(0) : '--',
    unit: 'km',
  };

  const vehicleData = {
    name: 'Tesla Model 3',
    plate: 'ABC-1234',
  };

  const computeArrivalCharge = (distanceKm, predictedRangeKm) => {
    if (!Number.isFinite(predictedRangeKm) || predictedRangeKm <= 0) {
      return 0;
    }
    return Math.max(0, Math.round((1 - distanceKm / predictedRangeKm) * 100));
  };

  const loadRecentTrips = useCallback(() => {
    try {
      setRecentTrips(getRecentTrips(8));
    } catch {
      setRecentTrips([]);
    }
  }, []);

  const handlePredict = async () => {
    const nextSoc = Number.parseFloat(soc);
    if (!Number.isFinite(nextSoc)) {
      setError('SOC must be a valid number (e.g. 0.85).');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const prediction = await predictRange({
        ...DEFAULT_INPUT,
        ambient_temp_c: ambientTempC,
        headwind_ms: destinationWeather.windMs,
        precipitation_mm: destinationWeather.precipMm,
        soc: nextSoc,
        driver_aggression: parsedAgg,
      });
      setResult(prediction);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to predict range.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTrip = async () => {
    const nextDistance = Number.parseFloat(plannedDistanceKm);
    if (!origin.trim() || !destination.trim()) {
      setPlanSuccess(null);
      setPlanError('Enter both origin and destination.');
      return;
    }
    if (!Number.isFinite(nextDistance) || nextDistance <= 0) {
      setPlanSuccess(null);
      setPlanError('Distance must be a positive number.');
      return;
    }

    setPlanError(null);
    setPlanSuccess(null);
    setLoading(true);
    try {
      const prediction = await predictRange({
        ...DEFAULT_INPUT,
        ambient_temp_c: ambientTempC,
        headwind_ms: destinationWeather.windMs,
        precipitation_mm: destinationWeather.precipMm,
        soc: parsedSoc,
        driver_aggression: parsedAgg,
      });
      setResult(prediction);

      const features = {
        origin_name: origin.trim(),
        destination_name: destination.trim(),
        origin_address: `${origin.trim()} area`,
        destination_address: `${destination.trim()} area`,
        planned_distance_km: nextDistance,
        soc: parsedSoc,
        driver_aggression: parsedAgg,
        ambient_temp_c: ambientTempC,
      };

      savePlannedTrip(features, prediction.range_km, nextDistance);
      loadRecentTrips();
      setPlanSuccess('Trip saved. Tap Recent Trip to see details.');
      navigation.navigate('Details', {
        type: 'trip',
        trip: {
          origin: { name: features.origin_name, address: features.origin_address },
          destination: { name: features.destination_name, address: features.destination_address },
          distance: nextDistance,
          duration: Math.max(10, Math.round((nextDistance / 45) * 60)),
          predictedRangeKm: prediction.range_km,
          arrivalCharge: computeArrivalCharge(nextDistance, prediction.range_km),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to plan trip.';
      setPlanError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDb();
    loadRecentTrips();
    void handlePredict();
  }, [loadRecentTrips]);

  useEffect(() => {
    void handlePredict();
  }, [ambientTempC, destinationWeather.precipMm, destinationWeather.windMs]);

  useFocusEffect(
    useCallback(() => {
      loadRecentTrips();
    }, [loadRecentTrips])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.vehicleName}>{vehicleData.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Range Card - Main Focus */}
        <Card style={styles.rangeCard}>
          <View style={styles.rangeHeader}>
            <Text style={styles.rangeLabel}>Estimated Range</Text>
            <StatusBadge status="success" label={loading ? 'Updating' : 'Ready'} />
          </View>
          
          <View style={styles.rangeValueContainer}>
            <Text style={styles.rangeValue}>{rangeData.estimated}</Text>
            <Text style={styles.rangeUnit}>{rangeData.unit}</Text>
          </View>
          
          <View style={styles.rangeConfidence}>
            <View style={styles.confidenceBar}>
              <View style={styles.confidenceFill} />
              <View style={styles.confidenceMarker} />
            </View>
            <View style={styles.confidenceLabels}>
              <Text style={styles.confidenceText}>{rangeData.low} km</Text>
              {/* <Text style={styles.confidenceTextCenter}>Crazy confidence band</Text> */}
              <Text style={styles.confidenceText}>{rangeData.high} km</Text>
            </View>
          </View>

          {result ? (
            <>
              <Text style={styles.physicsText}>
                Physics baseline: {result.physics_range_km.toFixed(0)} km
              </Text>
              <Text style={styles.epsilonText}>epsilon: {result.epsilon.toFixed(1)} km</Text>
            </>
          ) : null}

          <View style={styles.predictRow}>
            <TextInput
              value={soc}
              onChangeText={setSoc}
              placeholder="SOC (e.g. 0.85)"
              placeholderTextColor="rgba(255,255,255,0.55)"
              keyboardType="decimal-pad"
              style={styles.socInput}
            />
            <TextInput
              value={aggression}
              onChangeText={setAggression}
              placeholder="Aggression (1.0)"
              placeholderTextColor="rgba(255,255,255,0.55)"
              keyboardType="decimal-pad"
              style={styles.socInput}
            />
            <TouchableOpacity
              style={[styles.predictButton, loading && styles.predictButtonDisabled]}
              onPress={handlePredict}
              disabled={loading}
            >
              <Text style={styles.predictButtonText}>Predict</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.surface} />
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Card>

        <Card style={styles.destinationCard}>
          <View style={styles.destinationHeader}>
            <Text style={styles.sectionTitle}>Selected Route Summary</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
              <Text style={styles.viewAllText}>Open Map</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.destinationName}>{selectedNode?.name ?? 'No destination selected'}</Text>
          <Text style={styles.destinationMeta}>
            Distance {selectedDistanceKm.toFixed(1)} km | Avg path temp {ambientTempC.toFixed(1)} C
          </Text>
          <Text style={styles.destinationMeta}>
            Wind {destinationWeather.windMs.toFixed(1)} m/s | Precip {destinationWeather.precipMm.toFixed(1)} mm
          </Text>
        </Card>

        {/* Battery Status */}
        <Card style={styles.batteryCard}>
          <Text style={styles.sectionTitle}>Battery Status</Text>
          
          <View style={styles.batteryGrid}>
            <View style={styles.batteryItem}>
              <View style={styles.batteryCircle}>
                <Text style={styles.batteryPercent}>{Math.round(batteryData.soc * 100)}%</Text>
              </View>
              <Text style={styles.batteryLabel}>Charge</Text>
            </View>
            
            <View style={styles.batteryItem}>
              <View style={[styles.batteryCircle, styles.batteryCircleSecondary]}>
                <Text style={styles.batteryPercentSecondary}>{Math.round(batteryData.soh * 100)}%</Text>
              </View>
              <Text style={styles.batteryLabel}>Health</Text>
            </View>
            
            <View style={styles.batteryItem}>
              <View style={[styles.batteryCircle, styles.batteryCircleSecondary]}>
                <Text style={styles.batteryPercentSecondary}>{batteryData.temperature}°C</Text>
              </View>
              <Text style={styles.batteryLabel}>Temp</Text>
            </View>
            
            <View style={styles.batteryItem}>
              <View style={[styles.batteryCircle, styles.batteryCircleSecondary]}>
                <Text style={styles.batteryPercentSecondary}>{batteryData.cellDelta}mV</Text>
              </View>
              <Text style={styles.batteryLabel}>Cell Δ</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tripPlannerCard}>
          <Text style={styles.sectionTitle}>Plan Trip</Text>
          <View style={styles.planInputsRow}>
            <TextInput
              value={origin}
              onChangeText={setOrigin}
              placeholder="Origin"
              placeholderTextColor={colors.textLight}
              style={styles.planInput}
            />
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Destination"
              placeholderTextColor={colors.textLight}
              style={styles.planInput}
            />
          </View>
          <View style={styles.planInputsRow}>
            <TextInput
              value={plannedDistanceKm}
              onChangeText={setPlannedDistanceKm}
              placeholder="Distance (km)"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              style={styles.planInput}
            />
            <TouchableOpacity
              style={[styles.planButton, loading && styles.predictButtonDisabled]}
              onPress={handlePlanTrip}
              disabled={loading}
            >
              <Text style={styles.planButtonText}>Save Plan</Text>
            </TouchableOpacity>
          </View>
          {planError ? <Text style={styles.planErrorText}>{planError}</Text> : null}
          {planSuccess ? <Text style={styles.planSuccessText}>{planSuccess}</Text> : null}
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Search')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚡</Text>
            </View>
            <Text style={styles.actionLabel}>Find Charger</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>🗺️</Text>
            </View>
            <Text style={styles.actionLabel}>Open Map</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <Text style={styles.actionLabel}>Statistics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚙️</Text>
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Recent Trip</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Details', {
                  type: 'history',
                  trips: recentTrips,
                })
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {!latestTripDetails ? (
            <TouchableOpacity onPress={handlePlanTrip}>
              <Text style={styles.emptyRecentText}>No trips yet. Create one in Plan Trip.</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Details', {
                  type: 'trip',
                  trip: {
                    origin: {
                      name: latestTripDetails.startName,
                      address: latestTripDetails.startAddress,
                    },
                    destination: {
                      name: latestTripDetails.endName,
                      address: latestTripDetails.endAddress,
                    },
                    distance: latestTripDetails.plannedKm,
                    duration: Math.max(10, Math.round((latestTripDetails.plannedKm / 45) * 60)),
                    predictedRangeKm: latestTripDetails.predictedKm,
                    arrivalCharge: computeArrivalCharge(
                      latestTripDetails.plannedKm,
                      latestTripDetails.predictedKm
                    ),
                  },
                })
              }
            >
              <View style={styles.tripItem}>
                <View style={styles.tripRoute}>
                  <View style={styles.routeDot} />
                  <View style={styles.routeLine} />
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                </View>
                <View style={styles.tripDetails}>
                  <Text style={styles.tripLocation}>{latestTripDetails.startName}</Text>
                  <Text style={styles.tripAddress}>{latestTripDetails.startAddress}</Text>
                  <View style={styles.tripSpacer} />
                  <Text style={styles.tripLocation}>{latestTripDetails.endName}</Text>
                  <Text style={styles.tripAddress}>{latestTripDetails.endAddress}</Text>
                </View>
                <View style={styles.tripStats}>
                  <Text style={styles.tripDistance}>{latestTripDetails.plannedKm.toFixed(1)} km</Text>
                  <Text style={styles.tripEnergy}>{latestTripDetails.predictedKm.toFixed(0)} km range</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  vehicleName: {
    ...typography.h2,
    color: colors.text,
  },
  profileButton: {
    padding: spacing.xs,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  
  rangeCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rangeLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  rangeValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  rangeValue: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.surface,
  },
  rangeUnit: {
    ...typography.h3,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.sm,
  },
  rangeConfidence: {
    marginTop: spacing.sm,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    position: 'relative',
  },
  confidenceFill: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: 0,
    bottom: 0,
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
  confidenceMarker: {
    position: 'absolute',
    left: '50%',
    top: -2,
    width: 10,
    height: 10,
    backgroundColor: colors.surface,
    borderRadius: 5,
    marginLeft: -5,
  },
  confidenceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  confidenceText: {
    ...typography.small,
    color: 'rgba(255,255,255,0.7)',
  },
  confidenceTextCenter: {
    ...typography.small,
    color: 'rgba(255,255,255,0.9)',
  },
  physicsText: {
    ...typography.small,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.sm,
  },
  epsilonText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  predictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  socInput: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: spacing.md,
    color: colors.surface,
    marginRight: spacing.sm,
  },
  predictButton: {
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictButtonDisabled: {
    opacity: 0.6,
  },
  predictButtonText: {
    ...typography.captionBold,
    color: colors.surface,
  },
  loadingRow: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  errorText: {
    ...typography.small,
    color: '#ffb4b4',
    marginTop: spacing.sm,
  },

  batteryCard: {
    marginBottom: spacing.lg,
  },
  destinationCard: {
    marginBottom: spacing.lg,
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  destinationName: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  destinationMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  batteryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batteryItem: {
    alignItems: 'center',
  },
  batteryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  batteryCircleSecondary: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  batteryPercent: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  batteryPercentSecondary: {
    ...typography.captionBold,
    color: colors.text,
  },
  batteryLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  mapCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  tripPlannerCard: {
    marginBottom: spacing.lg,
  },
  planInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planInput: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  planButton: {
    height: 42,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planButtonText: {
    ...typography.captionBold,
    color: colors.surface,
  },
  planErrorText: {
    ...typography.small,
    color: colors.warning,
  },
  planSuccessText: {
    ...typography.small,
    color: colors.secondary,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#E8F4F8',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  destinationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginRight: spacing.sm,
  },
  destinationText: {
    ...typography.captionBold,
    color: colors.text,
  },
  mapGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mapGridLine: {
    width: '25%',
    height: 40,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  activityCard: {
    marginBottom: spacing.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
  },
  tripItem: {
    flexDirection: 'row',
  },
  tripRoute: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  routeDotEnd: {
    backgroundColor: colors.primary,
  },
  tripDetails: {
    flex: 1,
  },
  tripLocation: {
    ...typography.bodyBold,
    color: colors.text,
  },
  tripAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tripSpacer: {
    height: spacing.md,
  },
  tripStats: {
    alignItems: 'flex-end',
  },
  tripDistance: {
    ...typography.bodyBold,
    color: colors.text,
  },
  tripEnergy: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyRecentText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
