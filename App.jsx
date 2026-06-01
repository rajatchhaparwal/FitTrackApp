import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { subscribeToAuthState } from './src/services/phoneAuth';
import {
  resolveOnboardingStatus,
  setLocalOnboardingComplete,
} from './src/services/onboardingStatus';
import { getAuth } from '@react-native-firebase/auth';
import {UserProvider, userProvider} from './UserContext'

// Screens
import Home from './src/Screens/Home';
import Login from './src/Screens/Auth/Login';
import Otp from './src/Screens/Auth/Otp';
import CompleteUserProfile from './src/Screens/Auth/CompleteUserProfile';
import SplashScreen from './src/Screens/SplashScreen';
import WorkoutTracker from './src/Screens/WorkoutTracker/WorkoutTracker';
import DietTracker from './src/Screens/DietTracker/DietTracker';
import CaptureMeal from './src/Screens/DietTracker/CaptureMeal';
import TrackFood from './src/components/DietTracker/TrackFood';
import ProfilePage from './src/Screens/UserProfile/ProfilePage'
import AbsBeginnerScreen from './src/Screens/WorkoutTracker/AbsBeginnerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// call the api
import api_call from './api';

function MyTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#5a8bff',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Workout') iconName = 'timer';
          else if (route.name === 'Diet') iconName = 'food-apple';
          else if (route.name === 'Profile') iconName = 'account';
          
          return <Icons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Workout" component={WorkoutTracker} />
      <Tab.Screen name="Diet" component={DietTracker} />
      <Tab.Screen name="Profile" component={ProfilePage} /> 
    </Tab.Navigator>
  );
}

export function MyStack() {
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [hasFilledDetails, setHasFilledDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Splash minimum display timer
    const splashTimer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 2000);

    // Safeguard fallback timer in case backend or Firebase hangs completely
    const authFallbackTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Auth check timed out. Forcing ready state.');
        setAuthReady(true);
      }
    }, 6000); // Bumped to 6s to give your backend call room to complete if slow

    const unsubscribe = subscribeToAuthState((user) => {
      if (cancelled) return;

      if (!user) {
        setIsLogged(false);
        setHasFilledDetails(false);
        clearTimeout(authFallbackTimer);
        setAuthReady(true); // No user, nothing to fetch from backend, safe to proceed
        return;
      }

      // User exists, now resolve their profile status BEFORE completing the auth readiness check
      setIsLogged(true);

      (async () => { 
        try {
          const complete = await resolveOnboardingStatus(user);
          if (!cancelled) {
            setHasFilledDetails(complete);
          }
        } catch (error) {
          console.warn('Onboarding check failed:', error?.message ?? error);
          // Fallback strategy: If backend fails, decide whether to default to true or false
          if (!cancelled) setHasFilledDetails(false); 
        } finally {
          if (!cancelled) {
            clearTimeout(authFallbackTimer);
            setAuthReady(true); // ONLY set ready after backend resolves or fails
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      clearTimeout(splashTimer);
      clearTimeout(authFallbackTimer);
      unsubscribe();
    };
  }, []);

  // App holds on SplashScreen until the 2s minimal timer finishes 
  // AND the Firebase/Backend bundle resolves its data.
  if (isLoading || !authReady) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLogged ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Otp" component={Otp} />
        </>
      ) : !hasFilledDetails ? (
        <>
          <Stack.Screen name="CompleteUserProfile">
            {props => (
              <CompleteUserProfile 
                {...props} 
                onOnboardingComplete={async () => {
                  const user = getAuth().currentUser;
                  if (user) await setLocalOnboardingComplete(user.uid, true);
                  setHasFilledDetails(true);
                }}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="MyTab" component={MyTab} />
          <Stack.Screen name="DietDetails" component={DietTracker} /> 
          <Stack.Screen name="CaptureMeal" component={CaptureMeal} />
          <Stack.Screen name="TrackFood" component={TrackFood} />
          <Stack.Screen name="AbsBeginnerScreen" component={AbsBeginnerScreen}/>
          <Stack.Screen name="WorkoutTracker" component={WorkoutTracker}/>
        </>
      )}
    </Stack.Navigator>
  );
}

const App = () => {
  return (
    <UserProvider api_call={api_call}>
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
    </UserProvider>
  );
}

export default App;