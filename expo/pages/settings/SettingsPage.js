import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  Switch 
} from 'react-native';
import { Card } from '../../components/common';
import { colors, spacing, borderRadius, typography } from '../../theme';

export default function SettingsPage({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [rangeAlerts, setRangeAlerts] = useState(true);
  const [chargingAlerts, setChargingAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState('metric');

  const vehicleSettings = [
    { label: 'Vehicle Model', value: 'Tesla Model 3 LR', icon: '🚗' },
    { label: 'Battery Capacity', value: '75 kWh', icon: '🔋' },
    { label: 'Connector Type', value: 'CCS / Tesla', icon: '🔌' },
  ];

  const SettingRow = ({ icon, label, value, onPress, rightElement }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {rightElement}
        {onPress && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          
          {vehicleSettings.map((setting, index) => (
            <SettingRow
              key={index}
              icon={setting.icon}
              label={setting.label}
              value={setting.value}
              onPress={() => {}}
            />
          ))}
        </Card>

        {/* Notifications */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingRow
            icon="🔔"
            label="Push Notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.secondaryLight }}
                thumbColor={notifications ? colors.secondary : colors.surface}
              />
            }
          />
          
          <SettingRow
            icon="⚠️"
            label="Low Range Alerts"
            rightElement={
              <Switch
                value={rangeAlerts}
                onValueChange={setRangeAlerts}
                trackColor={{ false: colors.border, true: colors.secondaryLight }}
                thumbColor={rangeAlerts ? colors.secondary : colors.surface}
              />
            }
          />
          
          <SettingRow
            icon="⚡"
            label="Charging Complete"
            rightElement={
              <Switch
                value={chargingAlerts}
                onValueChange={setChargingAlerts}
                trackColor={{ false: colors.border, true: colors.secondaryLight }}
                thumbColor={chargingAlerts ? colors.secondary : colors.surface}
              />
            }
          />
        </Card>

        {/* Display */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Display</Text>
          
          <SettingRow
            icon="🌙"
            label="Dark Mode"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.border, true: colors.secondaryLight }}
                thumbColor={darkMode ? colors.secondary : colors.surface}
              />
            }
          />
          
          <View style={styles.unitSelector}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>📏</Text>
              </View>
              <Text style={styles.settingLabel}>Units</Text>
            </View>
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  units === 'metric' && styles.unitButtonActive,
                ]}
                onPress={() => setUnits('metric')}
              >
                <Text style={[
                  styles.unitButtonText,
                  units === 'metric' && styles.unitButtonTextActive,
                ]}>
                  Metric
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  units === 'imperial' && styles.unitButtonActive,
                ]}
                onPress={() => setUnits('imperial')}
              >
                <Text style={[
                  styles.unitButtonText,
                  units === 'imperial' && styles.unitButtonTextActive,
                ]}>
                  Imperial
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Range Prediction */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Range Prediction</Text>
          
          <SettingRow
            icon="🎯"
            label="Prediction Accuracy"
            value="High"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="📊"
            label="Confidence Interval"
            value="90%"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="🔄"
            label="Reset Driver Profile"
            onPress={() => {}}
          />
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <SettingRow
            icon="📱"
            label="Trip History"
            value="156 trips"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="☁️"
            label="Cloud Sync"
            value="Off"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="🗑️"
            label="Clear All Data"
            onPress={() => {}}
          />
        </Card>

        {/* About */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingRow
            icon="ℹ️"
            label="Version"
            value="1.0.0"
          />
          
          <SettingRow
            icon="📄"
            label="Privacy Policy"
            onPress={() => {}}
          />
          
          <SettingRow
            icon="📝"
            label="Terms of Service"
            onPress={() => {}}
          />
        </Card>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>EV Range Predictor</Text>
          <Text style={styles.footerSubtext}>HCI Final Project</Text>
        </View>

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

  settingsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingIconText: {
    fontSize: 18,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: 20,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },

  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  unitButtons: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  unitButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm - 2,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
  },
  unitButtonText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  unitButtonTextActive: {
    color: colors.surface,
  },

  logoutButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerSubtext: {
    ...typography.small,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});
