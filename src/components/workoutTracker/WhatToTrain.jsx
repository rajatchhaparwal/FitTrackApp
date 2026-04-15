import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'

const { width } = Dimensions.get('window');

const WhatToTrain = ({data}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardContainer}>
      {/* Left Side: Text Info */}
      <View style={styles.textContainer}>
        <Text style={styles.workoutTitle}>{data.WorkoutType}</Text>
        <Text style={styles.workoutStats}>{data.NumberOFExercises} Exercises | {data.WorkoutTime}mins</Text>
        
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.buttonText}>View More</Text>
        </TouchableOpacity>
      </View>

      {/* Right Side: Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkSKuQrRCFH5VHsLdR5BQO89uQSsrTIGXnow&s' }} 
          style={styles.workoutImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  )
}

export default WhatToTrain

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(146, 163, 253, 0.2)', 
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: width * 0.05,
    marginVertical: 10,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1, // Takes up remaining space on the left
  },
  workoutTitle: {
    fontFamily: 'Montserrat-SemiBold', // Your installed font
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 5,
  },
  workoutStats: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#7B6F72',
    marginBottom: 15,
  },
  viewButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignSelf: 'flex-start', // Button only as wide as text
  },
  buttonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: '#92A3FD', // Matches the theme color
  },
  imageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutImage: {
    width: 100,
    height: 100,
  }
});