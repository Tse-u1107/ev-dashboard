import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { colors, spacing, typography } from "../../theme";

function SliderRow({ label, valueText, min, max, step, value, onChange }) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{valueText}</Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.secondary}
      />
    </View>
  );
}

export default function GodModeSidebar({ state, updateField }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>God Mode Sensor Simulation</Text>
      <SliderRow
        label="Ambient Temperature"
        valueText={`${state.ambientTempC.toFixed(0)} C`}
        min={-20}
        max={45}
        step={1}
        value={state.ambientTempC}
        onChange={(value) => updateField("ambientTempC", value)}
      />
      <SliderRow
        label="Driver Aggression"
        valueText={state.driverAggression.toFixed(2)}
        min={1}
        max={2}
        step={0.01}
        value={state.driverAggression}
        onChange={(value) => updateField("driverAggression", value)}
      />
      <SliderRow
        label="Passenger Count"
        valueText={`${Math.round(state.passengerCount)}`}
        min={0}
        max={5}
        step={1}
        value={state.passengerCount}
        onChange={(value) => updateField("passengerCount", Math.round(value))}
      />
      <SliderRow
        label="Cargo Mass"
        valueText={`${state.cargoMassKg.toFixed(0)} kg`}
        min={0}
        max={400}
        step={5}
        value={state.cargoMassKg}
        onChange={(value) => updateField("cargoMassKg", value)}
      />
      <SliderRow
        label="Initial SOC"
        valueText={`${(state.initialSoc * 100).toFixed(0)}%`}
        min={0.1}
        max={1}
        step={0.01}
        value={state.initialSoc}
        onChange={(value) => updateField("initialSoc", value)}
      />

      <View style={styles.switchRow}>
        <Text style={styles.sliderLabel}>HVAC Status</Text>
        <Switch
          value={state.hvacOn}
          onValueChange={(value) => updateField("hvacOn", value)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={state.hvacOn ? colors.secondary : colors.surface}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sliderRow: {
    marginTop: spacing.sm,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sliderLabel: {
    ...typography.caption,
    color: colors.text,
  },
  sliderValue: {
    ...typography.captionBold,
    color: colors.primary,
  },
  switchRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
