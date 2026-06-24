import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, ActivityIndicator, Switch, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isStepCountingSupported, startStepCounterUpdate } from '@dongminyu/react-native-step-counter';
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
  const [stepsCount, setStepsCount] = useState(0);

  // Refs for tracking sync logic
  const lastSyncedStepsRef = React.useRef(0);
  const lastSyncedTimeRef = React.useRef(0);

  const syncStepsWithBackend = async (currentSteps) => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      if (currentSteps <= lastSyncedStepsRef.current) {
        return;
      }

      const now = Date.now();
      const stepsDiff = currentSteps - lastSyncedStepsRef.current;
      const timeDiff = now - lastSyncedTimeRef.current;

      // Sync if steps changed by > 20, or if 30 seconds have passed
      if (stepsDiff > 20 || timeDiff > 30000) {
        lastSyncedStepsRef.current = currentSteps;
        lastSyncedTimeRef.current = now;

        const res = await fetch(`${api_call}/DietLog/steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'firebase-uid': user.uid,
          },
          body: JSON.stringify({ stepsCount: currentSteps }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setDietLog(data.data);
        }
      }
    } catch (e) {
      console.error("Error syncing steps to backend:", e);
    }
  };

  const syncStepsWithBackendRef = React.useRef(syncStepsWithBackend);
  useEffect(() => {
    syncStepsWithBackendRef.current = syncStepsWithBackend;
  });

  // --- Step Counter Sensor Listener ---
  useEffect(() => {
    let active = true;
    let subscription = null;

    const setupStepCounter = async () => {
      if (Platform.OS === 'android') {
        try {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
          );

          let granted = hasPermission;
          if (!hasPermission) {
            const requestResult = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
              {
                title: "Activity Recognition Permission",
                message: "FitTrack needs access to physical activity data to track your daily steps.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );
            granted = requestResult === PermissionsAndroid.RESULTS.GRANTED;
          }

          if (!granted && active) {
            console.log("Activity recognition permission denied.");
            return;
          }
        } catch (err) {
          console.warn("Permission check error:", err);
        }
      }

      try {
        const support = await isStepCountingSupported();
        if (support.supported && active) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          subscription = startStepCounterUpdate(todayStart, (stepData) => {
            if (active && stepData && typeof stepData.steps === 'number') {
              setStepsCount(stepData.steps);
              if (syncStepsWithBackendRef.current) {
                syncStepsWithBackendRef.current(stepData.steps);
              }
            }
          });
        } else {
          console.log("Step counting not supported on this device.");
        }
      } catch (err) {
        console.error("Step counter initialization error:", err);
      }
    };

    setupStepCounter();

    return () => {
      active = false;
      try {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        } else {
          const { stopStepCounterUpdate } = require('@dongminyu/react-native-step-counter');
          stopStepCounterUpdate();
        }
      } catch (e) {
        console.log("Error cleaning up step counter:", e);
      }
    };
  }, []);

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
            const dbSteps = data.data.stepsCount || 0;
            if (dbSteps > 0) {
              setStepsCount(prev => {
                if (dbSteps > prev) {
                  lastSyncedStepsRef.current = dbSteps;
                  return dbSteps;
                }
                return prev;
              });
            }
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
  const proteinConsumed = Math.round(dailyTotals.proteinG || 0);
  const carbConsumed = Math.round(dailyTotals.carbsG || 0);
  const fatConsumed = Math.round(dailyTotals.fatG || 0);
  const waterConsumed = Math.round(dietLog?.waterIntakeMl || 0);

  const TimeSpecificClickFunctionalityOnTodaysmealFoodSearch = () => {
    const currentHour = new Date().getHours();
    let mealType = 'Snacks';

    if (currentHour >= 5 && currentHour < 11) {
      mealType = 'Breakfast';       // 5:00 AM - 10:59 AM
    } else if (currentHour >= 11 && currentHour < 16) {
      mealType = 'Lunch';           // 11:00 AM - 3:59 PM
    } else if (currentHour >= 16 && currentHour < 22) {
      mealType = 'Dinner';          // 4:00 PM - 9:59 PM
    } else {
      mealType = 'Late Night Snack'; // 10:00 PM - 4:59 AM
    }

    return navigation.navigate('FoodSearch', { mealType });
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

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
          stepsCount={stepsCount}
        />

        <TodaysGoalCard
          workoutDone={0}
          workoutGoal={45}
          caloriesConsumed={caloriesConsumed}
          proteinConsumed={proteinConsumed}
          carbConsumed={carbConsumed}
          fatConsumed={fatConsumed}
          onAddFoodPress={() => TimeSpecificClickFunctionalityOnTodaysmealFoodSearch()}
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
    backgroundColor: '#0066EE',
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