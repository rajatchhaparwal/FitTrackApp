import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useUser } from '../../../UserContext';
import api_call from '../../../api';
const SLIDER_ITEMS = [
  { id: '1', name: "Diet Plan",       iconName: "file-document-outline", screen: 'FoodRecommendation' },
  { id: '2', name: "Insights",        iconName: "chart-bar",     screen: null },
  { id: '3', name: "Recipes",         iconName: "silverware-fork-knife",    screen: null },
  { id: '4', name: "Snap Gallery",    iconName: "image-multiple-outline", screen: null },
  { id: '5', name: "Meals",           iconName: "bookmark-outline",      screen: null },
];

// ── Circular progress (simplified with border approach) ─────────────────────
const CalorieRing = ({ consumed, goal }) => {
  const pct = Math.min((consumed / Math.max(goal, 1)) * 100, 100);
  const remaining = Math.max(goal - consumed, 0);
  return (
    <View style={styles.ringContainer}>
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <Text style={styles.ringValue}>{consumed}</Text>
          <Text style={styles.ringLabel}>kcal</Text>
        </View>
      </View>
      <View style={styles.ringTexts}>
        <Text style={styles.ringGoalText}>Goal: <Text style={styles.ringGoalNum}>{goal}</Text> kcal</Text>
        <Text style={styles.ringRemText}>{remaining} kcal remaining</Text>
      </View>
    </View>
  );
};

// ── Macro Pills Row ──────────────────────────────────────────────────────────
const MacroRow = ({ protein, carbs, fat, proteinGoal, carbGoal, fatGoal }) => (
  <View style={styles.macroRow}>
    {[
      { label: 'Protein', value: protein, goal: proteinGoal, color: '#0066EE' },
      { label: 'Carbs',   value: carbs,   goal: carbGoal,    color: '#5A8BFF' },
      { label: 'Fat',     value: fat,     goal: fatGoal,     color: '#29B6F6' },
    ].map(m => (
      <View key={m.label} style={styles.macroPill}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.macroPillVal}>{m.value}</Text>
          <Text style={styles.macroPillSlash}>/{m.goal}g</Text>
        </View>
        <Text style={styles.macroPillLabel}>{m.label}</Text>
        <View style={styles.microBarBg}>
          <View style={[styles.microBarFill, { width: `${Math.min(Math.round((m.value / Math.max(m.goal, 1)) * 100), 100)}%`, backgroundColor: m.color }]} />
        </View>
      </View>
    ))}
  </View>
);

