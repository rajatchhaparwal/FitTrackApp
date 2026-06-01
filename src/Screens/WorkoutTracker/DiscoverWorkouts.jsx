import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROMO BANNER CARD (The top feature card with lower-left text overlay)
// ─────────────────────────────────────────────────────────────────────────────
 const PromoBannerCard = ({ countLabel, heading, imageUri, onPress }) => (
  <TouchableOpacity style={styles.promoCard} activeOpacity={0.9} onPress={onPress}>
    <Image source={{ uri: imageUri }} style={styles.cardImageBg} />
    {/* Dark semi-translucent overlay to make white text highly readable over any image */}
    <View style={styles.darkOverlay} />
    <View style={styles.promoTextContainer}>
      <Text style={styles.promoCountText}>{countLabel}</Text>
      <Text style={styles.promoHeadingText} numberOfLines={2}>{heading}</Text>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. PORTRAIT SQUARE CARD (The grid horizontal scroll card with title overlay)
// ─────────────────────────────────────────────────────────────────────────────
  const PortraitSquareCard = ({ title, imageUri }) => (
  <TouchableOpacity style={styles.portraitCard} activeOpacity={0.9} >
    <Image source={{ uri: imageUri }} style={styles.cardImageBg} />
    <View style={[styles.darkOverlay, { opacity: 0.25 }]} />
    <Text style={styles.portraitCardTitle} numberOfLines={2}>{title}</Text>
  </TouchableOpacity>
);


// ─────────────────────────────────────────────────────────────────────────────
// 3. ROW WORKOUT CARD (The clean row listing with left thumb media)
// ─────────────────────────────────────────────────────────────────────────────
const RowWorkoutCard = ({ title, subtext, imageUri, onPress }) => (
  <TouchableOpacity style={styles.rowCardContainer} activeOpacity={0.8} onPress={onPress}>
    <Image source={{ uri: imageUri }} style={styles.rowThumbnail} />
    <View style={styles.rowTextGroup}>
      <Text style={styles.rowTitleText} numberOfLines={1}>{title}</Text>
      <Text style={styles.rowSubtext} numberOfLines={1}>{subtext}</Text>
    </View>
  </TouchableOpacity>
);

export {RowWorkoutCard,PortraitSquareCard,PromoBannerCard}

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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  
  // Promo Banner Layout Styles
  promoCard: {
    height: 165,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  promoTextContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  promoCountText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Montserrat-Medium',
  },
  promoHeadingText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Montserrat-Bold',
    marginTop: 4,
    lineHeight: 26,
  },

  // Portrait Grid Card Layout Styles
  portraitCard: {
    width: width * 0.36, // Scaled precisely so cards fit beautifully side-by-side on any display width
    height: width * 0.36, 
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F4F5F7',
  },
  portraitCardTitle: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
    lineHeight: 18,
  },

  // Row Workout Layout Styles
  rowCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  rowThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F4F5F7',
    resizeMode: 'cover',
  },
  rowTextGroup: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  rowTitleText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
    color: '#111111',
  },
  rowSubtext: {
    fontSize: 13,
    color: '#8A8F99',
    fontFamily: 'Montserrat-Medium',
    marginTop: 4,
  },
});