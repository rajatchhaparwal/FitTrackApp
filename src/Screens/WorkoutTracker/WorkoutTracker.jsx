import React, { useEffect, useState,memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
const { width } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Flexibility'];


const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const COMPLETED_DAYS = [true, true, true, false, false, false, false]; // Mon-Wed done

const DIFFICULTY_COLOR = {
  Beginner: '#2ECC71',
  Intermediate: '#F5A623',
  Advanced: '#FF6B6B',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatPill = ({ icon, value, label, color }) => (
  <View style={[styles.statPill, { backgroundColor: `${color}18` }]}>
    <Icon name={icon} size={18} color={color} />
    <View style={styles.statPillText}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const WeekProgress = () => (
  <View style={styles.weekCard}>
    <View style={styles.weekHeader}>
      <Text style={styles.weekTitle}>This Week</Text>
      <Text style={styles.weekSub}>3 / 5 sessions</Text>
    </View>
    <View style={styles.weekDays}>
      {WEEK_DAYS.map((day, i) => (
        <View key={i} style={styles.dayCol}>
          <View
            style={[
              styles.dayDot,
              COMPLETED_DAYS[i] ? styles.dayDotActive : styles.dayDotInactive,
            ]}
          >
            {COMPLETED_DAYS[i] && (
              <Icon name="check" size={10} color="#fff" />
            )}
          </View>
          <Text style={[styles.dayLabel, COMPLETED_DAYS[i] && styles.dayLabelActive]}>
            {day}
          </Text>
        </View>
      ))}
    </View>
    {/* Progress bar */}
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: '40%' }]} />
    </View>
  </View>
);

