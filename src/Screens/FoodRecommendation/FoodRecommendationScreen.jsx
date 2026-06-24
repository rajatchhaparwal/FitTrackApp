import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';
import { useUser } from '../../../UserContext';

// ── Tag pill ──────────────────────────────────────────────────────────────────
const Tag = ({ label }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);



// ── Plan Recommendation Card (navigates to detail for quantity) ──────────────
const FoodRecCard = ({ food, mealKey, navigation }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.foodCard}
    onPress={() => navigation.navigate('FoodDetail', { food, defaultMealType: mealKey || 'breakfast' })}
  >
    <View style={styles.foodIconBadge}>
      <Icon name="food-variant" size={26} color="#0066EE" />
    </View>
    <View style={styles.foodInfo}>
      <Text style={styles.foodName} numberOfLines={2}>{food.name}</Text>
      <Text style={styles.foodServing} numberOfLines={1}>{food.servingSize || 'Per 100g'}</Text>
      <View style={styles.foodMacrosRow}>
        <Text style={styles.foodMacro}>P: {food.protein}g</Text>
        <Text style={styles.foodMacro}>C: {food.carbs}g</Text>
        <Text style={styles.foodMacro}>F: {food.fat}g</Text>
      </View>
    </View>
    <View style={styles.foodRight}>
      <Text style={styles.foodCal}>{food.calories}</Text>
      <Text style={styles.foodCalLabel}>kcal</Text>
      <View style={styles.addBtn}>
        <Icon name="chevron-right" size={18} color="#fff" />
      </View>
    </View>
  </TouchableOpacity>
);

// ── Browse / Search Card (chevron navigates to detail) ──────────────────────
const SearchFoodCard = ({ food, navigation }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.foodCard}
    onPress={() => navigation.navigate('FoodDetail', { food, defaultMealType: 'breakfast' })}
  >
    <View style={styles.foodIconBadge}>
      <Icon name="food-fork-drink" size={26} color="#5A8BFF" />
    </View>
    <View style={styles.foodInfo}>
      <Text style={styles.foodName} numberOfLines={2}>{food.name}</Text>
      {food.brand ? <Text style={[styles.foodServing, { color: '#94A3B8' }]}>{food.brand}</Text> : null}
      <Text style={styles.foodServing} numberOfLines={1}>{food.servingSize || 'Per 100g'}</Text>
      <View style={styles.foodMacrosRow}>
        <Text style={styles.foodMacro}>P: {food.protein}g</Text>
        <Text style={styles.foodMacro}>C: {food.carbs}g</Text>
        <Text style={styles.foodMacro}>F: {food.fat}g</Text>
      </View>
    </View>
    <View style={styles.foodRight}>
      <Text style={styles.foodCal}>{food.calories}</Text>
      <Text style={styles.foodCalLabel}>kcal</Text>
      <View style={[styles.addBtn, { backgroundColor: '#5A8BFF' }]}>
        <Icon name="chevron-right" size={18} color="#fff" />
      </View>
    </View>
  </TouchableOpacity>
);

