import React, { useState, useRef, useCallback } from 'react';
import {
  View, TextInput, StyleSheet, TouchableOpacity,
  FlatList, Text, ActivityIndicator, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { searchFood } from '../../services/fatsecretApi';
import { searchExercises } from '../../services/exerciseRecommendation';

/**
 * Fully-functional Search Bar with inline dropdown suggestions.
 *
 * Props:
 *   placeholder   – string
 *   searchType    – 'food' | 'exercise' | 'all' (default 'all')
 *   onResultPress – optional override callback(item, type)
 *   mealType      – passed to FoodSearch screen when navigating
 */
const SearchBar = ({
  placeholder   = 'Search exercises, food...',
  searchType    = 'all',
  onResultPress = null,
  mealType      = 'Meal',
}) => {
  const navigation  = useNavigation();
  const [query,   setQuery]    = useState('');
  const [results, setResults]  = useState([]);
  const [loading, setLoading]  = useState(false);
  const [focused, setFocused]  = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // ── Debounced multi-source search ────────────────────────────────────────────
  const runSearch = useCallback(async (text) => {
    if (!text.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const combined = [];

      if (searchType === 'food' || searchType === 'all') {
        const foods = await searchFood(text, 5);
        foods.forEach(f => combined.push({ ...f, _type: 'food' }));
      }

      if (searchType === 'exercise' || searchType === 'all') {
        const exercises = searchExercises(text).slice(0, 5);
        exercises.forEach(e => combined.push({ ...e, _type: 'exercise' }));
      }

      setResults(combined.slice(0, 8));
    } catch (err) {
      console.log('SearchBar error:', err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchType]);

  const handleChangeText = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => runSearch(text), 500);
  };

  const handleResultPress = (item) => {
    Keyboard.dismiss();
    setQuery('');
    setResults([]);

    if (onResultPress) {
      onResultPress(item, item._type);
      return;
    }

    if (item._type === 'food') {
      navigation.navigate('FoodSearch', { mealType, initialQuery: item.name });
    } else {
      navigation.navigate('ExerciseRecommendation');
    }
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    const currentResults = [...results];
    setResults([]);
    if (!query.trim()) return;

    if (searchType === 'food') {
      navigation.navigate('FoodSearch', { mealType, initialQuery: query });
      return;
    }
    if (searchType === 'exercise') {
      navigation.navigate('ExerciseRecommendation');
      return;
    }

    // 'all' - check if we have matching suggestions in the list
    if (currentResults.length > 0) {
      const firstType = currentResults[0]._type;
      if (firstType === 'food') {
        navigation.navigate('FoodSearch', { mealType, initialQuery: query });
      } else {
        navigation.navigate('ExerciseRecommendation');
      }
      return;
    }

    // fallback: guess intent by keyword
    const foodKeywords = [
      'cal', 'protein', 'food', 'eat', 'diet', 'meal', 'carb', 'fat', 'kcal', 'sugar', 'fiber', 'sodium',
      'egg', 'chicken', 'fish', 'rice', 'bread', 'apple', 'banana', 'milk', 'fruit', 'vegetable', 'meat',
      'beef', 'pork', 'salad', 'soup', 'juice', 'water', 'nutrition', 'cheese', 'butter', 'yogurt', 'oats',
      'cereal', 'shake', 'smoothie', 'potato', 'tomato', 'onion', 'garlic', 'salt', 'pepper', 'oil',
      'pasta', 'pizza', 'burger', 'sandwich', 'taco', 'burrito', 'sushi', 'curry', 'steak', 'coffee', 'tea'
    ];
    const isFood = foodKeywords.some(kw => query.toLowerCase().includes(kw));

    const exerciseKeywords = [
      'run', 'walk', 'jog', 'sprint', 'workout', 'exercise', 'train', 'gym', 'cardio', 'weight',
      'lift', 'push', 'pull', 'squat', 'bench', 'press', 'curl', 'deadlift', 'lunge', 'plank',
      'yoga', 'stretch', 'hiit', 'abs', 'chest', 'back', 'leg', 'shoulder', 'arm', 'muscle'
    ];
    const isExercise = exerciseKeywords.some(kw => query.toLowerCase().includes(kw));

    if (isFood || !isExercise) {
      // default fallback to FoodSearch since diet tracking is highly central
      navigation.navigate('FoodSearch', { mealType, initialQuery: query });
    } else {
      navigation.navigate('ExerciseRecommendation');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  // ── Render individual suggestion ─────────────────────────────────────────────
  const renderResult = ({ item }) => {
    const isFood = item._type === 'food';
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.resultIcon, { backgroundColor: isFood ? '#FFF3E0' : '#EBF1FF' }]}>
          <Icon
            name={isFood ? 'food-apple' : 'dumbbell'}
            size={16}
            color={isFood ? '#E67E22' : '#5A8BFF'}
          />
        </View>
        <View style={styles.resultTextCol}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.resultSub}>
            {isFood
              ? `${Math.round(item.calories)} kcal • ${item.type || 'Food'}`
              : `${item.bodyPart} • ${item.type}`}
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color="#CCC" />
      </TouchableOpacity>
    );
  };

  const showDropdown = focused && (results.length > 0 || loading) && query.length > 0;

  return (
    <View style={styles.wrapper}>
      {/* ── Input Row ── */}
      <View 
        style={[styles.searchSection, focused && styles.searchSectionFocused]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          underlineColorAndroid="transparent"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#5A8BFF" style={styles.rightWidget} />
        ) : query.length > 0 ? (
          <TouchableOpacity style={styles.rightWidget} onPress={clearSearch}>
            <Icon name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
            <Icon name="magnify" size={22} color="#5a8bff" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Dropdown Suggestions ── */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(item, idx) => `${item.id}-${idx}`}
            renderItem={renderResult}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    zIndex: 100,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 15,
    paddingRight: 8,
    height: 50,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchSectionFocused: {
    backgroundColor: '#fff',
    borderColor: '#5A8BFF',
    shadowColor: '#5A8BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
    paddingLeft: 15,
    paddingRight: 55,
  },
  rightWidget: {
    position: 'absolute',
    right: 15,
  },
  searchBtn: {
    position: 'absolute',
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5a8bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  resultTextCol: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#111' },
  resultSub:  { fontSize: 11, color: '#999', marginTop: 1 },
});

export default SearchBar;