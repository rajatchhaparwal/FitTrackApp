import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FORM_STEP_COPY } from '../../constants/onboardingContent';

export default function OnboardingFormShell({ formId, children }) {
  const copy = FORM_STEP_COPY[formId];
  if (!copy) return <View style={styles.shell}>{children}</View>;

  return (
    <View style={styles.shell}>
      <View style={styles.headerBlock}>
        {copy.icon ? (
          <View style={styles.iconBadge}>
            <Icon name={copy.icon} size={22} color="#5A8BFF" />
          </View>
        ) : null}
        <Text style={styles.headlineTitle}>{copy.title}</Text>
        <Text style={styles.subtitleDescription}>{copy.subtitle}</Text>
      </View>

      <View style={styles.innerContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  headerBlock: { marginBottom: 24 },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headlineTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitleDescription: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
    lineHeight: 22,
  },
  innerContent: { marginBottom: 8 },
});
