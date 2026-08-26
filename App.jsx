import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { subscribeToAuthState } from './src/services/phoneAuth';
import { setLocalOnboardingComplete } from './src/services/onboardingStatus';
import { getAuth } from '@react-native-firebase/auth';
import { UserProvider, useUser } from './UserContext';

// ── Auth & Onboarding Screens ──────────────────────────────────────────────────
import Login from './src/Screens/Auth/Login';
import Otp from './src/Screens/Auth/Otp';
import CompleteUserProfile from './src/Screens/Auth/CompleteUserProfile';
import SplashScreen from './src/Screens/SplashScreen';

// ── Main Tab Screens ───────────────────────────────────────────────────────────
import Home from './src/Screens/Home';
import WorkoutTracker from './src/Screens/WorkoutTracker/WorkoutTracker';
import DietTracker from './src/Screens/DietTracker/DietTracker';
import NotificationsScreen from './src/Screens/UserProfile/NotificationsScreen';
import AccountSettingsScreen from './src/Screens/UserProfile/AccountSettingsScreen';
import ProgressHistoryScreen from './src/Screens/UserProfile/ProgressHistoryScreen';

// ── Diet Screens ───────────────────────────────────────────────────────────────
import CaptureMeal from './src/Screens/DietTracker/CaptureMeal';
import CalorieLogScreen from './src/Screens/DietTracker/CalorieLogScreen';
import TrackFood from './src/components/DietTracker/TrackFood';

// ── Workout Screens ────────────────────────────────────────────────────────────
import AbsBeginnerScreen from './src/Screens/WorkoutTracker/AbsBeginnerScreen';
import SpecificWorkoutPage from './src/Screens/WorkoutTracker/SpecificWorkoutPage';
import MediaPipeLiveScreen from './src/Screens/WorkoutTracker/MediaPipeLiveScreen';

// ── Activity Screens ───────────────────────────────────────────────────────────
import DrinkWaterScreen from './src/Screens/Actitvities/DrinkWaterScreen';
import StepsScreen from './src/Screens/Actitvities/StepsScreen';
import Activities from './src/components/ActivityTracker/Activities';
import UserStreak from './src/Screens/UserProfile/UserStreak';

// ── NEW: Recommendation & Search Screens ──────────────────────────────────────
import FoodSearchScreen from './src/Screens/FoodSearch/FoodSearchScreen';
import ExerciseRecommendationScreen from './src/Screens/ExerciseRecommendation/ExerciseRecommendationScreen';
import FoodRecommendationScreen from './src/Screens/FoodRecommendation/FoodRecommendationScreen';
import FoodDetailScreen from './src/Screens/FoodRecommendation/FoodDetailScreen';

// ── Theme ─────────────────────────────────────────────────────────────────────
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// ── API Base URL ───────────────────────────────────────────────────────────────
import api_call from './api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Bottom Tab Navigator ───────────────────────────────────────────────────────
function MyTab() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: 'home',
            Workout: 'timer',
            Diet: 'food-apple',
            Profile: 'account',
          };
          return <Icons name={iconMap[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Workout" component={WorkoutTracker} />
      <Tab.Screen name="Diet" component={DietTracker} />
      <Tab.Screen name="Profile" component={AccountSettingsScreen} />
    </Tab.Navigator>
  );
}

// ── Root Stack Navigator ───────────────────────────────────────────────────────
export function MyStack() {
  const { needsOnboarding, setNeedsOnboarding, loading: profileLoading, refreshData } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Quick splash display time (300ms for smooth initial mount)
    const splashTimer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 300);

    // Auth timeout fallback (2.5 s max)
    const authFallbackTimer = setTimeout(() => {
      if (!cancelled) {
        setAuthReady(true);
        setIsLoading(false);
      }
    }, 2500);

    const unsubscribe = subscribeToAuthState((user) => {
      if (cancelled) return;
      setIsLogged(Boolean(user));
      clearTimeout(authFallbackTimer);
      setAuthReady(true);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      clearTimeout(splashTimer);
      clearTimeout(authFallbackTimer);
      unsubscribe();
    };
  }, []);

  const waitingForProfile = isLogged && profileLoading;
  if (isLoading || !authReady || waitingForProfile) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLogged ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Otp" component={Otp} />
        </>
      ) : needsOnboarding ? (
        <>
          <Stack.Screen name="CompleteUserProfile">
            {props => (
              <CompleteUserProfile
                {...props}
                onOnboardingComplete={async () => {
                  const user = getAuth().currentUser;
                  if (user) await setLocalOnboardingComplete(user.uid, true);
                  setNeedsOnboarding(false);
                  await refreshData();
                }}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <>
          {/* ── Main Tab ── */}
          <Stack.Screen name="MyTab" component={MyTab} />

          {/* ── Diet Screens ── */}
          <Stack.Screen name="DietDetails" component={DietTracker} />
          <Stack.Screen name="CaptureMeal" component={CaptureMeal} />
          <Stack.Screen name="TrackFood" component={TrackFood} />
          <Stack.Screen name="CalorieLog" component={CalorieLogScreen} />
          
          {/* ── Workout Screens ── */}
          <Stack.Screen name="AbsBeginnerScreen" component={AbsBeginnerScreen} />
          <Stack.Screen name="SpecificWorkoutPage" component={SpecificWorkoutPage} />
          <Stack.Screen name="QuickPoseLiveScreen" component={MediaPipeLiveScreen} />
          <Stack.Screen name="WorkoutTracker" component={WorkoutTracker} />

          {/* ── Activity Screens ── */}
          <Stack.Screen name="DrinkWaterScreen" component={DrinkWaterScreen} />
          <Stack.Screen name="Activities" component={Activities} />
          <Stack.Screen name="Steps" component={StepsScreen} />

          {/* ── NEW: Recommendation & Search Screens ── */}
          <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
          <Stack.Screen name="ExerciseRecommendation" component={ExerciseRecommendationScreen} />
          <Stack.Screen name="FoodRecommendation" component={FoodRecommendationScreen} />
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="UserStreak" component={UserStreak}/>
          <Stack.Screen name="ProgressHistory" component={ProgressHistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────
const App = () => (
  <ThemeProvider>
    <UserProvider api_call={api_call}>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    </UserProvider>
  </ThemeProvider>
);

export default App;