// ── Meal Section ───────────────────────────────────────────────────
const MealSection = ({ title, iconName, mealKey, foods, navigation }) => (
  <View style={styles.mealSection}>
    <View style={styles.mealSectionHeader}>
      <Icon name={iconName} size={20} color="#0066EE" style={{ marginRight: 6 }} />
      <Text style={styles.mealSectionTitle}>{title}</Text>
      <View style={styles.mealSectionLine} />
    </View>
    {foods.map(food => (
      <FoodRecCard key={food.id} food={food} mealKey={mealKey} navigation={navigation} />
    ))}
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const FoodRecommendationScreen = ({ navigation }) => {
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'browse'
  const [selectedMeal, setSelectedMeal] = useState('all');

  const MEAL_TABS = [
    { key: 'all', label: 'All', iconName: 'food-fork-drink' },
    { key: 'breakfast', label: 'Breakfast', iconName: 'weather-sunset' },
    { key: 'lunch', label: 'Lunch', iconName: 'weather-sunny' },
    { key: 'dinner', label: 'Dinner', iconName: 'weather-night' },
    { key: 'snacks', label: 'Snacks', iconName: 'food-apple' },
  ];

  const [mealPlan, setMealPlan] = useState(null);
  const [browseFoods, setBrowseFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let isActive = true;
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const user = auth().currentUser;
        if (!user) return;

        const headers = { 'firebase-uid': user.uid };
        const planRes = await fetch(`${api_call}/food-recommendation/plan`, { headers });
        const planData = await planRes.json();
        
        if (isActive && planData.success) {
          setMealPlan(planData.data);
        }
      } catch (e) {
        console.error("Error fetching food plan:", e);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchPlan();
    return () => { isActive = false; };
  }, []); // Only fetch plan on mount

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await fetch(`${api_call}/food/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results) {
        setBrowseFoods(data.results);
      } else {
        setBrowseFoods([]);
      }
    } catch (e) {
      console.error("Error searching foods:", e);
      Alert.alert('Error', 'Could not search foods.');
    } finally {
      setSearching(false);
    }
  };

  const goal      = userData?.goal || 'General Fitness';
  const calGoal   = userData?.personalPlan?.dailyCalories || 2000;
  const protGoal  = userData?.personalPlan?.proteinGrams || 75;
  const carbGoal  = userData?.personalPlan?.carbGrams || 275;
  const fatGoal   = userData?.personalPlan?.fatGrams || 61;

  const handleAdd = async (food) => {
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
          mealType: food.meal || 'snacks',
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
          'Added!',
          `${food.name} (${Math.round(food.calories)} kcal) added to your log`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(resData.message || 'Failed to save food');
      }
    } catch (err) {
      console.error('Error logging food recommendation:', err);
      Alert.alert('Error', 'Could not add recommended food to your daily log.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Food Recommendations</Text>
          <Text style={styles.headerSub}>Goal: {goal}</Text>
        </View>
        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => navigation.navigate('FoodSearch', { mealType: 'Meal' })}
        >
          <Icon name="magnify" size={22} color="#0066EE" />
        </TouchableOpacity>
      </View>

      {/* ── Tab Switch ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plan' && styles.tabActive]}
          onPress={() => setActiveTab('plan')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="calendar-month-outline" size={18} color={activeTab === 'plan' ? '#0066EE' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>
              Meal Plan
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.tabActive]}
          onPress={() => setActiveTab('browse')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="magnify" size={18} color={activeTab === 'browse' ? '#0066EE' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}>
              Browse Foods
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0066EE" />
          </View>
        ) : activeTab === 'plan' && mealPlan ? (
          <>
            {/* ── Meal Sections ── */}
            <MealSection title="Breakfast" iconName="weather-sunset" mealKey="breakfast" foods={mealPlan.breakfast || []} navigation={navigation} />
            <MealSection title="Lunch"     iconName="weather-sunny"  mealKey="lunch"     foods={mealPlan.lunch || []}      navigation={navigation} />
            <MealSection title="Dinner"    iconName="weather-night"  mealKey="dinner"    foods={mealPlan.dinner || []}     navigation={navigation} />
            <MealSection title="Snacks"    iconName="food-apple"     mealKey="snacks"    foods={mealPlan.snacks || []}     navigation={navigation} />
          </>
        ) : (
          <>
            {/* ── Search Bar ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 15 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}>
                <Icon name="magnify" size={20} color="#94A3B8" />
                <TextInput
                  style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' }}
                  placeholder="Search FatSecret database..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity onPress={handleSearch} style={{ marginLeft: 10, backgroundColor: '#0066EE', paddingHorizontal: 20, height: 48, borderRadius: 12, justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* ── Food List ── */}
            {searching ? (
              <View style={{ marginTop: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0066EE" />
              </View>
            ) : (
              <View style={styles.browseList}>
                {browseFoods.length === 0 && searchQuery ? (
                   <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>No results found</Text>
                ) : browseFoods.length === 0 ? (
                   <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>Search to find new foods</Text>
                ) : (
                  browseFoods.map(food => (
                    <SearchFoodCard key={food.id} food={food} navigation={navigation} />
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 6, marginRight: 10 },
  headerTextCol: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#0F172A' },
  headerSub:   { fontSize: 12, fontFamily: 'Montserrat-Medium', color: '#64748B', marginTop: 1 },
  searchIconBtn: { padding: 8 },

  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 20, paddingBottom: 12,
    gap: 10,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F8FAFC', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  tabActive: { backgroundColor: '#F0F4FF', borderColor: '#D0E0FF' },
  tabText:   { fontSize: 13, color: '#64748B', fontWeight: '600' },
  tabTextActive: { color: '#0066EE', fontWeight: '700' },

  scrollContent: { paddingBottom: 40 },

  // Totals card
  totalsCard: {
    margin: 20, borderRadius: 24, backgroundColor: '#fff', padding: 20,
    shadowColor: '#0066EE', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  totalsTitle:  { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#0F172A', marginBottom: 12 },
  totalsCalRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16, gap: 4 },
  totalsCal:    { fontSize: 30, fontWeight: '800', color: '#0F172A' },
  totalsGoal:   { fontSize: 16, color: '#64748B', fontWeight: '500' },
  macrosBarsWrap: { gap: 12 },
  macroItem:    { gap: 6 },
  macroLabelRow:{ flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel:   { fontSize: 12, color: '#64748B', fontWeight: '600' },
  macroValue:   { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  macroTrack: {
    height: 6, borderRadius: 3, backgroundColor: '#E2E8F0',
  },
  macroFill: { height: 6, borderRadius: 3 },

  // Meal section
  mealSection: { marginBottom: 12 },
  mealSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, gap: 8,
  },
  mealSectionTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#0F172A' },
  mealSectionLine:  { flex: 1, height: 1, backgroundColor: '#F1F5F9' },

  // Food card
  foodCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12,
    borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0066EE', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  foodIconBadge: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center',
  },
  foodInfo:     { flex: 1, paddingHorizontal: 12, gap: 4 },
  foodName:     { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  foodServing:  { fontSize: 11, color: '#64748B' },
  foodTagsRow:  { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginVertical: 2 },
  tag: { backgroundColor: '#F0F4FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#0066EE', fontWeight: '600' },
  foodMacrosRow: { flexDirection: 'row', gap: 10 },
  foodMacro:    { fontSize: 11, color: '#64748B', fontWeight: '500' },
  foodRight:    { alignItems: 'center', gap: 4 },
  foodCal:      { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  foodCalLabel: { fontSize: 10, color: '#64748B' },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#0066EE', justifyContent: 'center', alignItems: 'center',
  },

  // Browse tab
  mealTabsWrap: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  mealTab: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 14, backgroundColor: '#F8FAFC', gap: 3,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  mealTabActive: { backgroundColor: '#F0F4FF', borderColor: '#D0E0FF' },
  mealTabText:      { fontSize: 12, color: '#64748B', fontWeight: '600' },
  mealTabTextActive: { color: '#0066EE', fontWeight: '700' },
  browseList: { gap: 0 },
});

export default FoodRecommendationScreen;
