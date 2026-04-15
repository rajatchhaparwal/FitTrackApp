import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import Home from './src/Screens/Home';
import Login from './src/Screens/Auth/Login';
import Otp from './src/Screens/Auth/Otp';
import CompleteUserProfile from './src/Screens/Auth/CompleteUserProfile';
import SplashScreen from './src/Screens/SplashScreen';
import WorkoutTracker from './src/Screens/WorkoutTracker/WorkoutTracker';
import DietTracker from './src/Screens/DietTracker/DietTracker';
import CaptureMeal from './src/Screens/DietTracker/CaptureMeal'
import TrackFood from './src/components/DietTracker/TrackFood';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. Bottom Tab Navigator
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
      <Tab.Screen name="Profile" component={CompleteUserProfile} />
    </Tab.Navigator>
  );
}


export function MyStack() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLogged ? (
        // Auth
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Otp">
            {(props) => <Otp {...props} setIsLogged={setIsLogged} />}
          </Stack.Screen>
        </>
      ) : (

        <>
          <Stack.Screen name="MainTabs" component={MyTab} />
          <Stack.Screen name="DietDetails" component={DietTracker} /> 
          <Stack.Screen name = "CaptureMeal" component={CaptureMeal}/>
          <Stack.Screen name="CompleteUserProfile" component={CompleteUserProfile} />
        </>
      )}
    </Stack.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}

export default App;