import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, StatusBadge } from '../../components/common';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

const { width } = Dimensions.get('window');

export default function HomePage({ navigation }) {
  const batteryData = {
    soc: 0.72,
    soh: 0.94,
    temperature: 22,
    cellDelta: 45,
  };

  const rangeData = {
    estimated: 245,
    low: 218,
    high: 272,
    unit: 'km',
  };

  const vehicleData = {
    name: 'Tesla Model 3',
    plate: 'ABC-1234',
  };

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
            <StatusBadge status="success" label="Ready" />
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
              <Text style={styles.confidenceTextCenter}>90% confidence</Text>
              <Text style={styles.confidenceText}>{rangeData.high} km</Text>
            </View>
          </View>
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

        {/* Map Preview */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
        >
          <Card style={styles.mapCard}>
            <View style={styles.mapPlaceholder}>
              <View style={styles.mapOverlay}>
                <View style={styles.destinationBadge}>
                  <View style={styles.destinationDot} />
                  <Text style={styles.destinationText}>Tap to plan route</Text>
                </View>
              </View>
              <View style={styles.mapGrid}>
                {[...Array(12)].map((_, i) => (
                  <View key={i} style={styles.mapGridLine} />
                ))}
              </View>
            </View>
          </Card>
        </TouchableOpacity>

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
            onPress={() => navigation.navigate('Details', { type: 'trip' })}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📍</Text>
            </View>
            <Text style={styles.actionLabel}>Plan Trip</Text>
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
            <TouchableOpacity onPress={() => navigation.navigate('Details', { type: 'history' })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tripItem}>
            <View style={styles.tripRoute}>
              <View style={styles.routeDot} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, styles.routeDotEnd]} />
            </View>
            <View style={styles.tripDetails}>
              <Text style={styles.tripLocation}>Home</Text>
              <Text style={styles.tripAddress}>123 Main Street</Text>
              <View style={styles.tripSpacer} />
              <Text style={styles.tripLocation}>Office</Text>
              <Text style={styles.tripAddress}>456 Business Ave</Text>
            </View>
            <View style={styles.tripStats}>
              <Text style={styles.tripDistance}>32 km</Text>
              <Text style={styles.tripEnergy}>5.2 kWh</Text>
            </View>
          </View>
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

  batteryCard: {
    marginBottom: spacing.lg,
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
});
