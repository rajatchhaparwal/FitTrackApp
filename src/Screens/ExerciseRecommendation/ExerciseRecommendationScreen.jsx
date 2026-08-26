import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, StatusBar, ScrollView, TextInput, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../../../UserContext';
import {
  BODY_PARTS,
  EXERCISE_TYPES,
  getPersonalizedWorkouts,
} from '../../services/exerciseRecommendation';
import api_call from '../../../api';
import { getPoseConfigForExercise } from '../WorkoutTracker/data/exercisePoseConfigs';

const { width } = Dimensions.get('window');

// ── Type badge styles ─────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  strength: { bg: '#EBF1FF', text: '#2F6BFF', icon: 'dumbbell' },
  cardio: { bg: '#FFF0F0', text: '#FF4D4D', icon: 'heart-pulse' },
  flexibility: { bg: '#EAFBEA', text: '#22C55E', icon: 'yoga' },
};

// ── Icon Mapping for Filter Chips ─────────────────────────────────────────────
const BODY_PART_ICONS = {
  All: 'compass-outline',
  Abs: 'shield-outline',
  Arm: 'arm-flex-outline',
  Chest: 'tshirt-crew-outline',
  Leg: 'run',
  Shoulder: 'arrow-up-bold-box-outline',
  Back: 'human-handsup',
  'Full Body': 'human-running',
};

const TYPE_ICONS = {
  All: 'apps',
  strength: 'dumbbell',
  cardio: 'heart-pulse',
  flexibility: 'yoga',
};

// ── Difficulty Stars Component ────────────────────────────────────────────────
const DifficultyStars = ({ level }) => {
  const map = { beginner: 1, intermediate: 2, advanced: 3 };
  const count = map[level] || 1;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3].map(i => (
        <Icon
          key={i}
          name="star"
          size={11}
          color={i <= count ? '#FFC107' : '#E2E8F0'}
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );
};

