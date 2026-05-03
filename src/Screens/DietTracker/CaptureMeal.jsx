import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Dimensions, 
  ActivityIndicator, Alert, Platform, PermissionsAndroid 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const CaptureMeal = ({ navigation, route }) => {
  const mealType = route?.params?.mealtype || "Meal";
  const [loading, setLoading] = useState(false);
  const handleCameraLaunch = async () => {
   
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "FitTrack Camera Permission",
            message: "We need camera access to analyze your meal.",
            buttonPositive: "OK",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Go to settings to enable camera.");
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    // Launch Camera after permission 
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    };

    const result = await launchCamera(options);

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage);
      return;
    }

    if (result.assets && result.assets.length > 0) {
      processImageWithAI(result.assets[0]);
    }
  };

  //  AI Processing Logic 
  const processImageWithAI = async (image) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('mealImage', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'meal.jpg',
      });
      formData.append('mealSlot', mealType.toLowerCase());

      //  Server IP
      const response = await fetch('http://10.145.6.81:5000/CapturedImage', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();

      if (response.ok) {
        // AI data
        navigation.navigate('DietDetails', { aiData: data.data });
      } else {
        throw new Error(data.message || "Failed to analyze");
      }
    } catch (error) {
      Alert.alert("AI Error", "Could not identify food. Try manual search.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back-ios" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track {mealType}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Camera Preview Secti*/}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            {loading ? (
               <>
                <ActivityIndicator size="large" color="#0087FF" />
                <Text style={[styles.cameraText, {color: '#0087FF'}]}>AI is analyzing your plate...</Text>
               </>
            ) : (
              <>
                <Icon name="photo-camera" size={50} color="#ccc" />
                <Text style={styles.cameraText}>Align your food in the frame</Text>
              </>
            )}
            
            {/* Shutter Button */}
            {!loading && (
              <TouchableOpacity 
                style={styles.shutterButton} 
                onPress={handleCameraLaunch}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Manual Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Or search manually</Text>
          <View style={styles.suggestionBox}>
             <Text style={styles.suggestionText}>Type a food name to see nutrition facts</Text>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
  container: { flex: 1, paddingHorizontal: 20 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  // Camera Section
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraPlaceholder: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    position: 'relative',
  },
  cameraText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  shutterButton: {
    position: 'absolute',
    bottom: -50,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#0087FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0087FF',
  },

  // Manual Search Section
  searchSection: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  suggestionBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});


export default CaptureMeal;