const CategoryTab = ({ label, selected, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    style={[styles.categoryTab, selected && styles.categoryTabActive]}
    onPress={onPress}
  >
    <Text style={[styles.categoryTabText, selected && styles.categoryTabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);



const WorkoutCard = memo(({ workout, onPress }) => {
  // 1. Map JSON fields to UI variables
  const name = workout.name || "Unknown Exercise";
  const level = workout.level || "beginner"; // matches your JSON 'beginner'
  const equipment = workout.equipment || "Body only";
  
  // 2. Derive UI values since JSON doesn't have duration/calories
  const duration = 30; 
  const kcal = level === 'beginner' ? 120 : 250;

  // 3. Determine Emoji based on primary muscle
  const getEmoji = () => {
    const muscle = workout.primaryMuscles?.[0] || "";
    if (muscle.includes('abdominals')) return '💪';
    if (muscle.includes('biceps') || muscle.includes('chest')) return '💪';
    return '🏋️';

  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.workoutCard, { backgroundColor: "rgba(90,139,255,0.08)" }]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: "#5a8bff" }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={[styles.emojiCircle, { backgroundColor: '#5a8bff22' }]}>
            <Text style={styles.emojiText}>{getEmoji()}</Text>
          </View>

          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
            
            <View style={styles.difficultyBadge}>
              <View
                style={[
                  styles.difficultyDot,
                  { backgroundColor: DIFFICULTY_COLOR[level] || '#ccc' },
                ]}
              />
              <Text style={[styles.difficultyText, { color: DIFFICULTY_COLOR[level] || '#666' }]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.cardStats}>
          <View style={styles.cardStat}>
            <Icon name="clock-outline" size={14} color="#888" />
            <Text style={styles.cardStatText}>{duration} min</Text>
          </View>
          
          <View style={styles.cardStatDivider} />
          
          <View style={styles.cardStat}>
            <Icon name="dumbbell" size={14} color="#888" />
            <Text style={styles.cardStatText} numberOfLines={1}>
               {equipment}
            </Text>
          </View>
          
          <View style={styles.cardStatDivider} />
          
          <View style={styles.cardStat}>
            <Icon name="fire" size={14} color="#888" />
            <Text style={styles.cardStatText}>{kcal} kcal</Text>
          </View>
        </View>
      </View>

      {/* Start button UI */}
      <View style={[styles.startBtn, { backgroundColor: "#5a8bff" }]}>
        <Icon name="play" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WorkoutTracker = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

// fetching data from server
useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        const response = await axios.get("http://10.187.9.35:5000/Exercisedata");
        setExercises(Array.isArray(response.data) ? response.data : []);
        console.log(response.data.length)
      } catch (err) {
        console.log("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseData();
  }, []);

  // Show loading spinner while fetching
  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5a8bff" />
        <Text style={{ marginTop: 10, color: '#888' }}>Loading Workouts...</Text>
      </View>
    );
  }

const filtered = selectedCategory === 'All'
  ? exercises
  : exercises.filter(w => 
      w.category?.toString().toLowerCase() === selectedCategory.toLowerCase()
    );
  return (
  <SafeAreaView style={styles.screen}>
    <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />
    
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id || item.name}
      renderItem={({ item }) => (
        <WorkoutCard 
          workout={item} 
          onPress={() => console.log("Exercise selected:", item.name)} 
        />
      )}
      // Performance Props
      initialNumToRender={8}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={true}
      
      // Moving your UI into the Header so it stays at the top
      ListHeaderComponent={() => (
        <View style={styles.scroll}>
          {/* ── Header ───────────────────────────────────── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Ready to train?</Text>
              <Text style={styles.headerTitle}>Workout Tracker </Text>
            </View>
            <TouchableOpacity style={styles.searchBtn}>
              <Icon name="magnify" size={22} color="#5a8bff" />
            </TouchableOpacity>
          </View>

          {/* ── Quick Stats ───────────────────────────────── */}
          <View style={styles.statsRow}>
            <StatPill icon="fire" value="1,240" label="kcal burned" color="#FF6B6B" />
            <StatPill icon="clock-outline" value="3h 20m" label="active time" color="#5a8bff" />
            <StatPill icon="trophy-outline" value="12" label="workouts" color="#F5A623" />
          </View>

          {/* ── Weekly Progress ───────────────────────────── */}
          <WeekProgress />

          {/* ── Category Tabs ─────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>

          {/* ── Section label ─────────────────────────────── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Workouts' : selectedCategory}
            </Text>
            <Text style={styles.sectionCount}>{filtered.length} plans</Text>
          </View>
        </View>
      )}
      
      // Optional: Add space at the bottom
      ListFooterComponent={<View style={{ height: 20 }} />}
    />
  </SafeAreaView>
);
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  scroll: {
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSub: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#1A1A2E',
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5a8bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 14,
    gap: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  statPillText: {
    flexShrink: 1,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  statLabel: {
    fontSize: 9,
    color: '#888',
    fontFamily: 'Montserrat-Regular',
  },

  // Weekly progress
  weekCard: {
    marginHorizontal: 22,
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  weekTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1A1A2E',
  },
  weekSub: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#5a8bff',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotActive: {
    backgroundColor: '#5a8bff',
  },
  dayDotInactive: {
    backgroundColor: '#F0F2F8',
  },
  dayLabel: {
    fontSize: 11,
    color: '#bbb',
    fontFamily: 'Montserrat-Medium',
  },
  dayLabelActive: {
    color: '#5a8bff',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F0F2F8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#5a8bff',
    borderRadius: 3,
  },

  // Categories
  categoryScroll: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 4,
    gap: 10,
  },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#EAEEF5',
  },
  categoryTabActive: {
    backgroundColor: '#5a8bff',
    borderColor: '#5a8bff',
  },
  categoryTabText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#888',
  },
  categoryTabTextActive: {
    color: '#fff',
  },

  // Section row
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    color: '#1A1A2E',
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#aaa',
  },

  // Workout card
  workoutCard: {
    marginHorizontal: 22,
    marginBottom: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: 14,
  },
  accentBar: {
    width: 5,
    alignSelf: 'stretch',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  emojiCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  difficultyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardStatText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#666',
  },
  cardStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#DDD',
  },

  // Start button
  startBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default WorkoutTracker;