// ── Premium Exercise Card ─────────────────────────────────────────────────────
const ExerciseCard = ({ item, onPress }) => {
  const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.strength;
  const repsOrDuration = item.reps
    ? `${item.sets} × ${item.reps} reps`
    : `${item.sets} × ${item.duration}`;
  const isAITracked = getPoseConfigForExercise(item.name)?.is_supported;

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => onPress(item)}>
      {/* Background Image */}
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
      
      {/* Absolute Overlays */}
      <View style={styles.cardOverlay} />
      
      {/* Muscle Group Tag */}
      <View style={styles.muscleBadge}>
        <Text style={styles.muscleBadgeText}>{item.bodyPart}</Text>
      </View>

      {/* AI Tracker Glowing Badge */}
      {isAITracked && (
        <View style={styles.aiBadge}>
          <View style={styles.glowingDot} />
          <Icon name="camera-iris" size={11} color="#fff" />
          <Text style={styles.aiBadgeText}>LIVE AI</Text>
        </View>
      )}

      {/* Card Info Content at Bottom */}
      <View style={styles.cardBottom}>
        <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
          <Icon name={tc.icon} size={10} color={tc.text} style={{ marginRight: 4 }} />
          <Text style={[styles.typeBadgeText, { color: tc.text }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.cardMetaRow}>
          <DifficultyStars level={item.difficulty} />
          <Text style={styles.cardMetaText}>{repsOrDuration}</Text>
        </View>

        <View style={styles.cardKcalRow}>
          <Icon name="fire" size={13} color="#FF4D4D" style={{ marginRight: 3 }} />
          <Text style={styles.cardKcal}>{item.kcalPer30} kcal/30min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyExercises = () => (
  <View style={styles.empty}>
    <View style={styles.emptyIconContainer}>
      <Icon name="dumbbell" size={48} color="#94A3B8" />
    </View>
    <Text style={styles.emptyText}>No exercises found matching your selections.</Text>
  </View>
);

// ── Main Recommendation Screen ────────────────────────────────────────────────
const ExerciseRecommendationScreen = ({ navigation }) => {
  const { userData } = useUser();
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTrackedOnly, setAiTrackedOnly] = useState(false);
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic exercise fetch based on selections
  useEffect(() => {
    let active = true;
    const fetchList = async () => {
      setLoading(true);
      try {
        let url = `${api_call}/Exercise?`;
        if (selectedBodyPart !== 'All') {
          url += `bodyPart=${encodeURIComponent(selectedBodyPart)}&`;
        }
        if (selectedType !== 'All') {
          url += `type=${encodeURIComponent(selectedType)}&`;
        }
        if (searchQuery.trim().length > 0) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (active && Array.isArray(data)) {
          setExercises(data);
        }
      } catch (e) {
        console.error("Error fetching exercise data:", e);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchList();

    return () => {
      active = false;
    };
  }, [selectedBodyPart, selectedType, searchQuery]);

  const goal = userData?.goal || 'General Fitness';
  const cleanGoalName = goal.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Sort and rank exercises using recommendation engine if no active filters are applied
  const isDefaultView = selectedBodyPart === 'All' && selectedType === 'All' && !searchQuery.trim();
  const sortedExercises = isDefaultView
    ? getPersonalizedWorkouts(userData || {}, exercises)
    : exercises;

  const displayedExercises = sortedExercises.filter(item => {
    if (aiTrackedOnly) {
      return getPoseConfigForExercise(item.name)?.is_supported;
    }
    return true;
  });

  const handleExercisePress = (exerciseItem) => {
    navigation.navigate('SpecificWorkoutPage', {
      exercise: {
        exercise_id: {
          name: exerciseItem.name,
          sets_reps_default: {
            sets: exerciseItem.sets,
            reps: exerciseItem.reps,
            duration_seconds: exerciseItem.duration ? parseInt(exerciseItem.duration) : null,
          }
        },
        imageUri: exerciseItem.imageUri,
        emoji: exerciseItem.bodyPart === 'Abs' ? '🧘' : exerciseItem.bodyPart === 'Arm' ? '💪' : '🏋️',
      },
      workoutTitle: exerciseItem.name,
      workoutId: null,
      workoutExercises: null,
      exerciseIndex: 0,
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* ── Modern Premium Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Find Workouts</Text>
          <View style={styles.goalTagRow}>
            <View style={styles.goalDot} />
            <Text style={styles.headerSub}>
              {searchQuery ? `Searching: "${searchQuery}"` : `Target: ${cleanGoalName}`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Search Bar Input Card ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrap}>
          <Icon name="magnify" size={20} color="#0066EE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Icon name="close-circle" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Body Part Filter Chips ── */}
      {!searchQuery && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsWrap}>
            {BODY_PARTS.map(bp => {
              const isSelected = selectedBodyPart === bp;
              const iconName = BODY_PART_ICONS[bp] || 'dumbbell';
              return (
                <TouchableOpacity
                  key={bp}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setSelectedBodyPart(bp)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={iconName}
                    size={14}
                    color={isSelected ? '#fff' : '#64748B'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {bp}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Type & AI Chips ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipsWrap, { paddingTop: 4 }]}>
            <TouchableOpacity
              style={[styles.chip, aiTrackedOnly && styles.aiChipActive]}
              onPress={() => setAiTrackedOnly(!aiTrackedOnly)}
              activeOpacity={0.8}
            >
              <Icon
                name="camera-iris"
                size={14}
                color={aiTrackedOnly ? '#fff' : '#0066EE'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.chipText, aiTrackedOnly && styles.chipTextActive]}>
                AI Camera Support
              </Text>
            </TouchableOpacity>

            {EXERCISE_TYPES.map(type => {
              const isActive = selectedType === type;
              const iconName = TYPE_ICONS[type] || 'dumbbell';
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={iconName}
                    size={14}
                    color={isActive ? '#fff' : '#64748B'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Section Label ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery
            ? `Search Results`
            : selectedBodyPart === 'All' && selectedType === 'All'
              ? 'Personalized for You'
              : `${selectedBodyPart !== 'All' ? selectedBodyPart : ''} ${selectedType !== 'All' ? selectedType : ''} Exercises`}
        </Text>
        <Text style={styles.sectionCount}>{displayedExercises.length} options</Text>
      </View>

      {/* ── Grid/List Display ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066EE" />
          <Text style={styles.loadingText}>Structuring personalized routines...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedExercises}
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
      )}
    </SafeAreaView>
  );
};

// ── Premium Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTextCol: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  goalTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0066EE',
    marginRight: 6,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Montserrat-Medium',
  },

  filtersContainer: {
    marginBottom: 10,
  },
  chipsWrap: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#0066EE',
    borderColor: '#0066EE',
    shadowColor: '#0066EE',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  aiChipActive: {
    backgroundColor: '#0066EE',
    borderColor: '#0066EE',
    shadowColor: '#0066EE',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
  },

  grid: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  columnGap: {
    gap: 12,
    marginBottom: 12,
  },

  card: {
    flex: 1,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Translucent overlay for better readability
  },
  muscleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  muscleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
  },
  aiBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  glowingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 5,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '800',
    marginLeft: 3,
  },
  cardBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardName: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  cardMetaText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
  },
  cardKcalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardKcal: {
    color: '#FF8A8A',
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 14,
    color: '#64748B',
    fontFamily: 'Montserrat-Medium',
    fontSize: 13,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    lineHeight: 20,
  },
});

export default ExerciseRecommendationScreen;
