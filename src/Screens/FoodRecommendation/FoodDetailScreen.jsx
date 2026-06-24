import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';

const scale = (value, qty, base) => Math.round(value * qty / (base || 100));
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
const mealIcon = (m) => m === 'breakfast' ? 'weather-sunset' : m === 'lunch' ? 'weather-sunny' : m === 'dinner' ? 'weather-night' : 'food-apple';

const MacroChip = ({ label, value, color }) => (
  <View style={[styles.macroChip, { borderColor: color }]}>
    <Text style={[styles.macroChipVal, { color }]}>{value}g</Text>
    <Text style={styles.macroChipLabel}>{label}</Text>
  </View>
);

const FoodDetailScreen = ({ route, navigation }) => {
  const { food, defaultMealType } = route.params;
  const baseQty = 100;
  const [quantity, setQuantity] = useState(String(baseQty));
  const [mealType, setMealType] = useState(defaultMealType || 'breakfast');
  const [loading, setLoading]   = useState(false);

  const qty = parseFloat(quantity) || 0;
  const calcCalories = scale(food.calories, qty, baseQty);
  const calcProtein  = scale(food.protein,  qty, baseQty);
  const calcCarbs    = scale(food.carbs,    qty, baseQty);
  const calcFat      = scale(food.fat,      qty, baseQty);

  const handleAddToLog = async () => {
    if (qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a quantity greater than 0.');
      return;
    }
    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) { Alert.alert('Session Expired', 'Please log in again.'); return; }
      const response = await fetch(api_call + '/DietLog/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'firebase-uid': user.uid },
        body: JSON.stringify({
          mealType,
          food: {
            name: food.name, quantity: qty, unit: 'grams',
            calories: calcCalories, protein: calcProtein, carbs: calcCarbs, fat: calcFat,
            source: 'search',
          },
        }),
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        Alert.alert(
          'Added!',
          food.name + ' ' + qty + 'g (' + calcCalories + ' kcal) added to ' + mealType,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(resData.message || 'Failed to save food');
      }
    } catch (err) {
      console.error('Error logging food:', err);
      Alert.alert('Error', 'Could not add this food to your log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Food Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Food name card */}
        <View style={styles.foodNameCard}>
          <View style={styles.foodIconBig}>
            <Icon name="food-variant" size={36} color="#0066EE" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.foodName}>{food.name}</Text>
            {food.brand ? <Text style={styles.foodBrand}>{food.brand}</Text> : null}
            <Text style={styles.foodMeta}>{food.servingSize || 'Per 100g'}</Text>
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quantity (grams)</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => String(Math.max(1, (parseFloat(q) || 0) - 10)))}>
              <Icon name="minus" size={20} color="#0066EE" />
            </TouchableOpacity>
            <TextInput style={styles.qtyInput} value={quantity} onChangeText={setQuantity} keyboardType="numeric" selectTextOnFocus />
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => String((parseFloat(q) || 0) + 10))}>
              <Icon name="plus" size={20} color="#0066EE" />
            </TouchableOpacity>
          </View>
          <View style={styles.qtyPresets}>
            {[50, 100, 150, 200, 250].map(g => (
              <TouchableOpacity key={g} style={[styles.preset, quantity === String(g) && styles.presetActive]} onPress={() => setQuantity(String(g))}>
                <Text style={[styles.presetText, quantity === String(g) && styles.presetTextActive]}>{g}g</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculated macros */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nutrition for {qty || 0}g</Text>
          <View style={styles.calorieRow}>
            <Icon name="fire" size={24} color="#FF6B35" />
            <Text style={styles.calorieVal}>{calcCalories}</Text>
            <Text style={styles.calorieUnit}> kcal</Text>
          </View>
          <View style={styles.macrosRow}>
            <MacroChip label="Protein" value={calcProtein} color="#0066EE" />
            <MacroChip label="Carbs"   value={calcCarbs}   color="#5A8BFF" />
            <MacroChip label="Fat"     value={calcFat}     color="#29B6F6" />
          </View>
        </View>

        {/* Meal picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add to Meal</Text>
          <View style={styles.mealPicker}>
            {MEAL_TYPES.map(m => (
              <TouchableOpacity key={m} style={[styles.mealBtn, mealType === m && styles.mealBtnActive]} onPress={() => setMealType(m)}>
                <Icon name={mealIcon(m)} size={16} color={mealType === m ? '#0066EE' : '#64748B'} />
                <Text style={[styles.mealBtnText, mealType === m && styles.mealBtnTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {food.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FatSecret Info</Text>
            <Text style={styles.descText}>{food.description}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToLog} activeOpacity={0.85} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Icon name="plus-circle" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add {qty > 0 ? qty + 'g' : ''} to {mealType}</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn:          { padding: 6, marginRight: 12 },
  headerTitle:      { flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A' },
  scroll:           { padding: 20, paddingBottom: 120 },
  foodNameCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  foodIconBig:      { width: 68, height: 68, borderRadius: 18, backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center' },
  foodName:         { fontSize: 16, fontWeight: '700', color: '#0F172A', flexWrap: 'wrap' },
  foodBrand:        { fontSize: 12, color: '#64748B', marginTop: 2 },
  foodMeta:         { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  section:          { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionLabel:     { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  qtyRow:           { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn:           { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center' },
  qtyInput:         { flex: 1, height: 54, textAlign: 'center', fontSize: 26, fontWeight: '800', color: '#0F172A', backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  qtyPresets:       { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  preset:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  presetActive:     { backgroundColor: '#EEF4FF', borderColor: '#0066EE' },
  presetText:       { fontSize: 13, color: '#64748B', fontWeight: '600' },
  presetTextActive: { color: '#0066EE' },
  calorieRow:       { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  calorieVal:       { fontSize: 36, fontWeight: '800', color: '#0F172A', marginLeft: 8 },
  calorieUnit:      { fontSize: 16, color: '#64748B', fontWeight: '500' },
  macrosRow:        { flexDirection: 'row', gap: 12 },
  macroChip:        { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, backgroundColor: '#F8FAFC' },
  macroChipVal:     { fontSize: 18, fontWeight: '800' },
  macroChipLabel:   { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },
  mealPicker:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealBtn:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  mealBtnActive:    { backgroundColor: '#EEF4FF', borderColor: '#0066EE' },
  mealBtnText:      { fontSize: 13, color: '#64748B', fontWeight: '600' },
  mealBtnTextActive:{ color: '#0066EE', fontWeight: '700' },
  descText:         { fontSize: 13, color: '#475569', lineHeight: 20 },
  footer:           { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  addBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#0066EE', borderRadius: 16, paddingVertical: 16 },
  addBtnText:       { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default FoodDetailScreen;
