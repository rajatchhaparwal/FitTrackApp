import React from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import WhatToTrain from '../components/workoutTracker/WhatToTrain';
import SearchBar from '../components/SearchNotification&otherIconsLogic/SearchBar';
import Activities from '../components/ActivityTracker/Activities';
import HomeScreenCalender from '../constants/HomeScreenCalendar';
import TodaysGoalCard from '../components/ActivityTracker/TodaysGoalCard';
import { useUser } from '../../UserContext';

const { width } = Dimensions.get('window');

const getEmotionalGreeting = () => {
  const hour = new Date().getHours();
  const dailyIndex = Math.floor(Date.now() / 86400000);

  if (hour >= 5 && hour < 12) {
    const morningQuotes = [
      "Every strong version of you starts with mornings like this.",
      "Discipline begins before motivation wakes up.",
      "Your future self will remember what you do today.",
      "Another sunrise. Another chance to improve.",
      "Small steps today. Big transformation tomorrow.",
      "Most people quit early. You didn’t."
    ];
    return morningQuotes[dailyIndex % morningQuotes.length];
  }
  
  if (hour >= 12 && hour < 17) {
    const afternoonQuotes = [
      "Consistency matters more than intensity.",
      "You’re already ahead because you showed up.",
      "Progress is being built quietly today.",
      "Keep moving. Your momentum is growing.",
      "Discipline is built in ordinary moments like this.",
      "Even slow progress changes lives."
    ];
    return afternoonQuotes[dailyIndex % afternoonQuotes.length];
  }

  const nightQuotes = [
    "Your effort today was not wasted.",
    "Recovery is part of becoming stronger.",
    "Another day invested in yourself.",
    "You don’t need perfection. Just consistency.",
    "Strong habits are built at night.",
    "Your future body is being built right now."
  ];
  return nightQuotes[dailyIndex % nightQuotes.length];
};

const Home = () => {
  const { userData, loading } = useUser();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ================= REPROPORTIONED GREETING HEADER ================= */}
        <View style={styles.headerContainer}>
          <View style={styles.textColumn}>
            <Text style={styles.greeting}>Hello, {userData?.name || "Rajat"}</Text>
            <Text style={styles.greetingSubheading} numberOfLines={2}>
              {getEmotionalGreeting()}
            </Text>
          </View>

          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <Icon name="bell" size={20} color="#5a8bff" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        {/* ========================================================================= */}

        <SearchBar />
        
        {/* <HomeScreenCalender/> */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Workouts</Text>
        </View>
        <WhatToTrain data={{ WorkoutType: "Full Body Workout", WorkoutTime: "36", NumberOFExercises: "13" }} />
        
        <Activities userData={userData} />
        
        <TodaysGoalCard workoutDone={25} workoutGoal={45} foodDone={1420} foodGoal={2100} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#f9f9f9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Keeps the notification bell anchored perfectly at the top right
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    width: '100%',
  },
  textColumn: {
    flex: 1, 
    flexDirection: 'column',
    paddingRight: 16, 
  },
  greeting: {
    fontFamily: 'Montserrat-Medium', 
    fontSize: 14,
    color: '#A0A5B5', // Slightly crisper light gray text
    letterSpacing: -0.1,
  },
  greetingSubheading: {
    fontFamily: 'Montserrat-SemiBold', // Shifted from Bold to SemiBold to look clean and modern
    fontSize: 18,                      // Scaled down from 26 to look elegant on two lines
    color: '#2D3142',                  // Beautiful deep charcoal instead of heavy black
    marginTop: 6,
    letterSpacing: -0.3,
    lineHeight: 24,                    // Balanced space between lines
  },
  bellButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 13,
    right: 14,
    width: 8,
    height: 8,
    backgroundColor: '#FF4B4B', 
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF', 
  },
  sectionHeader: {
    paddingHorizontal: width * 0.06,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', 
    color: '#1A1A1A',
  }
});

export default Home;