import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  ActivityIndicator, Alert, Platform, PermissionsAndroid,
  TextInput, FlatList, Keyboard,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';
import { searchFood } from '../../services/fatsecretApi';

const { width } = Dimensions.get('window');

const normalizeMealType = (raw = '') =>
  raw.trim().toLowerCase().replace(/\s+/g, '_');

// ── Macro Pill ────────────────────────────────────────────────────────────────
const MacroPill = ({ label, value, color }) => (
  <View style={[styles.macroPill, { backgroundColor: color + '22' }]}>
    <Text style={[styles.macroPillTxt, { color }]}>{label} {value}g</Text>
  </View>
);

// ── Food Result Row ───────────────────────────────────────────────────────────
const FoodResultRow = ({ item, onAdd }) => (
  <TouchableOpacity style={styles.foodRow} onPress={() => onAdd(item)} activeOpacity={0.8}>
    <View style={styles.foodRowLeft}>
      <Text style={styles.foodRowEmoji}>{item.type === 'Brand' ? '🏪' : '🥗'}</Text>
    </View>
    <View style={styles.foodRowMid}>
      <Text style={styles.foodRowName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.foodRowMacros}>
        <MacroPill label="P" value={item.protein.toFixed(0)} color="#3498DB" />
        <MacroPill label="C" value={item.carbs.toFixed(0)}   color="#E67E22" />
        <MacroPill label="F" value={item.fat.toFixed(0)}     color="#E74C3C" />
      </View>
    </View>
    <View style={styles.foodRowRight}>
      <Text style={styles.foodRowCal}>{Math.round(item.calories)}</Text>
      <Text style={styles.foodRowCalLbl}>kcal</Text>
    </View>
  </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const CaptureMeal = ({ navigation, route }) => {
  const mealType     = route?.params?.mealtype || "Meal";
  const [camLoading, setCamLoading] = useState(false);

  // search state
  const [query,      setQuery]     = useState('');
  const [foodResults,setResults]   = useState([]);
  const [searching,  setSearching] = useState(false);
  const [searched,   setSearched]  = useState(false);
  const debounceRef = useRef(null);

  // ── Camera ──────────────────────────────────────────────────────────────────
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

    const result = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
    if (result.didCancel) return;
    if (result.errorCode) { Alert.alert('Error', result.errorMessage); return; }
    if (result.assets?.length > 0) processImageWithAI(result.assets[0]);
  };

  const processImageWithAI = async (image) => {
    setCamLoading(true);
    try {
      const firebaseUid = auth().currentUser?.uid;
      if (!firebaseUid) {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.replace('Login');
        return;
      }

      const normalizedMealType = normalizeMealType(mealType);
      const formData = new FormData();
      formData.append('mealImage', { uri: image.uri, type: image.type || 'image/jpeg', name: image.fileName || 'meal.jpg' });
      formData.append('mealType', normalizedMealType);

      const response = await fetch(`${api_call}/CapturedImage`, {
        method: 'POST', body: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'firebase-uid': firebaseUid },
      });
      const data = await response.json();

      if (response.ok) {
        navigation.navigate('DietDetails', { aiData: data.data });
      } else {
        throw new Error(data.message || data.error || "Failed to analyze");
      }
    } catch (error) {
      Alert.alert("AI Error", "Could not identify food. Try manual search below.");
      console.log(error);
    } finally {
      setCamLoading(false);
    }
  };

  // ── Food Search ──────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearched(true);
      try {
        const foods = await searchFood(text.trim(), 10);
        setResults(foods);
      } catch {
        Alert.alert('Search Error', 'Could not reach FatSecret. Check internet.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, []);

  const handleFoodAdd = async (food) => {
    Keyboard.dismiss();
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Session Expired', 'Please log in again.');
        return;
      }

      const response = await fetch(`${api_call}/DietLog/food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'firebase-uid': user.uid,
        },
        body: JSON.stringify({
          mealType: mealType,
          food: {
            name: food.name,
            quantity: 100,
            unit: 'grams',
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            source: 'search'
          }
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        Alert.alert(
          '✅ Added!',
          `${food.name} (${Math.round(food.calories)} kcal) added to ${mealType}`,
          [{ text: 'Log Another', style: 'default' }, { text: 'Done', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(resData.message || 'Failed to save food');
      }
    } catch (err) {
      console.error('Error logging food:', err);
      Alert.alert('Error', 'Could not add food to your daily log. Please try again.');
    }
  };

  const openFullSearch = () => {
    navigation.navigate('FoodSearch', { mealType });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track {mealType}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Camera Section ── */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            {camLoading ? (
              <>
                <ActivityIndicator size="large" color="#0087FF" />
                <Text style={[styles.cameraText, { color: '#0087FF' }]}>AI is analyzing your plate...</Text>
              </>
            ) : (
              <>
                <Icon name="camera" size={50} color="#ccc" />
                <Text style={styles.cameraText}>Align your food in the frame</Text>
              </>
            )}
            {!camLoading && (
              <TouchableOpacity style={styles.shutterButton} onPress={handleCameraLaunch}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Manual Search Section ── */}
        <View style={styles.searchSection}>
          <View style={styles.searchHeader}>
            <Text style={styles.sectionTitle}>Or search manually</Text>
            <TouchableOpacity onPress={openFullSearch}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color="#5A8BFF" />
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. chicken breast, banana..."
              placeholderTextColor="#AAA"
              value={query}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
            {searching ? (
              <ActivityIndicator size="small" color="#5A8BFF" />
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                <Icon name="close-circle" size={18} color="#CCC" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Results */}
          {foodResults.length > 0 ? (
            <FlatList
              data={foodResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <FoodResultRow item={item} onAdd={handleFoodAdd} />}
              style={styles.resultsList}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : searched && !searching ? (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>No results for "{query}"</Text>
            </View>
          ) : !query && (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>Search powered by FatSecret 🥗</Text>
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
  container: { flex: 1, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#000' },

  cameraContainer: { height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  cameraPlaceholder: {
    width: width * 0.8, height: 180, borderRadius: 20,
    backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#ddd', position: 'relative',
  },
  cameraText: { marginTop: 10, fontSize: 13, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  shutterButton: {
    position: 'absolute', bottom: -28, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#fff', borderWidth: 4, borderColor: '#0087FF',
    justifyContent: 'center', alignItems: 'center',
  },
  shutterInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0087FF' },

  searchSection: { flex: 1 },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  seeAllText:   { fontSize: 13, color: '#5A8BFF', fontWeight: '600' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    shadowColor: '#5A8BFF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
    marginBottom: 10, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#222' },

  resultsList: { maxHeight: 220 },
  foodRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
  },
  foodRowLeft:  { marginRight: 10 },
  foodRowEmoji: { fontSize: 24 },
  foodRowMid:   { flex: 1, gap: 4 },
  foodRowName:  { fontSize: 14, fontWeight: '600', color: '#111' },
  foodRowMacros:{ flexDirection: 'row', gap: 6 },
  macroPill:    { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  macroPillTxt: { fontSize: 10, fontWeight: '600' },
  foodRowRight: { alignItems: 'center' },
  foodRowCal:   { fontSize: 16, fontWeight: '800', color: '#111' },
  foodRowCalLbl:{ fontSize: 9, color: '#999' },
  separator: { height: 6 },

  emptySearch: { paddingVertical: 16, alignItems: 'center' },
  emptySearchText: { color: '#AAA', fontSize: 13 },
});

export default CaptureMeal;