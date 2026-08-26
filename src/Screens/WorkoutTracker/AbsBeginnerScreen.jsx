import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ImageBackground
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.40;
const SHEET_OVERLAP = 24;

import api_call from '../../../api';

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavButton = ({ icon, onPress }) => (
  <TouchableOpacity style={styles.navBtn} onPress={onPress} activeOpacity={0.75}>
    <Icon name={icon} size={22} color="#FFFFFF" />
  </TouchableOpacity>
);

const StatCard = ({ value, label }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const DragHandle = () => (
  <View style={styles.dragHandle}>
    <View style={styles.dragLine} />
    <View style={styles.dragLine} />
    <View style={styles.dragLine} />
  </View>
);

const ExerciseRow = ({ exercise, onPress }) => (
  <TouchableOpacity style={styles.exerciseRow} onPress={onPress} activeOpacity={0.75}>
    <DragHandle />
    <View style={[styles.exerciseThumb, { backgroundColor: exercise.bgColor || '#DCF0FA' }]}>
      <Text style={styles.exerciseEmoji}>{exercise.emoji || '🏋️'}</Text>
    </View>
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{exercise.exercise_id?.name || 'Exercise'}</Text>
      <Text style={styles.exerciseMetric}>
        {exercise.reps ? `x${exercise.reps}` : (exercise.duration_seconds ? `00:${exercise.duration_seconds.toString().padStart(2, '0')}` : 'x10')}
      </Text>
    </View>
    <View style={styles.swapBtn}>
      <Icon name="chevron-right" size={24} color="#AAAAAA" />
    </View>
  </TouchableOpacity>
);

// ─── Main Screen Component ────────────────────────────────────────────────────

const AbsBeginnerScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { name, duration, totalExercises, imageUri, workoutId } = route.params || {};

  const [routineData, setRoutineData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await fetch(`${api_call}/WorkoutTemplates/${workoutId}`);
        const data = await res.json();
        setRoutineData(data);
      } catch (err) {
        console.error('Error fetching routine:', err);
      } finally {
        setLoading(false);
      }
    };
    if (workoutId) fetchRoutine();
    else setLoading(false);
  }, [workoutId]);

  const openExerciseDetail = (exerciseItem, index) => {
    navigation.navigate('SpecificWorkoutPage', {
      exercise: exerciseItem,
      workoutTitle: name,
      workoutId,
      workoutExercises: routineData?.exercises_sequence || [],
      exerciseIndex: index,
    });
  };

  const displayWorkoutData = routineData?.exercises_sequence || [];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ══════════════════ HERO SECTION ══════════════════ */}
      <View style={[styles.hero, { height: HERO_HEIGHT }]}>
        {imageUri ? (
          <ImageBackground source={{ uri: imageUri }} style={styles.heroPlaceholder}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
          </ImageBackground>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderEmoji}>💪</Text>
          </View>
        )}

        <View style={[styles.navRow, { top: insets.top + 10 }]}>
          <NavButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <NavButton icon="dots-vertical" onPress={() => {}} />
        </View>
      </View>

      {/* ══════════════════ SCROLLABLE CONTENT SHEET ══════════════════ */}
      <View style={styles.sheetOuter}>
        <ScrollView
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={Platform.OS === 'ios'}
        >
          {/* Title passed from chosen card selection */}
          <Text style={styles.title}>{name || 'Abs Workout'}</Text>

          {/* Stats Metrics Row layout */}
          <View style={styles.statsRow}>
            <StatCard value={duration || '15 mins'} label="Duration" />
            <StatCard value={String(totalExercises || displayWorkoutData.length)} label="Exercises" />
          </View>

         
          <View style={styles.exercisesHeader}>
            <Text style={styles.exercisesLabel}>Exercises</Text>
            <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.editText}>Edit </Text>
              <Icon name="chevron-right" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {displayWorkoutData.map((exerciseItem, index) => (
            <React.Fragment key={exerciseItem._id || index}>
              <ExerciseRow
                exercise={exerciseItem}
                onPress={() => openExerciseDetail(exerciseItem, index)}
              />
              {index < displayWorkoutData.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      {/* ══════════════════ START BUTTON (fixed bottom) ══════════════════ */}
      <View style={[styles.startWrapper, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (displayWorkoutData[0]) openExerciseDetail(displayWorkoutData[0], 0);
          }}
        >
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: { width: '100%', backgroundColor: '#111111', overflow: 'hidden' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C2E' },
  heroPlaceholderEmoji: { fontSize: 72, marginBottom: 8 },
  navRow: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0, 0, 0, 0.38)', alignItems: 'center', justifyContent: 'center' },
  sheetOuter: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -SHEET_OVERLAP, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6 }, android: { elevation: 6 } }) },
  sheetContent: { paddingHorizontal: 22, paddingTop: 26 },
  title: { fontSize: 28, fontWeight: '800', color: '#111111', letterSpacing: -0.6, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  statCard: { flex: 1, backgroundColor: '#F3F3F3', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 14, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111111', marginBottom: 3 },
  statLabel: { fontSize: 13, color: '#999999', fontWeight: '400' },
  coachRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5E5' },
  coachLabel: { fontSize: 16, fontWeight: '600', color: '#111111' },
  coachRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coachAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coachAvatarEmoji: { fontSize: 22, lineHeight: 28 },
  exercisesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, paddingBottom: 6 },
  exercisesLabel: { fontSize: 16, fontWeight: '700', color: '#111111' },
  editText: { fontSize: 15, color: '#2563EB', fontWeight: '500' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  dragHandle: { width: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12, gap: 3 },
  dragLine: { width: 16, height: 2, borderRadius: 1, backgroundColor: '#CCCCCC', marginVertical: 1.5 },
  exerciseThumb: { width: 66, height: 66, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, overflow: 'hidden' },
  exerciseEmoji: { fontSize: 30 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 4 },
  exerciseMetric: { fontSize: 14, color: '#888888', fontWeight: '400' },
  swapBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#EBEBEB', marginLeft: 46 },
  startWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#FFFFFF', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.07, shadowRadius: 10 }, android: { elevation: 10 } }) },
  startBtn: { backgroundColor: '#2563EB', borderRadius: 32, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 }, android: { elevation: 8 } }) },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 }
});

export default AbsBeginnerScreen;