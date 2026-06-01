import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const FORM_STEP_COPY = {
  name: {
    title: "First, What can we call you?",
    subtitle: 'Your name helps us personalize your dashboard and tailor your training parameters.',
    hint: 'Used by your virtual training ecosystem and layout updates.',
  },
  body: {
    icon: 'scale-bathroom',
    title: 'Biometric Profile',
    subtitle: 'Precision biometric markers construct your foundational baseline metrics. Zero judgment, complete privacy.',
    hint: 'Powers energy equations, volume distributions, and calorie calculations.',
  },
  goal: {
    icon: 'target',
    title: 'What is your primary goal?',
    subtitle: 'Establish your primary physiological focus. This directly alters your macronutrient targets and plan structure.',
    hint: 'Isolating a singular structural direction enforces macro-compliance.',
  },
  lifestyle: {
    icon: 'lightning-bolt-outline',
    title: 'Daily Activity Level',
    subtitle: 'Accurate dynamic expenditure balances metabolic tracking variables against actual occupational fatigue profiles.',
    hint: 'Adapts cumulative training volume configurations to real life schedules.',
  },
  health: {
    icon: 'shield-check-outline',
    title: 'Kinetic Safe-Guards',
    subtitle: 'Identify any past physical compromises or joint vulnerabilities to let the application automatically modify specific routines.',
    hint: 'Leave blank if uncompromised. Restructive patterns bypass dangerous ranges.',
  },
};

export default function OnboardingFormShell({ formId, children }) {
  const copy = FORM_STEP_COPY[formId];
  if (!copy) return <View style={styles.shell}>{children}</View>;

  return (
    <View style={styles.shell}>
      <View style={styles.headerBlock}>
        <View style={styles.badgeRow}>
          <View style={styles.badgeLine} />
        </View>
        <Text style={styles.headlineTitle}>{copy.title}</Text>
        <Text style={styles.subtitleDescription}>{copy.subtitle}</Text>
      </View>
      
      <View style={styles.innerContent}>{children}</View>
      
      <View style={styles.hintContainer}>
        <Icon name="information-outline" size={16} color="#646A7B" style={styles.hintIcon} />
        <Text style={styles.hintText}>{copy.hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  headerBlock: { marginBottom: 28 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBadge: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F4F7FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E1E9FF' },
  badgeLine: { flex: 1, height: 1, backgroundColor: '#EAECEF', marginLeft: 16, opacity: 0.7 },
  headlineTitle: { fontSize: 26, fontWeight: '800', color: '#1A1D24', letterSpacing: -0.5, marginBottom: 10 },
  subtitleDescription: { fontSize: 14, color: '#646A7B', fontWeight: '500', lineHeight: 21 },
  innerContent: { marginBottom: 24 },
  hintContainer: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  hintIcon: { marginRight: 10 },
  hintText: { flex: 1, fontSize: 12, color: '#646A7B', fontWeight: '600', lineHeight: 16 },
});