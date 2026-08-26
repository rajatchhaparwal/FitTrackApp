import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Image, StatusBar, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';
import { searchFood, getFoodById } from '../../services/fatsecretApi';

// ── Macro pill component ───────────────────────────────────────────────────────
const MacroPill = ({ label, value, color }) => (
  <View style={[styles.macroPill, { backgroundColor: color + '20' }]}>
    <Text style={[styles.macroPillText, { color }]}>{label}: {value}g</Text>
  </View>
);

// ── Food Result Card ──────────────────────────────────────────────────────────
const FoodCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.foodCard}
    activeOpacity={0.8}
    onPress={() => onPress(item)}
  >
    <View style={styles.foodCardLeft}>
      <View style={styles.foodIconCircle}>
        <Text style={styles.foodEmoji}>
          {item.type === 'Brand' ? '🏪' : '🥗'}
        </Text>
      </View>
    </View>
    <View style={styles.foodCardMid}>
      <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
      {item.brand ? <Text style={styles.foodBrand}>{item.brand}</Text> : null}
      <View style={styles.macrosRow}>
        <MacroPill label="P" value={item.protein.toFixed(1)} color="#3498DB" />
        <MacroPill label="C" value={item.carbs.toFixed(1)}   color="#E67E22" />
        <MacroPill label="F" value={item.fat.toFixed(1)}     color="#E74C3C" />
      </View>
    </View>
    <View style={styles.foodCardRight}>
      <Text style={styles.foodCalories}>{Math.round(item.calories)}</Text>
      <Text style={styles.foodKcal}>kcal</Text>
      <View style={styles.addBtn}>
        <Icon name="plus" size={18} color="#fff" />
      </View>
    </View>
  </TouchableOpacity>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ query }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>🔍</Text>
    <Text style={styles.emptyTitle}>
      {query ? `No results for "${query}"` : 'Search for food'}
    </Text>
    <Text style={styles.emptySubtitle}>
      {query
        ? 'Try a different name or check spelling'
        : 'Type a food name to get nutrition info from FatSecret'}
    </Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const FoodSearchScreen = ({ navigation, route }) => {
  const mealType    = route?.params?.mealType || 'Meal';
  const initialQuery = route?.params?.initialQuery || '';
  const [query, setQuery]       = useState(initialQuery);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);
  const [addedItems, setAddedItems] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSearched(true);
      setLoading(true);
      searchFood(initialQuery.trim(), 15)
        .then(foods => {
          setResults(foods);
        })
        .catch(err => {
          console.error('FatSecret initial search error:', err);
          Alert.alert('Search Error', 'Could not reach FatSecret.');
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialQuery]);

  // ── Debounced search ─────────────────────────────────────────────────────────
  const handleSearch = useCallback((text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const foods = await searchFood(text.trim(), 15);
        setResults(foods);
      } catch (err) {
        console.error('FatSecret search error:', err);
        Alert.alert('Search Error', 'Could not reach FatSecret. Check your internet connection.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // ── Navigate to Detail Screen ────────────────────────────────────────────────
  const handleCardPress = useCallback((food) => {
    navigation.navigate('FoodDetail', { food, defaultMealType: mealType });
  }, [navigation, mealType]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Search Food</Text>
          <Text style={styles.headerSub}>Adding to {mealType}</Text>
        </View>
        {addedItems.length > 0 && (
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{addedItems.length}</Text>
          </View>
        )}
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={22} color="#5A8BFF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search food (e.g. chicken breast, banana...)"
          placeholderTextColor="#AAA"
          value={query}
          onChangeText={handleSearch}
          autoFocus
          returnKeyType="search"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#5A8BFF" style={styles.searchLoader} />
        ) : query ? (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Icon name="close-circle" size={20} color="#CCC" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Results ── */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FoodCard
            item={item}
            onPress={handleCardPress}
          />
        )}
        ListEmptyComponent={
          !loading ? <EmptyState query={searched ? query : ''} /> : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerTextCol: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  headerSub:   { fontSize: 12, color: '#999', marginTop: 1 },
  badgeWrap: {
    backgroundColor: '#5A8BFF', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Search bar
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, paddingHorizontal: 16, height: 52,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    shadowColor: '#5A8BFF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#222' },
  searchLoader: { marginLeft: 8 },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  separator:   { height: 10 },

  // Food card
  foodCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  foodCardLeft:  { marginRight: 12 },
  foodIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center',
  },
  foodEmoji: { fontSize: 22 },
  foodCardMid:   { flex: 1 },
  foodName:    { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 2 },
  foodBrand:   { fontSize: 11, color: '#999', marginBottom: 5 },
  macrosRow:   { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  macroPill: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  macroPillText: { fontSize: 11, fontWeight: '600' },
  foodCardRight: { alignItems: 'center', marginLeft: 10 },
  foodCalories:  { fontSize: 18, fontWeight: '800', color: '#111' },
  foodKcal:      { fontSize: 10, color: '#999', marginBottom: 6 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#5A8BFF', justifyContent: 'center', alignItems: 'center',
  },

  // Empty
  emptyState:    { alignItems: 'center', paddingTop: 60 },
  emptyEmoji:    { fontSize: 60, marginBottom: 16 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, paddingHorizontal: 32 },
});

export default FoodSearchScreen;
