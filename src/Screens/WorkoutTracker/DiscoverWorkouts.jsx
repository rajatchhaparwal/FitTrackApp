import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROMO BANNER CARD
// ─────────────────────────────────────────────────────────────────────────────
const PromoBannerCard = ({ countLabel, heading, imageUri, onPress }) => (
  <TouchableOpacity style={styles.promoCard} activeOpacity={0.95} onPress={onPress}>
    <Image source={{ uri: imageUri }} style={styles.cardImageBg} />
    {/* Dual overlay for a modern pseudo-gradient effect without linear-gradient */}
    <View style={[styles.darkOverlay, { opacity: 0.2 }]} />
    <View style={styles.bottomDarkOverlay} />
    <View style={styles.promoTextContainer}>
      <Text style={styles.promoCountText}>{countLabel}</Text>
      <Text style={styles.promoHeadingText} numberOfLines={2}>{heading}</Text>
      <View style={styles.actionPill}>
        <Text style={styles.actionPillText}>Start Now</Text>
        <Icon name="arrow-right" size={14} color="#FFF" />
      </View>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. PORTRAIT SQUARE CARD
// ─────────────────────────────────────────────────────────────────────────────
const PortraitSquareCard = ({ title, imageUri }) => (
  <TouchableOpacity style={styles.portraitCard} activeOpacity={0.9} >
    <Image source={{ uri: imageUri }} style={styles.cardImageBg} />
    <View style={styles.bottomDarkOverlay} />
    <Text style={styles.portraitCardTitle} numberOfLines={2}>{title}</Text>
    <View style={styles.playIconCircle}>
      <Icon name="play" size={14} color="#5A8BFF" />
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROW WORKOUT CARD
// ─────────────────────────────────────────────────────────────────────────────
const RowWorkoutCard = ({ title, subtext, imageUri, onPress }) => (
  <TouchableOpacity style={styles.rowCardContainer} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.rowImageContainer}>
      <Image source={{ uri: imageUri }} style={styles.rowThumbnail} />
      <View style={styles.rowImageOverlay}>
        <Icon name="play-circle-outline" size={24} color="#FFF" />
      </View>
    </View>
    <View style={styles.rowTextGroup}>
      <Text style={styles.rowTitleText} numberOfLines={1}>{title}</Text>
      <Text style={styles.rowSubtext} numberOfLines={1}>{subtext}</Text>
    </View>
    <Icon name="chevron-right" size={20} color="#C4C8D0" style={styles.rowChevron} />
  </TouchableOpacity>
);

export { RowWorkoutCard, PortraitSquareCard, PromoBannerCard }

// ─── Shared Component Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardImageBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  bottomDarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.4)', // Simplified overlay for bottom text contrast
  },

  // Promo Banner Layout Styles
  promoCard: {
    height: 180,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  promoTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  promoCountText: {
    color: '#AEC6FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  promoHeadingText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },

  // Portrait Grid Card Layout Styles
  portraitCard: {
    width: width * 0.38,
    height: width * 0.45,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F4F5F7',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  portraitCardTitle: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  playIconCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Row Workout Layout Styles
  rowCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  rowImageContainer: {
    width: 76,
    height: 76,
    borderRadius: 14,
    overflow: 'hidden',
  },
  rowThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rowImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextGroup: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  rowTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rowSubtext: {
    fontSize: 13,
    color: '#717171',
    fontWeight: '500',
  },
  rowChevron: {
    marginLeft: 8,
  },
});