import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity 
} from 'react-native';
import { Card, Button, StatusBadge } from '../../components/common';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

export default function DetailsPage({ route, navigation }) {
  const type = route?.params?.type || 'trip';
  const selectedTrip = route?.params?.trip;
  const historyTrips = route?.params?.trips ?? [];

  const fallbackTripData = {
    origin: {
      name: 'Home',
      address: '123 Main Street, Springfield',
    },
    destination: {
      name: 'Office',
      address: '456 Business Ave, Downtown',
    },
    distance: 32,
    duration: 45,
    energyRequired: 5.8,
    energyAvailable: 54,
    arrivalCharge: 65,
  };

  const tripData = selectedTrip ?? fallbackTripData;

  const weatherData = {
    temperature: 18,
    wind: { speed: 12, direction: 'NE' },
    conditions: 'Partly Cloudy',
  };

  const routeSegments = [
    { type: 'urban', distance: 8, gradient: 0, consumption: 145 },
    { type: 'highway', distance: 18, gradient: 2, consumption: 165 },
    { type: 'urban', distance: 6, gradient: -1, consumption: 130 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {type === 'history' ? (
          <Card style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Saved Trips</Text>
            {historyTrips.length === 0 ? (
              <Text style={styles.emptyHistoryText}>No trips saved yet.</Text>
            ) : (
              historyTrips.slice(0, 6).map((trip) => {
                const features = trip.features ?? {};
                const startName = features.origin_name || 'Unknown origin';
                const endName = features.destination_name || 'Unknown destination';
                const distance = Number(features.planned_distance_km);
                return (
                  <View key={trip.id} style={styles.historyItem}>
                    <View>
                      <Text style={styles.historyTitle}>{startName} to {endName}</Text>
                      <Text style={styles.historySubtitle}>
                        {new Date(trip.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.historyDistance}>
                      {(Number.isFinite(distance) ? distance : trip.actual_km).toFixed(1)} km
                    </Text>
                  </View>
                );
              })
            )}
          </Card>
        ) : null}

        {/* Route Overview Card */}
        <Card style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Trip Overview</Text>
            <StatusBadge status="success" label="Reachable" />
          </View>

          <View style={styles.routePoints}>
            <View style={styles.routePoint}>
              <View style={styles.routeDotStart} />
              <View style={styles.routePointInfo}>
                <Text style={styles.routePointLabel}>Pickup</Text>
                <Text style={styles.routePointName}>{tripData.origin.name}</Text>
                <Text style={styles.routePointAddress}>{tripData.origin.address}</Text>
              </View>
            </View>
            
            <View style={styles.routeConnector}>
              <View style={styles.routeLine} />
              <View style={styles.routeLineInfo}>
                <Text style={styles.routeLineText}>{tripData.distance} km</Text>
                <Text style={styles.routeLineSubtext}>{tripData.duration} min</Text>
              </View>
            </View>
            
            <View style={styles.routePoint}>
              <View style={styles.routeDotEnd} />
              <View style={styles.routePointInfo}>
                <Text style={styles.routePointLabel}>Destination</Text>
                <Text style={styles.routePointName}>{tripData.destination.name}</Text>
                <Text style={styles.routePointAddress}>{tripData.destination.address}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Energy Prediction Card */}
        <Card style={styles.energyCard}>
          <Text style={styles.sectionTitle}>Energy Analysis</Text>
          
          <View style={styles.energyStats}>
            <View style={styles.energyStat}>
              <Text style={styles.energyValue}>{tripData.energyRequired}</Text>
              <Text style={styles.energyUnit}>kWh</Text>
              <Text style={styles.energyLabel}>Required</Text>
            </View>
            
            <View style={styles.energyDivider} />
            
            <View style={styles.energyStat}>
              <Text style={styles.energyValue}>{tripData.energyAvailable}</Text>
              <Text style={styles.energyUnit}>kWh</Text>
              <Text style={styles.energyLabel}>Available</Text>
            </View>
            
            <View style={styles.energyDivider} />
            
            <View style={styles.energyStat}>
              <Text style={[styles.energyValue, styles.energyValueSuccess]}>{tripData.arrivalCharge}%</Text>
              <Text style={styles.energyUnit}></Text>
              <Text style={styles.energyLabel}>At Arrival</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${tripData.arrivalCharge}%` }]} />
              <View style={[styles.progressUsed, { width: `${100 - tripData.arrivalCharge}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Start: 72%</Text>
              <Text style={styles.progressLabel}>End: {tripData.arrivalCharge}%</Text>
            </View>
          </View>
        </Card>

        {/* Route Segments */}
        <Card style={styles.segmentsCard}>
          <Text style={styles.sectionTitle}>Route Segments</Text>
          
          {routeSegments.map((segment, index) => (
            <View key={index} style={styles.segmentItem}>
              <View style={styles.segmentIcon}>
                <Text style={styles.segmentIconText}>
                  {segment.type === 'highway' ? '🛣️' : '🏙️'}
                </Text>
              </View>
              <View style={styles.segmentInfo}>
                <Text style={styles.segmentType}>
                  {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
                </Text>
                <Text style={styles.segmentDetails}>
                  {segment.distance} km • {segment.gradient > 0 ? '+' : ''}{segment.gradient}° grade
                </Text>
              </View>
              <View style={styles.segmentConsumption}>
                <Text style={styles.consumptionValue}>{segment.consumption}</Text>
                <Text style={styles.consumptionUnit}>Wh/km</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Weather Impact */}
        <Card style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>Weather Conditions</Text>
          
          <View style={styles.weatherGrid}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherIcon}>🌡️</Text>
              <Text style={styles.weatherValue}>{weatherData.temperature}°C</Text>
              <Text style={styles.weatherLabel}>Temperature</Text>
            </View>
            
            <View style={styles.weatherItem}>
              <Text style={styles.weatherIcon}>💨</Text>
              <Text style={styles.weatherValue}>{weatherData.wind.speed} km/h</Text>
              <Text style={styles.weatherLabel}>{weatherData.wind.direction} Wind</Text>
            </View>
            
            <View style={styles.weatherItem}>
              <Text style={styles.weatherIcon}>⛅</Text>
              <Text style={styles.weatherValue}>{weatherData.conditions}</Text>
              <Text style={styles.weatherLabel}>Conditions</Text>
            </View>
          </View>
          
          <View style={styles.weatherImpact}>
            <Text style={styles.weatherImpactText}>
              Weather impact: +3% energy consumption (headwind)
            </Text>
          </View>
        </Card>

        {/* Start Trip Button */}
        <Button 
          title="Start Navigation"
          variant="primary"
          size="large"
          style={styles.startButton}
          onPress={() => {}}
        />

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

  historyCard: {
    marginBottom: spacing.lg,
  },
  historyItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  historySubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyDistance: {
    ...typography.captionBold,
    color: colors.primary,
  },
  emptyHistoryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  routeCard: {
    marginBottom: spacing.lg,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  routeTitle: {
    ...typography.h3,
    color: colors.text,
  },
  routePoints: {
    paddingLeft: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    marginTop: 4,
  },
  routeDotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  routePointInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  routePointLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  routePointName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  routePointAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingVertical: spacing.md,
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
  },
  routeLineInfo: {
    marginLeft: spacing.lg,
  },
  routeLineText: {
    ...typography.captionBold,
    color: colors.text,
  },
  routeLineSubtext: {
    ...typography.small,
    color: colors.textSecondary,
  },

  energyCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  energyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  energyStat: {
    alignItems: 'center',
  },
  energyValue: {
    ...typography.h2,
    color: colors.text,
  },
  energyValueSuccess: {
    color: colors.secondary,
  },
  energyUnit: {
    ...typography.small,
    color: colors.textSecondary,
  },
  energyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  energyDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  progressUsed: {
    backgroundColor: colors.warningLight,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  segmentsCard: {
    marginBottom: spacing.lg,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  segmentIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentIconText: {
    fontSize: 20,
  },
  segmentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  segmentType: {
    ...typography.bodyBold,
    color: colors.text,
  },
  segmentDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  segmentConsumption: {
    alignItems: 'flex-end',
  },
  consumptionValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  consumptionUnit: {
    ...typography.small,
    color: colors.textSecondary,
  },

  weatherCard: {
    marginBottom: spacing.lg,
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  weatherValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  weatherLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  weatherImpact: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.sm,
  },
  weatherImpactText: {
    ...typography.caption,
    color: colors.warning,
    textAlign: 'center',
  },

  startButton: {
    marginTop: spacing.md,
  },
});