const DietTracker = ({ navigation }) => {
  const { userData } = useUser();
  const [dietLog, setDietLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pull from user profile, fall back to sensible defaults
  const calorieGoal   =  userData?.personalPlan?.dailyCalories || 2000;
  const proteinGoal   = userData?.personalPlan?.proteinGrams || 75;
  const carbGoal      = userData?.personalPlan?.carbGrams || 275;
  const fatGoal       = userData?.personalPlan?.fatGrams || 61;

  useFocusEffect( 
    useCallback(() => {
      let isActive = true;
      const fetchLog = async () => {
        try {
          const user = auth().currentUser;
          if (!user) return;
          const res = await fetch(`${api_call}/DietLog/today`, {
            headers: { 'firebase-uid': user.uid }
          });
          const data = await res.json();
          if (isActive && data.success && data.data) {
            setDietLog(data.data);
          }
        } catch (e) {
          console.error("Error fetching diet log:", e);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchLog();
      return () => { isActive = false; };
    }, [])
  );

  const handleDeleteFood = async (mealKey, index, foodName) => {
    Alert.alert(
      'Remove Food',
      `Are you sure you want to delete "${foodName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth().currentUser;
              if (!user) return;

              const res = await fetch(`${api_call}/DietLog/food`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'firebase-uid': user.uid,
                },
                body: JSON.stringify({
                  mealType: mealKey,
                  index: index,
                }),
              });
              const resData = await res.json();
              if (res.ok && resData.success) {
                setDietLog(resData.data);
              } else {
                throw new Error(resData.message || 'Failed to delete');
              }
            } catch (err) {
              console.error('Delete food error:', err);
              Alert.alert('Error', 'Could not delete food log. Please try again.');
            }
          },
        },
      ]
    );
  };

  const dailyTotals = dietLog?.dailyTotals || {};
  const caloriesConsumed = Math.round(dailyTotals.calories || 0);
  const proteinConsumed  = Math.round(dailyTotals.proteinG || 0);
  const carbConsumed     = Math.round(dailyTotals.carbsG || 0);
  const fatConsumed      = Math.round(dailyTotals.fatG || 0);

  const getMealTotal = (mealKey) => {
    if (!dietLog?.meals?.[mealKey]) return 0;
    return Math.round(dietLog.meals[mealKey].reduce((sum, item) => sum + (item.calories || 0), 0));
  };
  
  const getMealItems = (mealKey) => {
    return dietLog?.meals?.[mealKey] || [];
  };

  const MEAL_SECTIONS = [
    { title: 'Breakfast', key: 'breakfast',   total: Math.round(calorieGoal * 0.25) },
    { title: 'Snacks',    key: 'snacks',      total: Math.round(calorieGoal * 0.10) },
    { title: 'Lunch',     key: 'lunch',       total: Math.round(calorieGoal * 0.30) },
    { title: 'Dinner',    key: 'dinner',      total: Math.round(calorieGoal * 0.30) },
    { title: 'Pre Workout',key:'pre_workout', total: Math.round(calorieGoal * 0.05) },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Meal</Text>
        <TouchableOpacity>
          <Icon name="cog-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ── Calorie Ring Card ── */}
      <View style={styles.calorieCard}>
        <CalorieRing consumed={caloriesConsumed} goal={calorieGoal} />
      </View>

      {/* ── Macro Summary ── */}
      <MacroRow
        protein={proteinConsumed}
        carbs={carbConsumed}
        fat={fatConsumed}
        proteinGoal={proteinGoal}
        carbGoal={carbGoal}
        fatGoal={fatGoal}
      />

      {/* ── Quick Action Chips ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {SLIDER_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.actionCard}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <View style={styles.iconBackground}>
              <Icon name={item.iconName} size={22} color="#fff" />
            </View>
            <Text style={styles.actionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Food Recommendation Banner ── */}
      <TouchableOpacity
        style={styles.recBanner}
        onPress={() => navigation.navigate('FoodRecommendation')}
        activeOpacity={0.85}
      >
        <Icon name="silverware-fork-knife" size={24} color="#fff" />
        <View style={styles.recBannerText}>
          <Text style={styles.recBannerTitle}>Get Your Meal Plan</Text>
          <Text style={styles.recBannerSub}>Personalised to your {userData?.goal || 'goals'}</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#fff" />
      </TouchableOpacity>

      {/* ── Meal Sections ── */}
      {MEAL_SECTIONS.map((meal, idx) => {
        const consumed = getMealTotal(meal.key);
        const items = getMealItems(meal.key);
        return (
          <MealSection
            key={idx}
            navigation={navigation}
            title={meal.title}
            consumed={consumed}
            total={meal.total}
            items={items}
            hasData={items.length > 0}
            onDeleteItem={(index, foodName) => handleDeleteFood(meal.key, index, foodName)}
          />
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ── Meal Section Component ───────────────────────────────────────────────────
const MealSection = ({ title, consumed, total, items, hasData, navigation, onDeleteItem }) => {
  const pct = Math.min((consumed / Math.max(total, 1)) * 100, 100);
  return (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <View style={styles.mealRight}>
          <Text style={styles.mealCalText}>{consumed} / {total} Cal</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CaptureMeal', { mealtype: title })}>
            <Icon name="plus-circle" size={26} color="#0066EE" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      {hasData ? (
        <View>
          {items.map((item, idx) => (
            <View key={idx} style={[styles.mealItem, idx > 0 && { marginTop: 8 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.foodName} numberOfLines={1}>{item.foodName || 'Food logged'}</Text>
                <Text style={styles.foodSubText}>{item.quantity}{item.unit} · {Math.round(item.proteinG || 0)}g P</Text>
              </View>
              <Text style={styles.foodCal}>{Math.round(item.calories || 0)} Cal</Text>
              <TouchableOpacity onPress={() => onDeleteItem(idx, item.foodName || 'Food')}>
                <Icon name="dots-vertical" size={20} color="#666" style={{ padding: 4 }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.emptyMeal}
          onPress={() => navigation.navigate('FoodSearch', { mealType: title })}
        >
          <Icon name="plus-circle-outline" size={20} color="#0066EE" />
          <Text style={styles.emptyText}>
            Add {title.toLowerCase()} · Search or use camera
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 15 },

  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },

  // Calorie card
  calorieCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    elevation: 2, marginBottom: 14,
    shadowColor: '#0066EE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8,
  },
  ringContainer:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 5, borderColor: '#0066EE',
    justifyContent: 'center', alignItems: 'center',
  },
  ringInner:    { alignItems: 'center' },
  ringValue:    { fontSize: 18, fontWeight: '800', color: '#111' },
  ringLabel:    { fontSize: 10, color: '#999' },
  ringTexts:    { flex: 1 },
  ringGoalText: { fontSize: 14, color: '#666' },
  ringGoalNum:  { fontWeight: '700', color: '#111' },
  ringRemText:  { fontSize: 13, color: '#0066EE', fontWeight: '600', marginTop: 4 },

  // Macros
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 10 },
  macroPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  macroPillVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  macroPillSlash: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  macroPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  microBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  microBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Chips
  horizontalScroll: { paddingVertical: 10, gap: 12, marginBottom: 4 },
  actionCard: {
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 15, minWidth: 130, elevation: 1,
  },
  iconBackground: { backgroundColor: '#0066EE', padding: 8, borderRadius: 8, marginRight: 10 },
  actionText: { fontWeight: '600', color: '#000', fontSize: 13 },

  // Recommendation banner
  recBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0066EE', borderRadius: 16, padding: 16, marginBottom: 16,
  },
  recBannerText:  { flex: 1 },
  recBannerTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  recBannerSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

  // Meal sections
  mealContainer: { marginBottom: 16 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealTitle: { fontSize: 17, fontWeight: 'bold' },
  mealRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealCalText: { color: '#666', fontSize: 13 },

  progressTrack: { height: 4, backgroundColor: '#EEE', borderRadius: 2, marginBottom: 8 },
  progressFill:  { height: 4, backgroundColor: '#0066EE', borderRadius: 2 },

  mealItem: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  foodName: { fontSize: 15, fontWeight: '500' },
  foodSubText: { fontSize: 12, color: '#888' },
  foodCal: { fontSize: 14, color: '#333', marginLeft: 'auto', marginRight: 10 },

  emptyMeal: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, backgroundColor: '#F0F4FF', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#B3CCFF', borderStyle: 'dashed',
  },
  emptyText: { color: '#0066EE', fontSize: 13, fontWeight: '500' },
});

export default DietTracker;