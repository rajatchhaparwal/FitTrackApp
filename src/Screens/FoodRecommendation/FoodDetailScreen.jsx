import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';
import { getFoodById } from '../../services/fatsecretApi';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
const mealIcon = (m) => m === 'breakfast' ? 'weather-sunset' : m === 'lunch' ? 'weather-sunny' : m === 'dinner' ? 'weather-night' : 'food-apple';

const MacroChip = ({ label, value, color }) => (
  <View style={[styles.macroChip, { borderColor: color }]}>
    <Text style={[styles.macroChipVal, { color }]}>{value}g</Text>
    <Text style={styles.macroChipLabel}>{label}</Text>
  </View>
);

const getServingsOptions = (item) => {
  if (!item) return [];

  const baseCals = parseFloat(item.calories) || 0;
  const baseProt = parseFloat(item.protein || item.proteinG || 0);
  const baseCarb = parseFloat(item.carbs || item.carbsG || 0);
  const baseFat  = parseFloat(item.fat || item.fatG || 0);

  // Helper to create serving option derived from base 100g nutrition
  const createOpt = (id, desc, unit, qtyInGrams) => ({
    serving_id: id,
    serving_description: desc,
    measurement_description: unit,
    calories: (baseCals / 100) * qtyInGrams,
    protein: (baseProt / 100) * qtyInGrams,
    carbs: (baseCarb / 100) * qtyInGrams,
    fat: (baseFat / 100) * qtyInGrams,
    metric_amount: qtyInGrams,
    metric_unit: 'g'
  });

  // FatSecret structures: item.servings.serving
  const servingsData = item.servings?.serving;
  if (!servingsData) {
    // Local database or fallback: construct standard options dynamically by food type
    const name = (item.name || '').toLowerCase();
    
    // Core Gram options
    const options = [
      {
        serving_id: '100grams',
        serving_description: '100 grams',
        measurement_description: 'g',
        calories: baseCals,
        protein: baseProt,
        carbs: baseCarb,
        fat: baseFat,
        metric_amount: 100,
        metric_unit: 'g'
      },
      {
        serving_id: 'grams',
        serving_description: '1 gram',
        measurement_description: 'g',
        calories: baseCals / 100,
        protein: baseProt / 100,
        carbs: baseCarb / 100,
        fat: baseFat / 100,
        metric_amount: 1,
        metric_unit: 'g'
      }
    ];

    // Detect food type and prepend intuitive serving options
    if (name.includes('roti') || name.includes('chapati')) {
      options.unshift(createOpt('roti_unit', '1 piece (30g)', 'roti', 30));
    } else if (name.includes('paratha')) {
      options.unshift(createOpt('paratha_unit', '1 paratha (120g)', 'piece', 120));
    } else if (name.includes('naan')) {
      options.unshift(createOpt('naan_unit', '1 naan (90g)', 'piece', 90));
    } else if (name.includes('bread')) {
      options.unshift(createOpt('slice', '1 slice (30g)', 'slice', 30));
    } else if (name.includes('egg whole') || name.includes('whole egg') || name === 'egg whole') {
      options.unshift(createOpt('egg', '1 medium egg (50g)', 'egg', 50));
    } else if (name.includes('egg white')) {
      options.unshift(createOpt('egg_white', '1 egg white (33g)', 'white', 33));
    } else if (name.includes('banana')) {
      options.unshift(createOpt('banana_med', '1 medium banana (120g)', 'banana', 120));
      options.unshift(createOpt('banana_small', '1 small banana (90g)', 'banana', 90));
    } else if (name.includes('apple')) {
      options.unshift(createOpt('apple_med', '1 medium apple (150g)', 'apple', 150));
    } else if (name.includes('samosa')) {
      options.unshift(createOpt('samosa_unit', '1 samosa (75g)', 'samosa', 75));
    } else if (name.includes('idli')) {
      options.unshift(createOpt('idli_unit', '1 idli (40g)', 'idli', 40));
    } else if (name.includes('dosa')) {
      options.unshift(createOpt('dosa_unit', '1 dosa (120g)', 'dosa', 120));
    } else if (name.includes('avocado')) {
      options.unshift(createOpt('avocado_med', '1 medium avocado (150g)', 'avocado', 150));
    } else if (name.includes('orange')) {
      options.unshift(createOpt('orange_med', '1 medium orange (130g)', 'orange', 130));
    } else if (name.includes('whey') || name.includes('protein powder')) {
      options.unshift(createOpt('scoop', '1 scoop (33g)', 'scoop', 33));
    } else if (name.includes('almond') && !name.includes('milk')) {
      options.unshift(createOpt('almond_nut', '1 nut (1.2g)', 'nut', 1.2));
      options.unshift(createOpt('almond_handful', '1 handful (30g)', 'handful', 30));
    } else if (name.includes('walnut')) {
      options.unshift(createOpt('walnut_nut', '1 nut (2g)', 'nut', 2));
      options.unshift(createOpt('walnut_handful', '1 handful (30g)', 'handful', 30));
    } else if (name.includes('cashew')) {
      options.unshift(createOpt('cashew_nut', '1 nut (2g)', 'nut', 2));
      options.unshift(createOpt('cashew_handful', '1 handful (30g)', 'handful', 30));
    } else if (name.includes('peanut butter') || name.includes('butter') || name.includes('oil')) {
      options.unshift(createOpt('tbsp', '1 tablespoon (16g)', 'tbsp', 16));
      options.unshift(createOpt('tsp', '1 teaspoon (5g)', 'tsp', 5));
    } else if (name.includes('chia')) {
      options.unshift(createOpt('tbsp_chia', '1 tablespoon (12g)', 'tbsp', 12));
    } else if (name.includes('milk') || name.includes('soy milk') || name.includes('almond milk')) {
      options.unshift(createOpt('glass', '1 glass (200ml)', 'glass', 200));
      options.unshift(createOpt('cup_liq', '1 cup (240ml)', 'cup', 240));
    } else if (name.includes('dal') || name.includes('lentil') || name.includes('sambar') || name.includes('curry') || name.includes('soup')) {
      options.unshift(createOpt('bowl_liq', '1 bowl (250g)', 'bowl', 250));
      options.unshift(createOpt('cup_liq', '1 cup (150g)', 'cup', 150));
    } else if (name.includes('rice') || name.includes('poha') || name.includes('upma') || name.includes('biryani') || name.includes('oats')) {
      options.unshift(createOpt('bowl_dry', '1 bowl (250g)', 'bowl', 250));
      options.unshift(createOpt('cup_dry', '1 cup (150g)', 'cup', 150));
    } else {
      // Catch-all default presets for generic local items
      options.push(createOpt('tablespoon', '1 tablespoon (15g)', 'tbsp', 15));
      options.push(createOpt('teaspoon', '1 teaspoon (5g)', 'tsp', 5));
      options.push(createOpt('bowl', '1 bowl (250g)', 'bowl', 250));
    }

    return options;
  }

  // Handle FatSecret servings array/object
  const rawServings = Array.isArray(servingsData) ? servingsData : [servingsData];
  return rawServings.map(s => {
    return {
      serving_id: s.serving_id,
      serving_description: s.serving_description, // e.g. "1 tbsp" or "100 g"
      measurement_description: s.measurement_description || s.metric_serving_unit || 'unit',
      calories: parseFloat(s.calories) || 0,
      protein: parseFloat(s.protein) || 0,
      carbs: parseFloat(s.carbohydrate) || 0,
      fat: parseFloat(s.fat) || 0,
      metric_amount: parseFloat(s.metric_serving_amount) || 0,
      metric_unit: s.metric_serving_unit || 'g',
    };
  });
};

