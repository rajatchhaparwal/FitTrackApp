import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FITTRACK_FEATURES,
  INSIGHT_PHASES,
} from '../../constants/onboardingContent';

function FeatureCard({ feature, large }) {
  return (
    <View style={[styles.featureCard, { backgroundColor: feature.bg }]}>
      <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
        <Icon name={feature.icon} size={large ? 28 : 24} color="#FFF" />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDesc}>{feature.desc}</Text>
    </View>
  );
}

export default function OnboardingInsightScreen({ formData, phase }) {
  const config = INSIGHT_PHASES[phase] || INSIGHT_PHASES.name;
  const firstName = formData.name.trim().split(/\s+/)[0] || '';
  const headline = config.headline(firstName);
  const isFinish = phase === 'finish';

  return (
    <View style={styles.root}>
      <View style={styles.motivationBlock}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subtext}>{config.subtext}</Text>
      </View>

      {isFinish ? (
        <View style={styles.allFeatures}>
          {Object.values(FITTRACK_FEATURES).map((f) => (
            <View key={f.title} style={styles.compactRow}>
              <View style={[styles.compactIcon, { backgroundColor: f.color }]}>
                <Icon name={f.icon} size={20} color="#FFF" />
              </View>
              <View style={styles.compactText}>
                <Text style={styles.compactTitle}>{f.title}</Text>
                <Text style={styles.compactDesc} numberOfLines={2}>
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FeatureCard feature={FITTRACK_FEATURES[config.feature]} large />
      )}

      {config.quote ? (
        <Text style={styles.quote}>{config.quote}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
  },
  motivationBlock: {
    marginBottom: 28,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginTop: 12,
    fontWeight: '500',
  },
  featureCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  allFeatures: {
    gap: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  compactText: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  compactDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#777',
  },
  quote: {
    marginTop: 28,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});
