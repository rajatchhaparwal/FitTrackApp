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

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.40;
const SHEET_OVERLAP = 24;

// Global seed index of all potential exercises
const EXERCISES_DATABASE = [
  { id: 1,  name: 'Jumping Jacks',     category: 'Abs', metric: '00:20', bgColor: '#DCF0FA', emoji: '🙆‍♂️' },
  { id: 2,  name: 'Abdominal Crunches', category: "Abs", metric: 'x16',   bgColor: '#D7F5E3', emoji: '🏋️'   },
  { id: 3,  name: 'Russian Twist',      category: "Abs", metric: 'x20',   bgColor: '#FCE9D0', emoji: '🤸‍♂️' },
  { id: 4,  name: 'Plank',              category: "Abs", metric: '00:30', bgColor: '#E8DCFA', emoji: '🧘‍♂️' },
  { id: 5,  name: 'Leg Raises',         category: 'Arm', metric: 'x15',   bgColor: '#FAD7D7', emoji: '🦵'   },
  { id: 6,  name: 'Mountain Climbers',  category: 'abs', metric: '00:20', bgColor: '#D7F5E3', emoji: '🏃‍♂️' },
  { id: 7,  name: 'Bicycle Crunches',   category: 'abs', metric: 'x20',   bgColor: '#FCE9D0', emoji: '🚴‍♂️' },
  { id: 8,  name: 'Flutter Kicks',      category: 'abs', metric: '00:20', bgColor: '#DCF0FA', emoji: '🦵'   },
  { id: 9,  name: 'Reverse Crunches',   category: 'abs', metric: 'x15',   bgColor: '#FAD7EC', emoji: '💪'   },
  { id: 10, name: 'Side Plank Left',    category: 'Arm', metric: '00:20', bgColor: '#E9FAD7', emoji: '🧍‍♂️' },
  { id: 11, name: 'Side Plank Right',   category: "Abs", metric: '00:20', bgColor: '#DCF0FA', emoji: '🧍'   },
  { id: 12, name: 'V-Ups',              category: 'abs', metric: 'x12',   bgColor: '#FCE9D0', emoji: '✌️'   },
  { id: 13, name: 'Heel Touches',       category: 'abs', metric: 'x20',   bgColor: '#D7F5E3', emoji: '👆'   },
  { id: 14, name: 'Dead Bug',           category: 'abs', metric: 'x10',   bgColor: '#FAD7D7', emoji: '🐛'   },
  { id: 15, name: 'Bird Dog',           category: 'abs', metric: 'x10',   bgColor: '#E8DCFA', emoji: '🐾'   },
  { id: 16, name: 'High Knees',         category: 'abs', metric: '00:20', bgColor: '#FCE9D0', emoji: '🏃‍♀️' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavButton = ({ label, onPress }) => (
  <TouchableOpacity style={styles.navBtn} onPress={onPress} activeOpacity={0.75}>
    <Text style={styles.navBtnText}>{label}</Text>
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

const SwapIcon = () => (
  <View style={styles.swapWrap}>
    <Text style={styles.swapArrow}>↑</Text>
    <Text style={styles.swapArrow}>↓</Text>
  </View>
);

const ExerciseRow = ({ exercise }) => (
  <View style={styles.exerciseRow}>
    <DragHandle />
    <View style={[styles.exerciseThumb, { backgroundColor: exercise.bgColor }]}>
      <Text style={styles.exerciseEmoji}>{exercise.emoji}</Text>
    </View>
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseMetric}>{exercise.metric}</Text>
    </View>
    <TouchableOpacity style={styles.swapBtn} activeOpacity={0.6}>
      <SwapIcon />
    </TouchableOpacity>
  </View>
);

// ─── Main Screen Component ────────────────────────────────────────────────────

const AbsBeginnerScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();

  // Extract properties safely incoming from route parameters
  const { name, duration, totalExercises, imageUri , categoryId} = route.params || {};

  // FIXED: Filter from base array using clean logic safely matching criteria tag
  const displayWorkoutData = EXERCISES_DATABASE.filter(ex => ex.category ===  categoryId);

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
          <NavButton label="←" onPress={() => navigation.goBack()} />
          <NavButton label="⋮" onPress={() => {}} />
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

          <TouchableOpacity style={styles.coachRow} activeOpacity={0.7}>
            <Text style={styles.coachLabel}>Coach Video</Text>
            <View style={styles.coachRight}>
              <View style={styles.coachAvatar}>
                <Text style={styles.coachAvatarEmoji}>🧍‍♂️</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.exercisesHeader}>
            <Text style={styles.exercisesLabel}>Exercises</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.editText}>Edit  ›</Text>
            </TouchableOpacity>
          </View>


          {displayWorkoutData.map((exerciseItem, index) => (
            <React.Fragment key={exerciseItem.id}>
              <ExerciseRow exercise={exerciseItem} />
              {index < displayWorkoutData.length - 1 && (
                <View style={styles.separator} />
              )}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      {/* ══════════════════ START BUTTON (fixed bottom) ══════════════════ */}
      <View style={[styles.startWrapper, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... keep your layout stylesheet exact same down below
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: { width: '100%', backgroundColor: '#111111', overflow: 'hidden' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C2E' },
  heroPlaceholderEmoji: { fontSize: 72, marginBottom: 8 },
  navRow: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0, 0, 0, 0.38)', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', lineHeight: 20 },
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
  chevron: { fontSize: 22, color: '#AAAAAA', fontWeight: '300', lineHeight: 24 },
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
  swapWrap: { alignItems: 'center', justifyContent: 'center' },
  swapArrow: { fontSize: 11, color: '#BBBBBB', lineHeight: 13, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#EBEBEB', marginLeft: 46 },
  startWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#FFFFFF', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.07, shadowRadius: 10 }, android: { elevation: 10 } }) },
  startBtn: { backgroundColor: '#2563EB', borderRadius: 32, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 }, android: { elevation: 8 } }) },
  startText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 }
});

export default AbsBeginnerScreen;