const FoodDetailScreen = ({ route, navigation }) => {
  const { food, defaultMealType } = route.params;

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [foodDetail, setFoodDetail] = useState(null);
  const [servingOptions, setServingOptions] = useState([]);
  const [selectedServing, setSelectedServing] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState(defaultMealType || 'breakfast');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Setup serving options on mount, fetching full FatSecret details if necessary
  useEffect(() => {
    let active = true;
    const loadDetails = async () => {
      try {
        setLoadingDetails(true);
        if (!food || !food.id || String(food.id).startsWith('local_')) {
          if (active) {
            setupFoodData(food);
          }
          return;
        }

        const res = await getFoodById(food.id);
        if (active) {
          if (res && res.food) {
            setupFoodData(res.food);
          } else {
            setupFoodData(food);
          }
        }
      } catch (err) {
        console.warn('[FoodDetail] Fetch details failed:', err.message);
        if (active) {
          setupFoodData(food);
        }
      } finally {
        if (active) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => { active = false; };
  }, [food]);

  const setupFoodData = (data) => {
    setFoodDetail(data);
    const options = getServingsOptions(data);
    setServingOptions(options);

    // Choose default serving: look for common pieces/slices first, then fall back to "100 g"
    const defaultOpt = options.find(o =>
      o.serving_description.toLowerCase().includes('piece') ||
      o.serving_description.toLowerCase().includes('roti') ||
      o.serving_description.toLowerCase().includes('slice') ||
      o.serving_description.toLowerCase().includes('medium') ||
      o.serving_description.toLowerCase().includes('egg')
    ) || options.find(o =>
      o.serving_description.toLowerCase().includes('100 g') ||
      o.serving_description.toLowerCase() === '100g' ||
      o.serving_id === '100grams'
    ) || options[0];

    setSelectedServing(defaultOpt);
    if (defaultOpt) {
      const isGram = defaultOpt.serving_id === 'grams' || 
                     defaultOpt.serving_id === '100grams' ||
                     defaultOpt.serving_description.toLowerCase() === 'g' ||
                     (defaultOpt.metric_unit === 'g' && defaultOpt.metric_amount === 1);
      setQuantity(isGram ? '100' : '1');
    }
  };

  const qty = parseFloat(quantity) || 0;
  const calcCalories = Math.round((selectedServing?.calories || 0) * qty);
  const calcProtein  = parseFloat(((selectedServing?.protein || 0) * qty).toFixed(1));
  const calcCarbs    = parseFloat(((selectedServing?.carbs || 0) * qty).toFixed(1));
  const calcFat      = parseFloat(((selectedServing?.fat || 0) * qty).toFixed(1));

  const isGramUnit = selectedServing?.serving_id === 'grams' || 
                     selectedServing?.serving_id === '100grams' ||
                     selectedServing?.serving_description?.toLowerCase()?.includes('gram') ||
                     selectedServing?.serving_description?.toLowerCase() === 'g' ||
                     (selectedServing?.metric_unit === 'g' && selectedServing?.metric_amount === 1);

  const presets = isGramUnit ? [50, 100, 150, 200, 250] : [0.5, 1, 2, 3, 5];

  const handleAddToLog = async () => {
    if (qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a quantity greater than 0.');
      return;
    }
    try {
      setLoadingSubmit(true);
      const user = auth().currentUser;
      if (!user) { Alert.alert('Session Expired', 'Please log in again.'); return; }
      
      const response = await fetch(api_call + '/DietLog/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'firebase-uid': user.uid },
        body: JSON.stringify({
          mealType,
          food: {
            name: foodDetail?.name || foodDetail?.food_name || food.name,
            quantity: qty,
            unit: selectedServing?.serving_description || 'grams',
            calories: calcCalories,
            protein: calcProtein,
            carbs: calcCarbs,
            fat: calcFat,
            source: 'search',
          },
        }),
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        Alert.alert(
          'Added!',
          `${foodDetail?.name || foodDetail?.food_name || food.name} - ${qty}x ${selectedServing?.serving_description} (${calcCalories} kcal) added to ${mealType}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(resData.message || 'Failed to save food');
      }
    } catch (err) {
      console.error('Error logging food:', err);
      Alert.alert('Error', 'Could not add this food to your log.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingDetails) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#0066EE" />
          <Text style={styles.loadingText}>Fetching nutritional info...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.foodName}>{foodDetail?.food_name || foodDetail?.name || food.name}</Text>
            {foodDetail?.brand_name || foodDetail?.brand ? (
              <Text style={styles.foodBrand}>{foodDetail?.brand_name || foodDetail?.brand}</Text>
            ) : null}
            <Text style={styles.foodMeta}>
              {selectedServing ? `1 Unit = ${selectedServing.serving_description}` : 'Per Serving'}
            </Text>
          </View>
        </View>

        {/* Serving Unit Picker */}
        {servingOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Unit / Serving Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitPickerContainer}>
              {servingOptions.map((opt) => {
                const isSelected = selectedServing?.serving_id === opt.serving_id;
                return (
                  <TouchableOpacity
                    key={opt.serving_id}
                    style={[styles.unitBtn, isSelected && styles.unitBtnActive]}
                    onPress={() => {
                      setSelectedServing(opt);
                      const isGram = opt.serving_id === 'grams' || 
                                     opt.serving_id === '100grams' ||
                                     opt.serving_description.toLowerCase() === 'g' ||
                                     (opt.metric_unit === 'g' && opt.metric_amount === 1);
                      setQuantity(isGram ? '100' : '1');
                    }}
                  >
                    <Text style={[styles.unitBtnText, isSelected && styles.unitBtnTextActive]}>
                      {opt.serving_description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{isGramUnit ? 'Weight (Grams)' : 'Quantity (Pieces / Units)'}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => {
                const step = isGramUnit ? 10 : 0.5;
                const nextVal = Math.max(0.1, (parseFloat(q) || 0) - step);
                return String(parseFloat(nextVal.toFixed(2)));
              })}
            >
              <Icon name="minus" size={20} color="#0066EE" />
            </TouchableOpacity>
            <TextInput 
              style={styles.qtyInput} 
              value={quantity} 
              onChangeText={setQuantity} 
              keyboardType="numeric" 
              selectTextOnFocus 
            />
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => setQuantity(q => {
                const step = isGramUnit ? 10 : 0.5;
                const nextVal = (parseFloat(q) || 0) + step;
                return String(parseFloat(nextVal.toFixed(2)));
              })}
            >
              <Icon name="plus" size={20} color="#0066EE" />
            </TouchableOpacity>
          </View>
          <View style={styles.qtyPresets}>
            {presets.map(val => (
              <TouchableOpacity 
                key={val} 
                style={[styles.preset, quantity === String(val) && styles.presetActive]} 
                onPress={() => setQuantity(String(val))}
              >
                <Text style={[styles.presetText, quantity === String(val) && styles.presetTextActive]}>
                  {val}{isGramUnit ? 'g' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculated macros */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nutrition Details</Text>
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

        {foodDetail?.food_description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nutritional Description</Text>
            <Text style={styles.descText}>{foodDetail.food_description}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToLog} activeOpacity={0.85} disabled={loadingSubmit}>
          {loadingSubmit
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Icon name="plus-circle" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add to {mealType}</Text>
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
  
  // Loading styles
  loadingCenter:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText:      { fontSize: 15, color: '#64748B', marginTop: 12, fontWeight: '600' },
  
  // Unit picker styles
  unitPickerContainer: { gap: 10, paddingVertical: 4 },
  unitBtn:          { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  unitBtnActive:    { backgroundColor: '#EEF4FF', borderColor: '#0066EE' },
  unitBtnText:      { fontSize: 13, color: '#64748B', fontWeight: '600' },
  unitBtnTextActive:{ color: '#0066EE', fontWeight: '700' }
});

export default FoodDetailScreen;
