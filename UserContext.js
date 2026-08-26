// UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getAuth } from '@react-native-firebase/auth';
import {
  clearLocalOnboardingComplete,
  getLocalOnboardingComplete,
  parseOnboardingCompleteFromApi,
  setLocalOnboardingComplete,
} from './src/services/onboardingStatus';
import { subscribeToAuthState } from './src/services/phoneAuth';

const UserContext = createContext();

export const UserProvider = ({ children, api_call }) => {
  const [userData, setUserData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchAllUserData = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      setUserData(null);
      setNeedsOnboarding(false);
      setLoading(false);
      return;
    }

    const uid = currentUser.uid;

    // Check local cache first so UI can transition immediately
    try {
      const cachedComplete = await getLocalOnboardingComplete(uid);
      setNeedsOnboarding(!cachedComplete);
    } catch {}

    try {
      try {
        const userResponse = await axios.get(`${api_call}/Home`, {
          headers: { 'firebase-uid': uid },
          timeout: 3000,
        });

        if (userResponse.data.user) {
          const profileComplete = parseOnboardingCompleteFromApi(userResponse.data);
          setUserData(userResponse.data.user);
          setNeedsOnboarding(!profileComplete);

          if (profileComplete) {
            await setLocalOnboardingComplete(uid, true);
          } else {
            await clearLocalOnboardingComplete(uid);
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          await clearLocalOnboardingComplete(uid);
          setUserData(null);
          setNeedsOnboarding(true);
        } else {
          console.warn('Profile API response slow or offline:', error.message);
        }
      }
    } catch (globalErr) {
      console.error('Global hook error:', globalErr);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedFields) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) return { success: false, error: "No user logged in" };

      const uid = currentUser.uid;

      const response = await axios.post(`${api_call}/UpdateProfile`, updatedFields, {
        headers: { 'firebase-uid': uid }
      });

      if (response.data.success) {
        setUserData(response.data.user); 
        return { success: true };
      }
    } catch (error) {
      console.error("Error updating profile data:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  };

  // 🛠️ FIX: Listen for auth updates using native onAuthStateChanged
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        fetchAllUserData(); 
      } else {
        setUserData(null);
        setNeedsOnboarding(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{
      userData,
      setUserData,
      recommendations,
      loading,
      needsOnboarding,
      setNeedsOnboarding,
      refreshData: fetchAllUserData,
      updateUserProfile,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);