import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FITTRACK_FEATURES,
  INSIGHT_PHASES,
} from '../../constants/onboardingContent';

function FeatureLine({ feature }) {
  return (
    <View style={styles.featureLine}>
      <View style={[styles.featureDot, { backgroundColor: feature.color }]}>
        <Icon name={feature.icon} size={16} color="#FFF" />
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDesc}>{feature.desc}</Text>
      </View>
    </View>
  );
}

export default function OnboardingInsightScreen({ formData, phase }) {
  const config = INSIGHT_PHASES[phase] || INSIGHT_PHASES.name;
  const firstName = formData.name.trim().split(/\s+/)[0] || '';
  const headline = config.headline(firstName);
  const isFinish = phase === 'finish';
  const highlight = config.feature ? FITTRACK_FEATURES[config.feature] : null;

  return (
    <View style={styles.root}>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.subtext}>{config.subtext}</Text>

      <View style={styles.imageWrap}>
        <Image
          source={{ uri: config.image }}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={headline}
        />
        <View style={styles.imageFade} />
      </View>

      {isFinish ? (
        <View style={styles.featureList}>
          {Object.values(FITTRACK_FEATURES).map((feature) => (
            <FeatureLine key={feature.title} feature={feature} />
          ))}
        </View>
      ) : highlight ? (
        <View style={styles.highlightBlock}>
          <Icon name={highlight.icon} size={18} color={highlight.color} />
          <Text style={styles.highlightText}>
            <Text style={styles.highlightTitle}>{highlight.title}. </Text>
            {highlight.desc}
          </Text>
        </View>
      ) : null}

      {config.quote ? <Text style={styles.quote}>{config.quote}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginTop: 10,
    fontWeight: '400',
  },
  imageWrap: {
    marginTop: 28,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  highlightBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 2,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  highlightTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  featureList: {
    marginTop: 24,
    gap: 18,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  quote: {
    marginTop: 28,
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 21,
    fontStyle: 'italic',
  },
});
