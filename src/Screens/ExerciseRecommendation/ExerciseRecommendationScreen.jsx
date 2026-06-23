import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, StatusBar, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../../UserContext';
import {
  getPersonalizedWorkouts,
  getExercisesByBodyPart,
  searchExercises,
  BODY_PARTS,
  EXERCISE_TYPES,
} from '../../services/exerciseRecommendation';

// ── Type badge colours ─────────────────────────────────────────────────────────
const TYPE_COLOURS = {
  strength:    { bg: '#EBF1FF', text: '#5A8BFF' },
  cardio:      { bg: '#FFF0F0', text: '#E74C3C' },
  flexibility: { bg: '#F0FFF4', text: '#27AE60' },
};

// ── Difficulty stars ──────────────────────────────────────────────────────────
const DifficultyStars = ({ level }) => {
  const map = { beginner: 1, intermediate: 2, advanced: 3 };
  const count = map[level] || 1;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3].map(i => (
        <Icon key={i} name="star" size={12}
          color={i <= count ? '#F39C12' : '#E0E0E0'} />
      ))}
    </View>
  );
};

// ── Exercise Card ─────────────────────────────────────────────────────────────
const ExerciseCard = ({ item, onPress }) => {
  const tc = TYPE_COLOURS[item.type] || TYPE_COLOURS.strength;
  const repsOrDuration = item.reps
    ? `${item.sets} × ${item.reps} reps`
    : `${item.sets} × ${item.duration}`;

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={() => onPress(item)}>
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
      <View style={styles.cardGradient} />
      <View style={styles.cardBottom}>
        <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
          <Text style={[styles.typeBadgeText, { color: tc.text }]}>{item.type}</Text>
        </View>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <DifficultyStars level={item.difficulty} />
          <Text style={styles.cardMetaText}>{repsOrDuration}</Text>
        </View>
        <View style={styles.cardKcalRow}>
          <Icon name="fire" size={13} color="#FF5A5A" />
          <Text style={styles.cardKcal}>{item.kcalPer30} kcal/30min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Empty ─────────────────────────────────────────────────────────────────────
const EmptyExercises = () => (
  <View style={styles.empty}>
    <Text style={styles.emptyEmoji}>🏋️</Text>
    <Text style={styles.emptyText}>No exercises found for this selection.</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const ExerciseRecommendationScreen = ({ navigation }) => {
  const { userData } = useUser();
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [selectedType, setSelectedType]         = useState('All');
  const [searchQuery, setSearchQuery]           = useState('');

  // Compute exercises
  const exercises = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return searchExercises(searchQuery);
    }
    if (selectedBodyPart === 'All' && selectedType === 'All') {
      return getPersonalizedWorkouts(userData || {});
    }
    let list = getExercisesByBodyPart(selectedBodyPart === 'All' ? null : selectedBodyPart);
    if (selectedType !== 'All') {
      list = list.filter(e => e.type === selectedType);
    }
    return list;
  }, [userData, selectedBodyPart, selectedType, searchQuery]);

  const goal = userData?.goal || 'General Fitness';

  const handleExercisePress = (exercise) => {
    navigation.navigate('AbsBeginnerScreen', {
      workoutId: exercise.id,
      name: exercise.name,
      duration: exercise.duration ? `0 mins` : `${exercise.sets * 3} mins`,
      totalExercises: 1,
      imageUri: exercise.imageUri,
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Exercise Recommendations</Text>
          <Text style={styles.headerSub}>
            {searchQuery ? `Searching: "${searchQuery}"` : `Goal: ${goal}`}
          </Text>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color="#5A8BFF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#AAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Body Part Filter Chips ── */}
      {!searchQuery && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsWrap}>
            {BODY_PARTS.map(bp => (
              <TouchableOpacity
                key={bp}
                style={[styles.chip, selectedBodyPart === bp && styles.chipActive]}
                onPress={() => setSelectedBodyPart(bp)}
              >
                <Text style={[styles.chipText, selectedBodyPart === bp && styles.chipTextActive]}>
                  {bp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Type Chips ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipsWrap, { paddingTop: 0 }]}>
            {EXERCISE_TYPES.map(type => {
              const tc = TYPE_COLOURS[type] || { bg: '#F4F5F7', text: '#666' };
              const isActive = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, isActive && { backgroundColor: tc.bg, borderColor: tc.text }]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.chipText, isActive && { color: tc.text, fontWeight: '700' }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* ── Section Label ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery
            ? `Results (${exercises.length})`
            : selectedBodyPart === 'All' && selectedType === 'All'
              ? 'Recommended for You'
              : `${selectedBodyPart !== 'All' ? selectedBodyPart : ''} ${selectedType !== 'All' ? selectedType : ''} Exercises`}
        </Text>
        <Text style={styles.sectionCount}>{exercises.length} exercises</Text>
      </View>

      {/* ── List ── */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnGap}
        renderItem={({ item }) => (
          <ExerciseCard item={item} onPress={handleExercisePress} />
        )}
        ListEmptyComponent={<EmptyExercises />}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 6, marginRight: 10 },
  headerTextCol: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  headerSub:   { fontSize: 12, color: '#999', marginTop: 1 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 14, paddingHorizontal: 14, height: 46,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    shadowColor: '#5A8BFF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#222' },

  chipsWrap: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#F4F5F7',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#EBF1FF', borderColor: '#5A8BFF' },
  chipText:   { fontSize: 13, color: '#777', fontWeight: '500' },
  chipTextActive: { color: '#5A8BFF', fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  sectionCount: { fontSize: 12, color: '#999' },

  grid: { paddingHorizontal: 10, paddingBottom: 24 },
  columnGap: { gap: 10, marginBottom: 10 },

  card: {
    flex: 1, height: 200, borderRadius: 18, overflow: 'hidden',
    backgroundColor: '#EEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  cardGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
  },
  cardBottom: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  cardName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  starsRow: { flexDirection: 'row', gap: 2 },
  cardMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  cardKcalRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardKcal: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center' },
});

export default ExerciseRecommendationScreen;
