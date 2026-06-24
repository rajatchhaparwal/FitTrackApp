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
import ProfilePage from './src/Screens/UserProfile/ProfilePage';
import NotificationsScreen from './src/Screens/UserProfile/NotificationsScreen';

// ── Diet Screens ───────────────────────────────────────────────────────────────
import CaptureMeal from './src/Screens/DietTracker/CaptureMeal';
import TrackFood from './src/components/DietTracker/TrackFood';

// ── Workout Screens ────────────────────────────────────────────────────────────
import AbsBeginnerScreen from './src/Screens/WorkoutTracker/AbsBeginnerScreen';
import SpecificWorkoutPage from './src/Screens/WorkoutTracker/SpecificWorkoutPage';
import LivePoseDetectionScreen from './src/Screens/WorkoutTracker/LivePoseDetectionScreen';

// ── Activity Screens ───────────────────────────────────────────────────────────
import DrinkWaterScreen from './src/Screens/Actitvities/DrinkWaterScreen';
import StepsScreen from './src/Screens/Actitvities/StepsScreen';
import Activities from './src/components/ActivityTracker/Activities';

// ── NEW: Recommendation & Search Screens ──────────────────────────────────────
import FoodSearchScreen from './src/Screens/FoodSearch/FoodSearchScreen';
import ExerciseRecommendationScreen from './src/Screens/ExerciseRecommendation/ExerciseRecommendationScreen';
import FoodRecommendationScreen from './src/Screens/FoodRecommendation/FoodRecommendationScreen';
import FoodDetailScreen        from './src/Screens/FoodRecommendation/FoodDetailScreen';

// ── API Base URL ───────────────────────────────────────────────────────────────
import api_call from './api';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Bottom Tab Navigator ───────────────────────────────────────────────────────
function MyTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0066EE',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home:    'home',
            Workout: 'timer',
            Diet:    'food-apple',
            Profile: 'account',
          };
          return <Icons name={iconMap[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={Home} />
      <Tab.Screen name="Workout" component={WorkoutTracker} />
      <Tab.Screen name="Diet"    component={DietTracker} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}

// ── Root Stack Navigator ───────────────────────────────────────────────────────
export function MyStack() {
  const { needsOnboarding, setNeedsOnboarding, loading: profileLoading, refreshData } = useUser();
  const [isLoading,  setIsLoading]  = useState(true);
  const [authReady,  setAuthReady]  = useState(false);
  const [isLogged,   setIsLogged]   = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Minimum splash display time
    const splashTimer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 2000);

    // Auth timeout fallback (6 s)
    const authFallbackTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Auth check timed out. Forcing ready state.');
        setAuthReady(true);
      }
    }, 6000);

    const unsubscribe = subscribeToAuthState((user) => {
      if (cancelled) return;
      setIsLogged(Boolean(user));
      clearTimeout(authFallbackTimer);
      setAuthReady(true);
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
          <Stack.Screen name="Otp"   component={Otp} />
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
          <Stack.Screen name="DietDetails"         component={DietTracker} />
          <Stack.Screen name="CaptureMeal"          component={CaptureMeal} />
          <Stack.Screen name="TrackFood"            component={TrackFood} />

          {/* ── Workout Screens ── */}
          <Stack.Screen name="AbsBeginnerScreen"    component={AbsBeginnerScreen} />
          <Stack.Screen name="SpecificWorkoutPage"  component={SpecificWorkoutPage} />
          <Stack.Screen name="LivePoseDetection"    component={LivePoseDetectionScreen} />
          <Stack.Screen name="WorkoutTracker"       component={WorkoutTracker} />

          {/* ── Activity Screens ── */}
          <Stack.Screen name="DrinkWaterScreen"     component={DrinkWaterScreen} />
          <Stack.Screen name="Activities"           component={Activities} />
          <Stack.Screen name="Steps"                component={StepsScreen} />

          {/* ── NEW: Recommendation & Search Screens ── */}
          <Stack.Screen name="FoodSearch"            component={FoodSearchScreen} />
          <Stack.Screen name="ExerciseRecommendation" component={ExerciseRecommendationScreen} />
          <Stack.Screen name="FoodRecommendation"    component={FoodRecommendationScreen} />
          <Stack.Screen name="FoodDetail"             component={FoodDetailScreen} />
          <Stack.Screen name="Notifications"         component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────
const App = () => (
  <UserProvider api_call={api_call}>
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  </UserProvider>
);

export default App;