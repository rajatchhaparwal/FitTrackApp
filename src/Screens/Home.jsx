import React from 'react';
import {ScrollView,StyleSheet,Text,View,Dimensions,TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import WhatToTrain from '../components/workoutTracker/WhatToTrain';
import TrackFood from '../components/DietTracker/TrackFood';
import SearchBar from '../components/SearchNotification&otherIconsLogic/SearchBar';
import Activities from '../components/ActivityTracker/Activities';


const { width } = Dimensions.get('window');
let name = "Rajat";

const Home = () => {
  return (

    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header Section  Hello & Notification */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greeting}>Hello, {name}!</Text>
            <Text style={styles.greetingSubheading}>Stay Fit & Healthy</Text>
          </View>

          {/* Notification Bell with Badge */}
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
             <View style={styles.bellIconPlaceholder}>
                 <Icon name="bell" size={20} color="#5a8bff"/>
             </View>
             <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <SearchBar/>

        {/* Section: Trending Workouts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Workouts</Text>
        </View>
        <WhatToTrain data={{ WorkoutType: "Full Body Workout", WorkoutTime: "36", NumberOFExercises: "13" }} />
        <Activities/>
        <TrackFood/>
  
      </ScrollView>
    </SafeAreaView>
          
            
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    paddingTop: 20,
    paddingBottom: 25,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium', // Matches the smaller "Hello"
    color: '#8E8E8E', // Softer grey for secondary text
    marginBottom: 2,
  },
  greetingSubheading: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#1A1A1A', 
  },
  bellButton: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffffff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  bellIconPlaceholder: {
    width: 22,
    height: 22,
    backgroundColor: '#ffffffff', 
    borderRadius: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 9,
    height: 9,
    backgroundColor: '#FF4B4B', 
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF', 
  },
  sectionHeader: {
    paddingHorizontal: width * 0.06,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', 
    color: '#1A1A1A',
  }
});

export default Home;