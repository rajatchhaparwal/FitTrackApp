// UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 🛠️ FIX: Use your native React Native Firebase auth package instead of the web SDK
import getAuth from '@react-native-firebase/auth'; 

const UserContext = createContext();

export const UserProvider = ({ children, api_call }) => {
  const [userData, setUserData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllUserData = async () => {
    try {
      setLoading(true);
      
      // 🛠️ FIX: Access the current user using native syntax
      const currentUser = getAuth().currentUser; 
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const uid = currentUser.uid;

      // Fetch User Profile
      try {
        const userResponse = await axios.get(`${api_call}/Home`, { headers: { 'firebase-uid': uid } });
        if (userResponse.data.user) setUserData(userResponse.data.user);
      } catch (err) {
        console.error("Profile API error:", err.message);
      }
    
    
    } catch (globalErr) {
      console.error("Global hook error:", globalErr);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedFields) => {
    try {
      const currentUser = auth().currentUser; 
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
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user) {
        fetchAllUserData(); 
      } else {
        setUserData(null);
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
      refreshData: fetchAllUserData,
      updateUserProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);