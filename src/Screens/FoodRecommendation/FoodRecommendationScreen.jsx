import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';
import { useUser } from '../../../UserContext';
import { getFoodRecommendations, getMealPlan } from '../../services/foodRecommendation';

// ── Tag pill ──────────────────────────────────────────────────────────────────
const Tag = ({ label }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

// ── Macro Bar ─────────────────────────────────────────────────────────────────
const MacroBar = ({ label, value, goal, color }) => {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}g</Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

// ── Food Recommendation Card ───────────────────────────────────────────────────
const FoodRecCard = ({ food, onAdd }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.foodCard}>
    <Image source={{ uri: food.imageUri }} style={styles.foodImage} />
    <View style={styles.foodInfo}>
      <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
      <Text style={styles.foodServing}>{food.servingSize}</Text>
      <View style={styles.foodTagsRow}>
        {food.tags.slice(0, 2).map(t => <Tag key={t} label={t} />)}
      </View>
      <View style={styles.foodMacrosRow}>
        <Text style={styles.foodMacro}>P: {food.protein}g</Text>
        <Text style={styles.foodMacro}>C: {food.carbs}g</Text>
        <Text style={styles.foodMacro}>F: {food.fat}g</Text>
      </View>
    </View>
    <View style={styles.foodRight}>
      <Text style={styles.foodCal}>{food.calories}</Text>
      <Text style={styles.foodCalLabel}>kcal</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(food)}>
        <Icon name="plus" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ── Meal Section ──────────────────────────────────────────────────────────────
const MealSection = ({ title, iconName, foods, onAdd }) => (
  <View style={styles.mealSection}>
    <View style={styles.mealSectionHeader}>
      <Icon name={iconName} size={20} color="#0066EE" style={{ marginRight: 6 }} />
      <Text style={styles.mealSectionTitle}>{title}</Text>
      <View style={styles.mealSectionLine} />
    </View>
    {foods.map(food => (
      <FoodRecCard key={food.id} food={food} onAdd={onAdd} />
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

  const mealPlan = useMemo(() => getMealPlan(userData || {}), [userData]);

  const browseFoods = useMemo(
    () => getFoodRecommendations(userData || {}, selectedMeal),
    [userData, selectedMeal]
  );

  const goal      = userData?.goal || 'General Fitness';
  const calGoal   = parseInt(userData?.calorie_goal || 2000, 10);
  const protGoal  = Math.round(calGoal * 0.3 / 4);
  const carbGoal  = Math.round(calGoal * 0.4 / 4);
  const fatGoal   = Math.round(calGoal * 0.3 / 9);

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
          '✅ Added!',
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

        {activeTab === 'plan' ? (
          <>
            {/* ── Daily Totals Card ── */}
            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Today's Plan</Text>
              <View style={styles.totalsCalRow}>
                <Icon name="fire" size={22} color="#0066EE" />
                <Text style={styles.totalsCal}>{mealPlan.totals.calories}</Text>
                <Text style={styles.totalsGoal}> / {calGoal} kcal</Text>
              </View>
              <View style={styles.macrosBarsWrap}>
                <MacroBar label="Protein" value={mealPlan.totals.protein} goal={protGoal} color="#0066EE" />
                <MacroBar label="Carbs"   value={mealPlan.totals.carbs}   goal={carbGoal} color="#5A8BFF" />
                <MacroBar label="Fat"     value={mealPlan.totals.fat}     goal={fatGoal}  color="#29B6F6" />
              </View>
            </View>

            {/* ── Meal Sections ── */}
            <MealSection title="Breakfast" iconName="weather-sunset" foods={mealPlan.breakfast} onAdd={handleAdd} />
            <MealSection title="Lunch"     iconName="weather-sunny" foods={mealPlan.lunch}     onAdd={handleAdd} />
            <MealSection title="Dinner"    iconName="weather-night" foods={mealPlan.dinner}    onAdd={handleAdd} />
            <MealSection title="Snacks"    iconName="food-apple" foods={mealPlan.snacks}    onAdd={handleAdd} />
          </>
        ) : (
          <>
            {/* ── Meal filter tabs ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mealTabsWrap}>
              {MEAL_TABS.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.mealTab, selectedMeal === tab.key && styles.mealTabActive]}
                  onPress={() => setSelectedMeal(tab.key)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={tab.iconName}
                    size={16}
                    color={selectedMeal === tab.key ? '#0066EE' : '#64748B'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.mealTabText, selectedMeal === tab.key && styles.mealTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Food List ── */}
            <View style={styles.browseList}>
              {browseFoods.map(food => (
                <FoodRecCard key={food.id} food={food} onAdd={handleAdd} />
              ))}
            </View>
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
    borderRadius: 20, overflow: 'hidden', padding: 14,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0066EE', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
  },
  foodImage:    { width: 70, height: 70, borderRadius: 12 },
  foodInfo:     { flex: 1, paddingHorizontal: 12, gap: 3 },
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
