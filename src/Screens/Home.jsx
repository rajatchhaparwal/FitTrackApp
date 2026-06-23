import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import WhatToTrain from '../components/workoutTracker/WhatToTrain';
import SearchBar from '../components/SearchNotification&otherIconsLogic/SearchBar';
import Activities from '../components/ActivityTracker/Activities';
import TodaysGoalCard from '../components/ActivityTracker/TodaysGoalCard';
import { useUser } from '../../UserContext';
import api_call from '../../api';
import { setupDefaultReminders } from '../services/notificationService';

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
  const navigation = useNavigation();
  const { userData, loading } = useUser();
  const [dietLog, setDietLog] = useState(null);
  const [fetchingLog, setFetchingLog] = useState(true);

  useEffect(() => {
    setupDefaultReminders().catch(e => console.log('Reminders setup error:', e));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchLog = async () => {
        try {
          const user = auth().currentUser;
          if (!user) return;
          const res = await fetch(`${api_call}/DietLog/today`, {
            headers: { 'firebase-uid': user.uid }
          });
          const data = await res.json();
          if (isActive && data.success && data.data) {
            setDietLog(data.data);
          }
        } catch (e) {
          console.error("Error fetching diet log on home:", e);
        } finally {
          if (isActive) setFetchingLog(false);
        }
      };
      fetchLog();
      return () => { isActive = false; };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066EE" />
      </View>
    );
  }

  const dailyTotals = dietLog?.dailyTotals || {};
  const caloriesConsumed = Math.round(dailyTotals.calories || 0);
  const proteinConsumed  = Math.round(dailyTotals.proteinG || 0);
  const carbConsumed     = Math.round(dailyTotals.carbsG || 0);
  const fatConsumed      = Math.round(dailyTotals.fatG || 0);
  const waterConsumed    = Math.round(dietLog?.waterIntakeMl || 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ================= GREETING HEADER ================= */}
        <View style={styles.headerContainer}>
          <View style={styles.textColumn}>
            <Text style={styles.greeting}>Hello, {userData?.name || 'User'}</Text>
            <Text style={styles.greetingSubheading} numberOfLines={2}>
              {getEmotionalGreeting()}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.bellButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="bell-outline" size={22} color="#0066EE" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <SearchBar placeholder="Search food, exercises..." searchType="all" />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Workouts</Text>
        </View>
        <WhatToTrain data={{ WorkoutType: "Full Body Workout", WorkoutTime: "36", NumberOFExercises: "13" }} />
        
        <Activities 
          navigation={navigation}
          caloriesConsumed={caloriesConsumed}
          waterConsumed={waterConsumed}
        />
        
        <TodaysGoalCard 
          workoutDone={0} 
          workoutGoal={45} 
          caloriesConsumed={caloriesConsumed}
          proteinConsumed={proteinConsumed}
          carbConsumed={carbConsumed}
          fatConsumed={fatConsumed}
          onAddFoodPress={() => navigation.navigate('FoodSearch', { mealType: 'Breakfast' })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    color: '#64748B',
    letterSpacing: -0.1,
  },
  greetingSubheading: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#0F172A',
    marginTop: 6,
    letterSpacing: -0.3,
    lineHeight: 24,
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
    borderColor: '#F1F5F9',
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
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
    color: '#0F172A',
  }
});

export default Home;