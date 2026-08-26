import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, Image, ActivityIndicator, Switch, Platform, PermissionsAndroid, Share, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isStepCountingSupported, startStepCounterUpdate } from '@dongminyu/react-native-step-counter';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAuth } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchNotification&otherIconsLogic/SearchBar';
import Activities from '../components/ActivityTracker/Activities';
import TodaysGoalCard from '../components/ActivityTracker/TodaysGoalCard';
import { useUser } from '../../UserContext';
import api_call from '../../api';
import { setupDefaultReminders } from '../services/notificationService';
import { PromoBannerCard } from './WorkoutTracker/DiscoverWorkouts';
const { width } = Dimensions.get('window');

const MOCK_PROMO_BANNER = {
  imageUri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600"
};

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

// ── Home Calorie Overview Chart Card ──
const HomeCalorieChartCard = ({ history, goal, navigation }) => {
  if (!history || history.length === 0) return null;
  const maxVal = Math.max(...history.map(d => Math.max(d.intake?.calories || 0, d.burned?.calories || 0, goal || 2000)), 1);

  return (
    <View style={homeChartStyles.card}>
      <View style={homeChartStyles.header}>
        <View>
          <Text style={homeChartStyles.title}>7-Day Calorie Overview</Text>
          <Text style={homeChartStyles.sub}>Intake vs Burned</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CalorieLog')}>
          <Text style={homeChartStyles.link}>View Details ›</Text>
        </TouchableOpacity>
      </View>

      <View style={homeChartStyles.legend}>
        <View style={homeChartStyles.legendItem}>
          <View style={[homeChartStyles.legendDot, { backgroundColor: '#0066EE' }]} />
          <Text style={homeChartStyles.legendText}>Intake</Text>
        </View>
        <View style={homeChartStyles.legendItem}>
          <View style={[homeChartStyles.legendDot, { backgroundColor: '#FF6B35' }]} />
          <Text style={homeChartStyles.legendText}>Burned</Text>
        </View>
      </View>

      <View style={homeChartStyles.chartRow}>
        {history.map((day, idx) => {
          const intakeH = Math.max(((day.intake?.calories || 0) / maxVal) * 100, 2);
          const burnedH = Math.max(((day.burned?.calories || 0) / maxVal) * 100, 2);
          const isToday = idx === history.length - 1;
          return (
            <TouchableOpacity
              key={day.date || idx}
              style={homeChartStyles.col}
              onPress={() => navigation.navigate('CalorieLog')}
            >
              <View style={homeChartStyles.barPair}>
                <View style={[homeChartStyles.bar, { height: intakeH, backgroundColor: '#0066EE' }]} />
                <View style={[homeChartStyles.bar, { height: burnedH, backgroundColor: '#FF6B35' }]} />
              </View>
              <Text style={[homeChartStyles.xLabel, isToday && { color: '#0066EE', fontWeight: '700' }]}>
                {isToday ? 'Today' : day.dayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Home Weight Progress Chart Card ──
const HomeWeightChartCard = ({ history, targetWeight, navigation }) => {
  if (!history || history.length === 0) return null;
  const weights = history.map(h => Number(h.weight) || 0);
  const validTarget = Number(targetWeight) || weights[weights.length - 1] || 70;
  const allValues = [...weights, validTarget].filter(v => v > 0);
  const minW = Math.max(Math.floor(Math.min(...allValues)) - 2, 0);
  const maxW = Math.ceil(Math.max(...allValues)) + 2;
  const range = Math.max(maxW - minW, 1);

  return (
    <View style={homeChartStyles.card}>
      <View style={homeChartStyles.header}>
        <View>
          <Text style={homeChartStyles.title}>Weight Progress Trend</Text>
          <Text style={homeChartStyles.sub}>Target: {validTarget} kg</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProgressHistory')}>
          <Text style={homeChartStyles.link}>View History ›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeChartStyles.pointsRow}>
        {history.map((entry, idx) => {
          const val = Number(entry.weight) || 0;
          const hPct = (val - minW) / range;
          const barH = Math.max(hPct * 90, 10);
          const dateObj = new Date(entry.date);
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const isLast = idx === history.length - 1;

          return (
            <TouchableOpacity
              key={idx}
              style={homeChartStyles.colWeight}
              onPress={() => navigation.navigate('ProgressHistory')}
            >
              <Text style={[homeChartStyles.weightVal, isLast && { color: '#0066EE', fontWeight: '800' }]}>
                {val}
              </Text>
              <View style={homeChartStyles.weightTrack}>
                <View style={[homeChartStyles.weightFill, { height: barH, backgroundColor: isLast ? '#0066EE' : '#5A8BFF88' }]} />
              </View>
              <Text style={[homeChartStyles.xLabel, isLast && { color: '#0066EE', fontWeight: '700' }]}>
                {dateStr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const homeChartStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 15,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066EE',
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 125,
    paddingTop: 10,
  },
  col: {
    alignItems: 'center',
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 125,
    paddingTop: 10,
    gap: 16,
  },
  colWeight: {
    alignItems: 'center',
    width: 36,
  },
  weightVal: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  weightTrack: {
    height: 80,
    width: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    justify: 'flex-end',
    overflow: 'hidden',
  },
  weightFill: {
    width: '100%',
    borderRadius: 5,
  },
  xLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
});

const Home = () => {
  const navigation = useNavigation();
  const { userData, loading } = useUser();
  const [dietLog, setDietLog] = useState(null);
  const [fetchingLog, setFetchingLog] = useState(true);
  const [stepsCount, setStepsCount] = useState(0);

  const [unlockedBadgeToShow, setUnlockedBadgeToShow] = useState(null);
  const currentStreak = userData?.stats?.current_streak_days || 0;

  // Check for badge unlocks on load
  useEffect(() => {
    if (loading || !userData) return;
    const checkBadgeUnlocks = async () => {
      try {
        const acknowledgedStr = await AsyncStorage.getItem('acknowledged_streak_badges');
        const acknowledged = acknowledgedStr ? JSON.parse(acknowledgedStr) : [];

        // Find badges user qualifies for but hasn't acknowledged yet
        const newlyUnlocked = BADGES.find(
          badge => currentStreak >= badge.days && !acknowledged.includes(badge.id)
        );

        if (newlyUnlocked) {
          setUnlockedBadgeToShow(newlyUnlocked);
          // Auto acknowledge it
          const updated = [...acknowledged, newlyUnlocked.id];
          await AsyncStorage.setItem('acknowledged_streak_badges', JSON.stringify(updated));
        }
      } catch (err) {
        console.log("Error checking badge unlocks:", err);
      }
    };
    checkBadgeUnlocks();
  }, [currentStreak, loading, userData]);

  const handleShareBadge = async (badge) => {
    const shareText = `🔥 MyFitFly Streak! I have maintained a ${currentStreak}-Day Workout Streak and unlocked the "${badge.title}" badge! Join me on my fitness journey! 💪🏋️‍♀️`;
    try {
      await Share.share({
        message: shareText,
        title: 'MyFitFly Streak Achievement',
      });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  // Refs for tracking sync logic
  const lastSyncedStepsRef = React.useRef(0);
  const lastSyncedTimeRef = React.useRef(0);

  const syncStepsWithBackend = async (currentSteps) => {
    try {
      const user = getAuth().currentUser;
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
                message: "MyFitFly needs access to physical activity data to track your daily steps.",
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

  const [todayWorkoutMinutes, setTodayWorkoutMinutes] = useState(0);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [homeCalorieGoal, setHomeCalorieGoal] = useState(2000);
  const [weightHistory, setWeightHistory] = useState([]);
  const [homeTargetWeight, setHomeTargetWeight] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchLog = async () => {
        try {
          const user = getAuth().currentUser;
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

          // Fetch today's workout minutes
          const wRes = await fetch(`${api_call}/WorkoutTemplates/history?_t=${Date.now()}`, {
            headers: { 'firebase-uid': user.uid }
          });
          const wData = await wRes.json();
          if (isActive && wData.success && Array.isArray(wData.data)) {
            const todayStr = new Date().toISOString().split('T')[0];
            const todayLogs = wData.data.filter(log => {
              const logDate = new Date(log.date || log.createdAt).toISOString().split('T')[0];
              return logDate === todayStr;
            });
            const mins = todayLogs.reduce((sum, l) => sum + (l.durationMins || 0), 0);
            setTodayWorkoutMinutes(mins);
          }

          // Fetch 7-day calorie history for home chart
          const calRes = await fetch(`${api_call}/DietLog/calorie-history`, {
            headers: { 'firebase-uid': user.uid }
          });
          const calData = await calRes.json();
          if (isActive && calData.success) {
            setCalorieHistory(calData.data || []);
            setHomeCalorieGoal(calData.calorieGoal || 2000);
          }

          // Fetch weight history for home chart
          const wHistRes = await fetch(`${api_call}/User/weight-history`, {
            headers: { 'firebase-uid': user.uid }
          });
          const wHistData = await wHistRes.json();
          if (isActive && wHistData.success) {
            setWeightHistory(wHistData.history || []);
            setHomeTargetWeight(wHistData.targetWeight || 0);
          }
        } catch (e) {
          console.error("Error fetching logs on home:", e);
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

          <View style={styles.headerRightRow}>
            <TouchableOpacity
              style={styles.streakButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('UserStreak')}
            >
              <Icon name="fire" size={22} color="#FF5722" />
              <Text style={styles.streakButtonText}>{userData?.stats?.current_streak_days || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bellButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="bell-outline" size={22} color="#0066EE" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar placeholder="Search food, exercises..." searchType="all" />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Workouts</Text>
        </View>


        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.challengeCarouselPadding}
        >
          <View style={styles.challengeHeroCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60' }}
              style={styles.challengeImageBg}
            />
            <View style={styles.challengeOverlayGradient}>
              <Text style={styles.challengeDurationTag}>28 DAYS</Text>
              <Text style={styles.challengeMainTitle}>FULL BODY{"\n"}CHALLENGE</Text>
              <Text style={styles.challengeSubtitle}>Start your body-toning journey to target all muscle groups!</Text>
              <TouchableOpacity style={styles.challengeStartButton} activeOpacity={0.9}>
                <Text style={styles.challengeStartButtonText}>START</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.carouselPage}>
            <PromoBannerCard
              countLabel="LIMITED OFFER"
              heading="Unlock Pro Personalized Coaching Plans"
              imageUri={MOCK_PROMO_BANNER.imageUri}
              onPress={() => console.log('Promo Banner Clicked')}
            />
          </View>
        </ScrollView>

        <Activities
          navigation={navigation}
          caloriesConsumed={caloriesConsumed}
          waterConsumed={waterConsumed}
          stepsCount={stepsCount}
          workoutMinutes={todayWorkoutMinutes}
        />

        <TodaysGoalCard
          workoutDone={todayWorkoutMinutes}
          workoutGoal={45}
          caloriesConsumed={caloriesConsumed}
          proteinConsumed={proteinConsumed}
          carbConsumed={carbConsumed}
          fatConsumed={fatConsumed}
          onAddFoodPress={() => TimeSpecificClickFunctionalityOnTodaysmealFoodSearch()}
        />

        {/* ── 7-Day Calorie Bar Graph ── */}
        <HomeCalorieChartCard
          history={calorieHistory}
          goal={homeCalorieGoal}
          navigation={navigation}
        />

        {/* ── Weight Progress Trend Graph ── */}
        <HomeWeightChartCard
          history={weightHistory}
          targetWeight={homeTargetWeight}
          navigation={navigation}
        />

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Confetti / Congratulatory Badge Unlock Modal Popup */}
      <Modal
        visible={unlockedBadgeToShow !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUnlockedBadgeToShow(null)}
      >
        <View style={styles.unlockOverlay}>
          <View style={styles.unlockCard}>
            <Text style={styles.unlockSparkle}>🎉 CONGRATULATIONS! 🎉</Text>
            <Text style={styles.unlockHeader}>Badge Unlocked!</Text>

            <View style={[styles.largeBadgeCircle, { backgroundColor: unlockedBadgeToShow?.color ? `${unlockedBadgeToShow.color}15` : '#FF572215' }]}>
              {unlockedBadgeToShow && (
                <Icon
                  name={unlockedBadgeToShow.icon.replace('-outline', '')}
                  size={70}
                  color={unlockedBadgeToShow.color}
                />
              )}
            </View>

            <Text style={styles.unlockBadgeTitle}>{unlockedBadgeToShow?.title}</Text>
            <Text style={styles.unlockBadgeDesc}>{unlockedBadgeToShow?.description}</Text>

            <View style={styles.unlockShareBtnRow}>
              <TouchableOpacity
                style={styles.unlockShareButton}
                onPress={() => {
                  handleShareBadge(unlockedBadgeToShow);
                  setUnlockedBadgeToShow(null);
                }}
              >
                <Text style={styles.unlockShareBtnText}>Share Achievement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.unlockCloseButton}
                onPress={() => setUnlockedBadgeToShow(null)}
              >
                <Text style={styles.unlockCloseText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },

  // Challenge Carousel Styles
  challengeCarouselPadding: { paddingHorizontal: 20, marginTop: 12 },
  challengeHeroCard: {
    width: width - 40,
    height: 185,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F56FF',
    marginRight: 12,
  },
  challengeImageBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.4,
    position: 'absolute',
  },
  challengeOverlayGradient: { flex: 1, padding: 18, justifyContent: 'center' },
  challengeDurationTag: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12 },
  challengeMainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Montserrat-Bold',
    marginTop: 2,
    lineHeight: 26,
  },
  challengeSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, maxWidth: '75%' },
  challengeStartButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
  },
  challengeStartButtonText: { color: '#0F56FF', fontWeight: '800', fontSize: 13 },
  carouselPage: {
    width: width - 40,
    justifyContent: 'center',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  streakButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  unlockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  unlockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unlockSparkle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF9800',
    letterSpacing: 2,
  },
  unlockHeader: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 20,
  },
  largeBadgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  unlockBadgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  unlockBadgeDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  unlockShareBtnRow: {
    width: '100%',
    gap: 10,
  },
  unlockShareButton: {
    backgroundColor: '#0066EE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  unlockShareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  unlockCloseButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  unlockCloseText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Home;