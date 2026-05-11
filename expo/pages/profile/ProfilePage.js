import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity 
} from 'react-native';
import { Card, StatusBadge } from '../../components/common';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

export default function ProfilePage({ navigation }) {
  const driverData = {
    name: 'John Doe',
    initials: 'JD',
    memberSince: 'March 2024',
    drivingStyle: 'Eco-Friendly',
    aggressionCoeff: 0.85,
  };

  const vehicleData = {
    make: 'Tesla',
    model: 'Model 3 Long Range',
    year: '2023',
    plate: 'ABC-1234',
    batteryCapacity: 75,
    odometer: 24500,
  };

  const statsData = {
    totalTrips: 156,
    totalDistance: 4850,
    totalEnergy: 728,
    avgConsumption: 150,
    co2Saved: 1.2,
  };

  const weeklyData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 32 },
    { day: 'Wed', value: 58 },
    { day: 'Thu', value: 41 },
    { day: 'Fri', value: 67 },
    { day: 'Sat', value: 23 },
    { day: 'Sun', value: 15 },
  ];

  const maxWeeklyValue = Math.max(...weeklyData.map(d => d.value));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{driverData.initials}</Text>
          </View>
          <Text style={styles.profileName}>{driverData.name}</Text>
          <Text style={styles.profileSince}>Member since {driverData.memberSince}</Text>
          
          <View style={styles.drivingStyleBadge}>
            <StatusBadge status="success" label={driverData.drivingStyle} />
          </View>
        </View>

        {/* Vehicle Card */}
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.sectionTitle}>My Vehicle</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleIcon}>
              <Text style={styles.vehicleIconText}>🚗</Text>
            </View>
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleName}>
                {vehicleData.year} {vehicleData.make} {vehicleData.model}
              </Text>
              <Text style={styles.vehiclePlate}>{vehicleData.plate}</Text>
            </View>
          </View>

          <View style={styles.vehicleStats}>
            <View style={styles.vehicleStat}>
              <Text style={styles.vehicleStatValue}>{vehicleData.batteryCapacity}</Text>
              <Text style={styles.vehicleStatUnit}>kWh</Text>
              <Text style={styles.vehicleStatLabel}>Battery</Text>
            </View>
            <View style={styles.vehicleStatDivider} />
            <View style={styles.vehicleStat}>
              <Text style={styles.vehicleStatValue}>{(vehicleData.odometer / 1000).toFixed(1)}k</Text>
              <Text style={styles.vehicleStatUnit}>km</Text>
              <Text style={styles.vehicleStatLabel}>Odometer</Text>
            </View>
            <View style={styles.vehicleStatDivider} />
            <View style={styles.vehicleStat}>
              <Text style={styles.vehicleStatValue}>94</Text>
              <Text style={styles.vehicleStatUnit}>%</Text>
              <Text style={styles.vehicleStatLabel}>Health</Text>
            </View>
          </View>
        </Card>

        {/* Driving Statistics */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Driving Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                <Text style={styles.statIconText}>📍</Text>
              </View>
              <Text style={styles.statValue}>{statsData.totalTrips}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.statIconText}>🛣️</Text>
              </View>
              <Text style={styles.statValue}>{(statsData.totalDistance / 1000).toFixed(1)}k</Text>
              <Text style={styles.statLabel}>km Driven</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                <Text style={styles.statIconText}>⚡</Text>
              </View>
              <Text style={styles.statValue}>{statsData.totalEnergy}</Text>
              <Text style={styles.statLabel}>kWh Used</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.secondaryLight }]}>
                <Text style={styles.statIconText}>🌱</Text>
              </View>
              <Text style={styles.statValue}>{statsData.co2Saved}</Text>
              <Text style={styles.statLabel}>t CO₂ Saved</Text>
            </View>
          </View>
        </Card>

        {/* Weekly Activity */}
        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <Text style={styles.activityTotal}>281 km total</Text>
          </View>
          
          <View style={styles.chartContainer}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: `${(day.value / maxWeeklyValue) * 100}%` },
                      day.day === 'Fri' && styles.barHighlight,
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Driver Efficiency */}
        <Card style={styles.efficiencyCard}>
          <Text style={styles.sectionTitle}>Efficiency Score</Text>
          
          <View style={styles.efficiencyContent}>
            <View style={styles.efficiencyCircle}>
              <Text style={styles.efficiencyScore}>
                {Math.round((2 - driverData.aggressionCoeff) * 100)}
              </Text>
              <Text style={styles.efficiencyMax}>/100</Text>
            </View>
            
            <View style={styles.efficiencyDetails}>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Avg Consumption</Text>
                <Text style={styles.efficiencyValue}>{statsData.avgConsumption} Wh/km</Text>
              </View>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Driving Style</Text>
                <Text style={[styles.efficiencyValue, styles.efficiencyGood]}>
                  {driverData.drivingStyle}
                </Text>
              </View>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Regen Usage</Text>
                <Text style={styles.efficiencyValue}>78%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.efficiencyTip}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Your driving efficiency is 15% better than average. Keep it up!
            </Text>
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

  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarTextLarge: {
    ...typography.h2,
    color: colors.surface,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
  },
  profileSince: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  drivingStyleBadge: {
    marginTop: spacing.md,
  },

  vehicleCard: {
    marginBottom: spacing.lg,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  editText: {
    ...typography.caption,
    color: colors.primary,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleIconText: {
    fontSize: 28,
  },
  vehicleDetails: {
    marginLeft: spacing.md,
  },
  vehicleName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  vehiclePlate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  vehicleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  vehicleStat: {
    alignItems: 'center',
  },
  vehicleStatValue: {
    ...typography.h3,
    color: colors.text,
  },
  vehicleStatUnit: {
    ...typography.small,
    color: colors.textSecondary,
  },
  vehicleStatLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vehicleStatDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },

  statsCard: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 22,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  activityCard: {
    marginBottom: spacing.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activityTotal: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  bar: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barHighlight: {
    backgroundColor: colors.secondary,
  },
  barLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },

  efficiencyCard: {
    marginBottom: spacing.lg,
  },
  efficiencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  efficiencyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  efficiencyScore: {
    ...typography.h1,
    color: colors.secondary,
  },
  efficiencyMax: {
    ...typography.small,
    color: colors.textSecondary,
  },
  efficiencyDetails: {
    flex: 1,
  },
  efficiencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  efficiencyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  efficiencyValue: {
    ...typography.captionBold,
    color: colors.text,
  },
  efficiencyGood: {
    color: colors.secondary,
  },
  efficiencyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.sm,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    ...typography.caption,
    color: colors.secondary,
  },
});
