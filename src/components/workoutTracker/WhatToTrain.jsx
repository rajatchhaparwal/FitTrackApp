import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'

const { width } = Dimensions.get('window');

const WhatToTrain = ({ data }) => {
  const title = data?.WorkoutType || "Full Body Workout";
  const exercises = data?.NumberOFExercises || "13";
  const duration = data?.WorkoutTime || "36";

  return (
    <TouchableOpacity activeOpacity={0.95} style={styles.cardContainer}>
      
      {/* Left Column: Information */}
      <View style={styles.textContainer}>
        <Text style={styles.workoutTitle} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.badgeRow}>
          <View style={styles.miniBadge}>
            <Text style={styles.badgeText}>🏋️ {exercises} Exercises</Text>
          </View>
          <View style={[styles.miniBadge, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]}>
            <Text style={styles.badgeText}>⏱️ {duration} mins</Text>
          </View>
        </View>
        
        {/* Floating Translucent Pill Button */}
        <TouchableOpacity activeOpacity={0.8} style={styles.viewButton}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Right Column: Immersive Overlapping Artwork */}
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkSKuQrRCFH5VHsLdR5BQO89uQSsrTIGXnow&s' }} 
          style={styles.workoutImage}
          resizeMode="cover"
        />
        {/* Soft smooth gradient mask to blend photo back into background */}
        <View style={styles.blendOverlay} />
      </View>

    </TouchableOpacity>
  )
}

export default WhatToTrain

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#EBF1FF', // Soft, cool premium powder blue
    borderRadius: 28,           // Generous high-end curved corners
    height: 140,                // Slightly taller box profile for proper breathing space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,       
    marginVertical: 12,
    position: 'relative',
    overflow: 'hidden',
    // Soft organic card shadow
    shadowColor: '#92A3FD',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  textContainer: {
    flex: 1.3,
    paddingLeft: 22,
    paddingVertical: 16,
    justifyContent: 'space-between',
    height: '100%',
    zIndex: 3, // Pushes text layer cleanly over background fades
  },
  workoutTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,               // Stronger, confident typographic sizing
    color: '#1D212C', 
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  miniBadge: {
    backgroundColor: 'rgba(146, 163, 253, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 11,
    color: '#5566A5',
  },
  viewButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14, 
    alignSelf: 'flex-start',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  buttonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 11,
    color: '#92A3FD', 
    letterSpacing: 0.2,
  },
  imageWrapper: {
    width: 140,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  workoutImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9, // Slightly dim to retain text contrast safety
  },
  blendOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Fades the image seamlessly leftwards into the solid container base tint
    backgroundColor: 'transparent',
    borderLeftWidth: 40,
    borderLeftColor: '#EBF1FF', 
    shadowColor: '#EBF1FF',
    shadowRadius: 20,
    shadowOpacity: 1,
  }
});