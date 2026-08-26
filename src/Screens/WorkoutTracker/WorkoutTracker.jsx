import React, { useEffect, useState, memo, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import api_call from '../../../api';
import { RowWorkoutCard, PortraitSquareCard, PromoBannerCard } from './DiscoverWorkouts';
import { useUser } from '../../../UserContext';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');
const BODY_FOCUS_CATEGORIES = ['Abs', 'Arm', 'Chest', 'Leg', 'Shoulder'];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const StatPill = ({ icon, value, label, bgcolor, iconcolor }) => (
  <View style={[styles.statPill, { backgroundColor: bgcolor }]}>
    <View style={[styles.pillIconCircle, { backgroundColor: '#FFFFFF' }]}>
      <Icon name={icon} size={18} color={iconcolor} />
    </View>
    <View style={styles.statPillText}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const BodyFocusTab = ({ label, selected, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[styles.categoryTab, selected && styles.categoryTabActive]}
    onPress={onPress}
  >
    <Text style={[styles.categoryTabText, selected && styles.categoryTabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const RoutineCard = memo(({ routine, navigation }) => {
  const name = routine.title || "Untitled Routine";
  const duration = routine.total_duration_minutes || 15;
  const totalExercises = routine.exercises_sequence?.length || 0;
  const difficultyRating = routine.difficulty_rating || 1;
  const lastPlayedText = routine.last_played_date ? `Last time: ${routine.last_played_date}` : "Not started yet";
  const imageUri = routine.thumbnail_image || 'https://via.placeholder.com/120';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.routineCardContainer}
      onPress={() => navigation.navigate('AbsBeginnerScreen', {
        workoutId: routine.workout_id,
        categoryId: routine.category_id,
        name: name,
        duration: `${duration} mins`,
        totalExercises: totalExercises,
        difficultyRating: difficultyRating,
        imageUri: imageUri
      })}
    >
      <Image source={{ uri: imageUri }} style={styles.routineThumbnail} />
      <View style={styles.routineDetailsGroup}>
        <Text style={styles.routineMainTitle}>{name}</Text>
        <Text style={styles.routineSubtext}>{duration} mins • {totalExercises} Exercises</Text>

        <View style={styles.intensityContainer}>
          {[1, 2, 3].map((boltIndex) => (
            <Icon
              key={boltIndex}
              name="flash"
              size={14}
              color={boltIndex <= difficultyRating ? "#5A8BFF" : "#E0E0E0"}
              style={styles.boltIcon}
            />
          ))}
        </View>

        <View style={styles.historyCapsule}>
          <Text style={styles.historyText}>{lastPlayedText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── MAIN SCREEN COMPONENT ───────────────────────────────────────────────────

const MOCK_BEGINNER_CARDS = [
  { id: "WK_ABS_01", title: "Core Basics", duration: "10 mins", exercises: 8, imageUri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200" },
  { id: "WK_ARM_01", title: "Light Arms", duration: "12 mins", exercises: 10, imageUri: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200" },
  { id: "WK_LEG_01", title: "Easy Squats", duration: "15 mins", exercises: 9, imageUri: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200" },
];

const MOCK_PROMO_BANNER = {
  imageUri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600"
};

const MOCK_RECOMMENDED_ROWS = [
  { id: "WK_ABS_01", title: "Quick HIIT Starter", subtext: "10 mins • Beginner", imageUri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150" },
  { id: "WK_ARM_01", title: "Core Sculpt Express", subtext: "12 mins • Intermediate", imageUri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150" },
];

const WorkoutTracker = ({ navigation }) => {
  const { userData } = useUser();
  const [selectedBodyFocus, setSelectedBodyFocus] = useState('Abs');
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar and history states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  const [recommendedExercises, setRecommendedExercises] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchData = async () => {
        try {
          const user = auth().currentUser;
          if (!user) return;

          const now = new Date();
          if (active) {
            setCurrentDate(now);
          }

          // 1. Fetch templates
          const response = await axios.get(`${api_call}/WorkoutTemplates`);
          if (active) {
            setWorkoutTemplates(Array.isArray(response.data) ? response.data : []);
          }

          // 2. Fetch workout history (use cache-busting timestamp to fix logs not updating)
          const historyRes = await fetch(`${api_call}/WorkoutTemplates/history?_t=${Date.now()}`, {
            headers: { 'firebase-uid': user.uid }
          });
          const historyData = await historyRes.json();
          if (active && historyData.success && historyData.data) {
            setWorkoutHistory(historyData.data);
          }

          // 3. Fetch recommended exercises based on user's goal
          const userGoal = (userData?.goal || '').toLowerCase();
          let bodyPartFilter = 'All';
          if (userGoal.includes('chest')) bodyPartFilter = 'Chest';
          else if (userGoal.includes('arm')) bodyPartFilter = 'Arm';
          else if (userGoal.includes('leg')) bodyPartFilter = 'Leg';
          else if (userGoal.includes('core') || userGoal.includes('abs')) bodyPartFilter = 'Abs';
          else if (userGoal.includes('back')) bodyPartFilter = 'Back';

          const recRes = await fetch(`${api_call}/Exercise?bodyPart=${bodyPartFilter}`);
          const recData = await recRes.json();
          if (active && Array.isArray(recData)) {
            setRecommendedExercises(recData.slice(0, 3));
          }
        } catch (err) {
          console.log("Error loading workout templates, history & recommendations:", err);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        active = false;
      };
    }, [userData])
  );

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#5A8BFF" />
        <Text style={styles.loadingText}>Loading Routines...</Text>
      </View>
    );
  }

  const filteredRoutines = workoutTemplates.filter(routine =>
    routine.category_id?.toString().toLowerCase().includes(selectedBodyFocus.toLowerCase()) ||
    routine.title?.toString().toLowerCase().includes(selectedBodyFocus.toLowerCase())
  );

  const displayedRoutines = filteredRoutines.slice(0, 3);

  // ─── Calendar Render (7-day Strip) ───
  const renderCalendar = () => {
    // Generate 7 days (6 before, today)
    const dates = [];
    for (let i = -6; i <= 0; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }

    return (
      <View style={styles.calendarStripContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {dates.map((date, index) => {
            const isSelected = selectedCalendarDate.getDate() === date.getDate() && 
                               selectedCalendarDate.getMonth() === date.getMonth() && 
                               selectedCalendarDate.getFullYear() === date.getFullYear();
            
            const hasWorkout = workoutHistory.some(log => {
              const logDate = new Date(log.date || log.createdAt);
              return logDate.getDate() === date.getDate() && 
                     logDate.getMonth() === date.getMonth() && 
                     logDate.getFullYear() === date.getFullYear();
            });

            return (
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.8}
                onPress={() => setSelectedCalendarDate(date)}
                style={[
                  styles.dayCell, 
                  isSelected && styles.dayCellSelected,
                  hasWorkout && !isSelected && styles.dayCellHasWorkout
                ]}
              >
                <Text style={[styles.dayCellName, isSelected && styles.dayCellTextSelected]}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>
                  {date.getDate()}
                </Text>
                {hasWorkout && (
                  <View style={[styles.workoutDot, isSelected && styles.workoutDotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const selectedDayLogs = workoutHistory.filter(log => {
    const logDate = new Date(log.date || log.createdAt);
    return logDate.getDate() === selectedCalendarDate.getDate() && 
           logDate.getMonth() === selectedCalendarDate.getMonth() && 
           logDate.getFullYear() === selectedCalendarDate.getFullYear();
  });

  const selectedDayCalories = selectedDayLogs.reduce((acc, log) => acc + (log.summary?.totalCaloriesBurned || log.caloriesBurned || 0), 0);
  const selectedDayMins = selectedDayLogs.reduce((acc, log) => acc + (log.durationMins || 0), 0);
  const selectedDayWorkoutsCount = selectedDayLogs.length;

  const formatActiveTime = (mins) => {
    if (!mins) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <FlatList
        data={displayedRoutines}
        keyExtractor={(item) => item.workout_id}
        renderItem={({ item }) => (
          <RoutineCard
            navigation={navigation}
            routine={item}
          />
        )}
        contentContainerStyle={styles.flatListContent}

        ListHeaderComponent={() => (
          <View>
            <View style={styles.header}>
              <View style={styles.textColumn}>
                <Text style={styles.greetingSubheading}>Ready to train, {userData?.firstName || userData?.goal || 'Athlete'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.exerciseSearchBar}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ExerciseRecommendation')}
            >
              <Icon name="magnify" size={20} color="#5A8BFF" />
              <Text style={styles.exerciseSearchPlaceholder}>Search exercises...</Text>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <StatPill
                icon="fire"
                value={String(Math.round(selectedDayCalories))}
                label="kcal burned"
                bgcolor="#FFF3E0"
                iconcolor="#E67E22"
              />
              <StatPill
                icon="clock-outline"
                value={formatActiveTime(selectedDayMins)}
                label="active time"
                bgcolor="#EBF1FF"
                iconcolor="#5A8BFF"
              />
              <StatPill
                icon="trophy-outline"
                value={String(selectedDayWorkoutsCount)}
                label="completed"
                bgcolor="#EAF7EE"
                iconcolor="#2ECC71"
              />
            </View>

            {/* 7-Day Calendar Strip */}
            <View style={styles.sectionHeader}>
              <Text style={styles.innerSectionTitle}>Your Activity</Text>
            </View>
            {renderCalendar()}

            {selectedDayLogs.length > 0 ? (
              <View style={styles.selectedLogsContainer}>
                <Text style={styles.logsSectionTitle}>Workouts on {selectedCalendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                {selectedDayLogs.map((log, idx) => (
                  <View key={log._id || idx} style={styles.logItemCard}>
                    <Icon name="check-circle" size={18} color="#2ECC71" style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logItemTitle}>{log.title || 'Workout'}</Text>
                      <Text style={styles.logItemMeta}>{log.durationMins || 0} mins • {log.workoutType} • {log.summary?.totalCaloriesBurned || 0} kcal</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noLogsContainer}>
                <Text style={styles.noLogsText}>No workouts recorded on this day.</Text>
              </View>
            )}

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.challengeCarouselPadding}
            >
              <View style={styles.challengeHeroCard}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60' }}
                  style={styles.challengeImageBg}
                />
                <View style={styles.challengeOverlayGradient}>
                  <Text style={styles.challengeDurationTag}>28 DAYS</Text>
                  <Text style={styles.challengeMainTitle}>FULL BODY{"\n"}CHALLENGE</Text>
                  <Text style={styles.challengeSubtitle}>Start your body-toning journey to target all muscle groups!</Text>
                  <TouchableOpacity style={styles.challengeStartButton} activeOpacity={0.9}>
                    <Text style={styles.challengeStartButtonText}>START</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.subHeading}>For Beginners</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portraitCardScrollGap}
              >
                {MOCK_BEGINNER_CARDS.map((card) => (
                  <PortraitSquareCard
                    key={card.id}
                    title={card.title}
                    imageUri={card.imageUri}
                    onPress={() => navigation.navigate('AbsBeginnerScreen', {
                      workoutId: card.id,
                      name: card.title,
                      duration: card.duration,
                      totalExercises: card.exercises,
                      imageUri: card.imageUri
                    })}
                  />
                ))}
              </ScrollView>
            </View>

            <Text style={styles.subHeading}>Body Focus</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {BODY_FOCUS_CATEGORIES.map((focusGroup) => (
                <BodyFocusTab
                  key={focusGroup}
                  label={focusGroup}
                  selected={selectedBodyFocus === focusGroup}
                  onPress={() => setSelectedBodyFocus(focusGroup)}
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.innerSectionTitle}>{selectedBodyFocus} Routines</Text>
              <Text style={styles.sectionCount}>{displayedRoutines.length} items listed</Text>
            </View>
          </View>
        )}

        ListFooterComponent={() => (
          <View style={{ paddingBottom: 40 }}>
            <View style={styles.footerSpacing} />

            <TouchableOpacity
              style={styles.recBanner}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ExerciseRecommendation')}
            >
              <Icon name="lightning-bolt" size={28} color="#fff" />
              <View style={styles.recBannerTextCol}>
                <Text style={styles.recBannerTitle}>Recommended for You</Text>
                <Text style={styles.recBannerSub}>Personalised based on your goal</Text>
              </View>
              <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            {recommendedExercises.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={styles.recExCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('SpecificWorkoutPage', {
                  exercise: {
                    exercise_id: {
                      name: ex.name,
                      sets_reps_default: {
                        sets: ex.sets,
                        reps: ex.reps ? parseInt(ex.reps) : null,
                        duration_seconds: ex.duration ? parseInt(ex.duration) : null,
                      }
                    },
                    imageUri: ex.imageUri,
                    emoji: ex.bodyPart === 'Abs' ? '🧘' : ex.bodyPart === 'Arm' ? '💪' : '🏋️',
                  },
                  workoutTitle: ex.name,
                  workoutId: null,
                  workoutExercises: null,
                  exerciseIndex: 0,
                })}
              >
                <Image source={{ uri: ex.imageUri }} style={styles.recExImage} />
                <View style={styles.recExInfo}>
                  <Text style={styles.recExName}>{ex.name}</Text>
                  <Text style={styles.recExMeta}>{ex.bodyPart} · {ex.type} · {ex.difficulty}</Text>
                  <View style={styles.recExRow}>
                    <Icon name="fire" size={13} color="#FF5A5A" />
                    <Text style={styles.recExKcal}>{ex.kcalPer30} kcal/30min</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>
            ))}

            <PromoBannerCard
              countLabel="LIMITED OFFER"
              heading="Unlock Pro Personalized Coaching Plans"
              imageUri={MOCK_PROMO_BANNER.imageUri}
              onPress={() => console.log('Promo Banner Clicked')}
            />

            <Text style={[styles.subHeading, { marginBottom: 10 }]}>Recommended Rows</Text>
            {MOCK_RECOMMENDED_ROWS.map((row) => (
              <RowWorkoutCard
                key={row.id}
                title={row.title}
                subtext={row.subtext}
                imageUri={row.imageUri}
                onPress={() => navigation.navigate('AbsBeginnerScreen', {
                  workoutId: row.id, name: row.title,
                  duration: row.subtext, totalExercises: 12, imageUri: row.imageUri
                })}
              />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// ─── STYLES BLOCK ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#9E9E9E', fontFamily: 'Montserrat-Medium' },
  flatListContent: { paddingBottom: 20 },
  footerSpacing: { height: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    width: '100%',
  },
  textColumn: { flexDirection: 'column' },
  greetingSubheading: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.5,
  },
  portraitCardScrollGap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  headerRightButtons: { flexDirection: 'row', alignItems: 'center' },
  streakFireIcon: { marginRight: 12 },
  proBadgeContainer: {
    backgroundColor: '#FFEAD2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proBadgeText: { color: '#E67E22', fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, gap: 8 },
  statPill: { flex: 1, flexDirection: 'column', alignItems: 'flex-start', borderRadius: 16, padding: 12 },
  pillIconCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statPillText: { width: '100%' },
  statValue: { fontSize: 15, fontFamily: 'Montserrat-Bold', fontWeight: '700', color: '#2D3142' },
  statLabel: { fontSize: 10, color: '#8A8F99', fontFamily: 'Montserrat-Medium', marginTop: 1 },

  challengeCarouselPadding: { paddingHorizontal: 20, marginTop: 20 },
  challengeHeroCard: {
    width: width - 40,
    height: 185,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F56FF'
  },
  challengeImageBg: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.4, position: 'absolute' },
  challengeOverlayGradient: { flex: 1, padding: 18, justifyContent: 'center' },
  challengeDurationTag: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12 },
  challengeMainTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', fontFamily: 'Montserrat-Bold', marginTop: 2, lineHeight: 26 },
  challengeSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, maxWidth: '75%' },
  challengeStartButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2
  },
  challengeStartButtonText: { color: '#0F56FF', fontWeight: '800', fontSize: 13 },

  subHeading: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#111111',
    marginLeft: 20,
    marginTop: 26
  },
  categoryScroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, gap: 8 },
  categoryTab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F4F5F7', borderWidth: 1, borderColor: 'transparent' },
  categoryTabActive: { backgroundColor: '#EBF1FF', borderColor: '#5A8BFF' },
  categoryTabText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#8A8F99', fontWeight: '600' },
  categoryTabTextActive: { color: '#5A8BFF', fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, marginTop: 14, marginBottom: 12 },
  innerSectionTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', fontWeight: '700', color: '#111111' },
  sectionCount: { fontSize: 12, fontFamily: 'Montserrat-Regular', color: '#9E9E9E' },

  routineCardContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 16, alignItems: 'center' },
  routineThumbnail: { width: 78, height: 78, borderRadius: 18, backgroundColor: '#F4F5F7' },
  routineDetailsGroup: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  routineMainTitle: { fontSize: 16, fontWeight: '700', color: '#111111', fontFamily: 'Montserrat-Bold' },
  routineSubtext: { fontSize: 13, color: '#8A8F99', marginTop: 2, fontFamily: 'Montserrat-Medium' },
  intensityContainer: { flexDirection: 'row', marginTop: 4 },
  boltIcon: { marginRight: 2 },
  historyCapsule: { backgroundColor: '#F4F5F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 6 },
  historyText: { fontSize: 11, color: '#A0A5B0', fontWeight: '600' },

  exerciseSearchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 16, height: 48,
    backgroundColor: '#F4F5F7', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E0E8FF',
  },
  exerciseSearchPlaceholder: { flex: 1, fontSize: 14, color: '#999' },
  
  recBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#5A8BFF', marginHorizontal: 20, borderRadius: 18,
    padding: 16, marginBottom: 12,
  },
  recBannerTextCol: { flex: 1 },
  recBannerTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  recBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

  recExCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 14, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  recExImage: { width: 60, height: 60, borderRadius: 12 },
  recExInfo: { flex: 1 },
  recExName: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  recExMeta: { fontSize: 11, color: '#999', textTransform: 'capitalize' },
  recExRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  recExKcal: { fontSize: 11, color: '#FF5A5A' },
  
  calendarStripContainer: { marginBottom: 16, marginTop: 10 },
  dayCell: {
    width: 54, height: 74, minWidth: 54, borderRadius: 16, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9'
  },
  dayCellSelected: { backgroundColor: '#0066EE', borderColor: '#0066EE' },
  dayCellHasWorkout: { backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' },
  dayCellName: { color: '#94A3B8', fontSize: 12, fontFamily: 'Montserrat-Medium', textTransform: 'uppercase' },
  dayCellText: { color: '#334155', fontSize: 16, fontFamily: 'Montserrat-Bold', fontWeight: '700', marginTop: 2 },
  dayCellTextSelected: { color: '#FFFFFF' },
  workoutDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#0066EE', marginTop: 6 },
  workoutDotSelected: { backgroundColor: '#FFFFFF' },

  selectedLogsContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  logItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  logItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  logItemMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  noLogsContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noLogsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default WorkoutTracker;