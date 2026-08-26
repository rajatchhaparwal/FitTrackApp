import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FITTRACK_FEATURES,
  INSIGHT_PHASES,
} from '../../constants/onboardingContent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingInsightScreen({
  formData = { name: '' },
  phase = 'name',
  onNext,
  onBack,
  progressPercent = 20,
  isSubmitting = false,
  isLastStep = false,
}) {
  const insets = useSafeAreaInsets();
  const config = INSIGHT_PHASES[phase] || INSIGHT_PHASES.name;
  const firstName = formData?.name?.trim()?.split(/\s+/)[0] || '';
  const headline = config.headline(firstName);
  const isFinish = phase === 'finish';
  const highlight = config.feature ? FITTRACK_FEATURES[config.feature] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={{ uri: config.image }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark gradient overlays */}
        <View style={styles.topVignette} />
        <View style={styles.bottomGradientLight} />
        <View style={styles.bottomGradientHeavy} />

        {/* Top Bar with consistent progress tracking line */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 6, 20) }]}>
          <View style={styles.topNavRow}>
            {onBack ? (
              <TouchableOpacity
                style={styles.glassBackBtn}
                onPress={onBack}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.topSpacer} />
            )}
            <Text style={styles.brandTitle}>MyFitFly</Text>
            <View style={styles.topSpacer} />
          </View>

          {/* Consistent Blue Progress Track Line */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={[styles.bottomContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
          {/* Overlaid Headline */}
          <Text style={styles.headline}>{headline}</Text>

          {/* Overlaid Subtext */}
          <Text style={styles.subtext}>{config.subtext}</Text>

          {/* Highlight feature pill if applicable */}
          {highlight && !isFinish ? (
            <View style={styles.highlightPill}>
              <Icon name={highlight.icon} size={16} color="#5A8BFF" />
              <Text style={styles.highlightText} numberOfLines={1}>
                {highlight.title}
              </Text>
            </View>
          ) : null}

          {/* Finish features compact row */}
          {isFinish ? (
            <View style={styles.finishRow}>
              {Object.values(FITTRACK_FEATURES).map((f) => (
                <View key={f.title} style={styles.finishChip}>
                  <Icon name={f.icon} size={14} color="#5A8BFF" />
                  <Text style={styles.finishChipText}>{f.title}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Primary CTA Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && styles.primaryBtnOff]}
            onPress={onNext}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isLastStep ? 'Start My Journey' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

          {config.quote ? (
            <Text style={styles.quote}>“{config.quote}”</Text>
          ) : null}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
  },
  bottomGradientLight: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: 'rgba(9, 13, 22, 0.45)',
  },
  bottomGradientHeavy: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.42,
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
  },
  topBar: {
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  glassBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSpacer: {
    width: 38,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5A8BFF',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5A8BFF',
    borderRadius: 2,
  },
  bottomContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    maxWidth: SCREEN_WIDTH * 0.88,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 26, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(90, 139, 255, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  finishChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(19, 26, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(90, 139, 255, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  finishChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#5A8BFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5A8BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnOff: {
    backgroundColor: '#3554A5',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  quote: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
});
