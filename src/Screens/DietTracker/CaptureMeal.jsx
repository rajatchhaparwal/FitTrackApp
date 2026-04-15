import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions,} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/MaterialIcons';
// Import your existing SearchBar
import { SearchBar } from "../../components/SearchNotification&otherIconsLogic/SearchBar";

const { width } = Dimensions.get('window');

const CaptureMeal = ({ navigation, route }) => {
  const mealType = route?.params?.mealtype || "Meal";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* 1. Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back-ios" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track {mealType}</Text>
          <View style={{ width: 40 }} /> {/* Spacer to keep title centered */}
        </View>

        {/* 2. Camera Preview Section */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <Icon name="photo-camera" size={50} color="#ccc" />
            <Text style={styles.cameraText}>Align your food in the frame</Text>
          </View>
          
          {/* Overlay Button for Shutter */}
          <TouchableOpacity style={styles.shutterButton}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>

        {/* 3. Manual Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Or search manually</Text>
       
          
          {/* Recent/Suggested Items Placeholder */}
          <View style={styles.suggestionBox}>
             <Text style={styles.suggestionText}>Type a food name to see nutrition facts</Text>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  backButton: { padding: 10 },

  // Camera Section
  cameraContainer: {
    height: width * 1.1, // Aspect ratio for camera
    backgroundColor: '#000',
    marginHorizontal: 15,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraPlaceholder: { alignItems: 'center' },
  cameraText: { color: '#888', marginTop: 10, fontSize: 14 },
  
  // Shutter Button UI
  shutterButton: {
    position: 'absolute',
    bottom: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },

  // Search Section
  searchSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333'
  },
  suggestionBox: {
    marginTop: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 15,
    borderStyle: 'dashed',
    alignItems: 'center'
  },
  suggestionText: { color: '#aaa', fontSize: 13 }
});

export default CaptureMeal;