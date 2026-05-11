import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  TextInput 
} from 'react-native';
import { Card, Button, StatusBadge } from '../../components/common';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

export default function SearchPage({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'fast', label: 'Fast Charging' },
    { id: 'free', label: 'Free' },
  ];

  const chargingStations = [
    {
      id: '1',
      name: 'Shell Recharge - Downtown',
      address: '456 Business Ave, Downtown',
      distance: 2.3,
      power: 150,
      price: 0.35,
      available: 3,
      total: 4,
      status: 'available',
      connectorType: 'CCS',
      estimatedWait: 0,
    },
    {
      id: '2',
      name: 'Tesla Supercharger - Mall',
      address: '789 Shopping Center',
      distance: 4.1,
      power: 250,
      price: 0.40,
      available: 6,
      total: 8,
      status: 'available',
      connectorType: 'Tesla',
      estimatedWait: 0,
    },
    {
      id: '3',
      name: 'ChargePoint - Office Park',
      address: '123 Corporate Blvd',
      distance: 5.8,
      power: 50,
      price: 0.28,
      available: 0,
      total: 2,
      status: 'occupied',
      connectorType: 'CCS',
      estimatedWait: 15,
    },
    {
      id: '4',
      name: 'EVgo - Gas Station',
      address: '321 Highway Exit',
      distance: 7.2,
      power: 100,
      price: 0.38,
      available: 2,
      total: 2,
      status: 'available',
      connectorType: 'CHAdeMO',
      estimatedWait: 0,
    },
  ];

  const filteredStations = chargingStations.filter(station => {
    if (selectedFilter === 'available' && station.status !== 'available') return false;
    if (selectedFilter === 'fast' && station.power < 100) return false;
    if (selectedFilter === 'free' && station.price > 0) return false;
    if (searchQuery && !station.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return { status: 'success', label: 'Available' };
      case 'occupied':
        return { status: 'warning', label: 'Occupied' };
      case 'offline':
        return { status: 'error', label: 'Offline' };
      default:
        return { status: 'info', label: 'Unknown' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search charging stations..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Preview */}
      <View style={styles.mapPreview}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            {/* Simulated map markers */}
            <View style={[styles.mapMarker, { top: '30%', left: '45%' }]}>
              <View style={styles.markerDot} />
            </View>
            <View style={[styles.mapMarker, { top: '50%', left: '60%' }]}>
              <View style={styles.markerDot} />
            </View>
            <View style={[styles.mapMarker, { top: '40%', left: '25%' }]}>
              <View style={[styles.markerDot, styles.markerDotOccupied]} />
            </View>
            <View style={[styles.mapMarker, { top: '65%', left: '70%' }]}>
              <View style={styles.markerDot} />
            </View>
            {/* Current location */}
            <View style={[styles.currentLocation, { top: '45%', left: '40%' }]}>
              <View style={styles.currentDot} />
              <View style={styles.currentPulse} />
            </View>
          </View>
        </View>
      </View>

      {/* Station List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Nearby Stations</Text>
        <Text style={styles.listCount}>{filteredStations.length} found</Text>
      </View>

      <ScrollView 
        style={styles.stationList}
        contentContainerStyle={styles.stationListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredStations.map(station => {
          const statusInfo = getStatusInfo(station.status);
          return (
            <TouchableOpacity 
              key={station.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Details', { 
                type: 'charger', 
                stationId: station.id 
              })}
            >
              <Card style={styles.stationCard}>
                <View style={styles.stationHeader}>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <Text style={styles.stationAddress}>{station.address}</Text>
                  </View>
                  <StatusBadge status={statusInfo.status} label={statusInfo.label} />
                </View>

                <View style={styles.stationDetails}>
                  <View style={styles.stationStat}>
                    <Text style={styles.statIcon}>📍</Text>
                    <Text style={styles.statText}>{station.distance} km</Text>
                  </View>
                  
                  <View style={styles.stationStat}>
                    <Text style={styles.statIcon}>⚡</Text>
                    <Text style={styles.statText}>{station.power} kW</Text>
                  </View>
                  
                  <View style={styles.stationStat}>
                    <Text style={styles.statIcon}>🔌</Text>
                    <Text style={styles.statText}>{station.connectorType}</Text>
                  </View>
                  
                  <View style={styles.stationStat}>
                    <Text style={styles.statIcon}>💰</Text>
                    <Text style={styles.statText}>${station.price}/kWh</Text>
                  </View>
                </View>

                <View style={styles.stationFooter}>
                  <View style={styles.availabilityContainer}>
                    <View style={styles.availabilityDots}>
                      {[...Array(station.total)].map((_, i) => (
                        <View 
                          key={i} 
                          style={[
                            styles.availabilityDot,
                            i < station.available && styles.availabilityDotActive,
                          ]} 
                        />
                      ))}
                    </View>
                    <Text style={styles.availabilityText}>
                      {station.available}/{station.total} available
                    </Text>
                  </View>
                  
                  {station.estimatedWait > 0 && (
                    <Text style={styles.waitTime}>
                      ~{station.estimatedWait} min wait
                    </Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  searchHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textLight,
    padding: spacing.xs,
  },

  filtersContainer: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.surface,
  },

  mapPreview: {
    height: 180,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  mapContent: {
    flex: 1,
    position: 'relative',
  },
  mapMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  markerDotOccupied: {
    backgroundColor: colors.warning,
  },
  currentLocation: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
    zIndex: 2,
  },
  currentPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(13, 59, 102, 0.2)',
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  listCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  stationList: {
    flex: 1,
  },
  stationListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  stationCard: {
    marginBottom: spacing.md,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  stationName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  stationAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  stationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  stationStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    marginBottom: spacing.xs,
  },
  statIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDots: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginRight: 4,
  },
  availabilityDotActive: {
    backgroundColor: colors.secondary,
  },
  availabilityText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  waitTime: {
    ...typography.smallBold,
    color: colors.warning,
  },
});
