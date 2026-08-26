import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import api_call from '../../../api';
import {
  getExerciseDetail,
  getPoseConfigForExercise,
} from './data/exercisePoseConfigs';
import { mapApiPoseConfig } from './utils/poseAnalyzer';
import { useUser } from '../../../UserContext';
import auth from '@react-native-firebase/auth';

const SpecificWorkoutPage = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { userData, setUserData } = useUser();
  const {
    exercise,
    workoutTitle,
    workoutId,
    workoutExercises,
    exerciseIndex,
  } = route.params ?? {};

  // Database exercise object is populated in exercise.exercise_id
  const exDetails = exercise?.exercise_id || {};
  const exerciseName = exDetails.name ?? 'Exercise';
  const detail = getExerciseDetail(exerciseName);

  const [poseConfig, setPoseConfig] = useState(getPoseConfigForExercise(exerciseName));
  const [loadingConfig, setLoadingConfig] = useState(false);

  const targetReps = exercise?.reps || exDetails.sets_reps_default?.reps || detail.targetReps || 12;
  const targetDurationSec = exercise?.duration_seconds || exDetails.sets_reps_default?.duration_seconds || detail.targetDurationSec;
  // QuickPose SDK supports all exercises (at minimum with body overlay)
  const supportsTracking = true;

  // Counter / Delay States
  const [prepareCount, setPrepareCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(targetDurationSec || 0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Start paused — user must press play
  const [isCompletedState, setIsCompletedState] = useState(false);

  // Format seconds as MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasNext = workoutExercises && exerciseIndex !== undefined && exerciseIndex < workoutExercises.length - 1;

  useEffect(() => {
    // Reset states on exercise change — keep paused so user starts intentionally
    setPrepareCount(3);
    setTimeLeft(targetDurationSec || 0);
    setElapsedSec(0);
    setIsPaused(true);
    setIsCompletedState(false);
  }, [exerciseName, targetDurationSec]);

  useEffect(() => {
    if (isPaused || isCompletedState) return;

    const interval = setInterval(() => {
      if (prepareCount > 0) {
        setPrepareCount(prev => prev - 1);
      } else {
        if (targetDurationSec) {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsCompletedState(true);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsedSec(prev => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prepareCount, isPaused, targetDurationSec, isCompletedState, exerciseName]);

  useEffect(() => {
    const fetchTracking = async () => {
      const id = detail.exerciseId ?? poseConfig?.exercise_id;
      if (!id) return;
      setLoadingConfig(true);
      try {
        const res = await axios.get(`${api_call}/Exercise/${id}/tracking`);
        if (res.data?.success && res.data?.data) {
          setPoseConfig(mapApiPoseConfig(res.data.data));
        }
      } catch {
        // Local config fallback is already set
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchTracking();
  }, [detail.exerciseId, poseConfig?.exercise_id]);

  const startLiveTracking = () => {
    navigation.navigate('QuickPoseLiveScreen', {
      exerciseName,
      exerciseId: detail.exerciseId ?? poseConfig?.exercise_id,
      targetReps: targetDurationSec ? null : targetReps,
      targetDurationSec,
      workoutTitle: workoutTitle ?? exerciseName,
      workoutId,
    });
  };

  const watchDemo = () => {
    const query = encodeURIComponent(exerciseName + ' exercise form tutorial');
    const youtubeUrl = detail.youtubeUrl || `https://www.youtube.com/results?search_query=${query}`;
    Linking.openURL(youtubeUrl).catch(() => {
      Alert.alert('Error', 'Could not open YouTube.');
    });
  };

  const handleComplete = async () => {
    if (hasNext) {
      const nextIdx = exerciseIndex + 1;
      const nextEx = workoutExercises[nextIdx];
      navigation.replace('SpecificWorkoutPage', {
        exercise: nextEx,
        workoutTitle,
        workoutId,
        workoutExercises,
        exerciseIndex: nextIdx,
      });
    } else {
      // Last exercise -> Log workout to backend
      try {
        const user = auth().currentUser;
        if (user) {
          // Send request to POST /WorkoutTemplates/log
          const totalDur = workoutExercises?.reduce((acc, curr) => acc + (curr.duration_seconds || 60), 0) / 60 || 15;
          const res = await fetch(`${api_call}/WorkoutTemplates/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'firebase-uid': user.uid },
            body: JSON.stringify({
              durationMins: Math.round(totalDur),
              workoutType: 'strength',
              title: workoutTitle || 'Workout',
              caloriesBurned: Math.round(totalDur * 5) // approx
            })
          });
          const resData = await res.json();
          if (resData.success && resData.stats) {
            setUserData(prev => ({ ...prev, stats: resData.stats }));
          }
        }
      } catch(e) {
        console.error("Failed to log workout:", e);
      }

      Alert.alert(
        '🏆 Workout Completed!',
        'Great job! You have completed all exercises in this workout session.',
        [{ text: 'Finish', onPress: () => navigation.navigate('WorkoutTracker') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <ImageBackground
          source={{ uri: exercise?.imageUri }}
          style={styles.heroBg}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
        </ImageBackground>

        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.heroEmojiWrap}>
          <Text style={styles.heroEmoji}>{exercise?.emoji ?? '💪'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionHeaderRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.title}>{exerciseName}</Text>
            <Text style={styles.subtitle}>
              {targetDurationSec ? `00:${targetDurationSec}` : `x${targetReps}`} • {detail.muscleGroup || 'Full Body'} • {detail.workoutType || 'Strength'}
            </Text>
          </View>
          <TouchableOpacity style={styles.demoPill} onPress={watchDemo} activeOpacity={0.8}>
            <Icon name="youtube" size={18} color="#FF0000" />
            <Text style={styles.demoPillText}>Demo</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active Timer/Counter Card ── */}
        <View style={styles.timerCard}>
          <View style={styles.timerHeader}>
            <Icon name="clock-outline" size={18} color="#0066EE" />
            <Text style={styles.timerTitle}>
              {prepareCount > 0 ? 'Get Ready' : targetDurationSec ? 'Time Remaining' : 'Active Time'}
            </Text>
          </View>
          <View style={styles.timerDisplayRow}>
            <Text style={styles.timerValue}>
              {prepareCount > 0
                ? formatTime(prepareCount)
                : targetDurationSec
                  ? formatTime(timeLeft)
                  : formatTime(elapsedSec)
              }
            </Text>
            <View style={styles.timerControls}>
              <TouchableOpacity
                style={styles.timerControlBtn}
                onPress={() => setIsPaused(prev => !prev)}
              >
                <Icon
                  name={isPaused ? 'play' : 'pause'}
                  size={18}
                  color="#0066EE"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timerControlBtn}
                onPress={() => {
                  if (targetDurationSec) setTimeLeft(targetDurationSec);
                  else setElapsedSec(0);
                  setPrepareCount(3);
                  setIsPaused(true); // Pause after reset — user re-starts manually
                  setIsCompletedState(false);
                }}
              >
                <Icon name="refresh" size={18} color="#0066EE" />
              </TouchableOpacity>
            </View>
          </View>
          {prepareCount > 0 && !isPaused && (
            <Text style={styles.prepareText}>Starting in {prepareCount}s...</Text>
          )}
          {isPaused && prepareCount === 3 && (
            <Text style={styles.prepareText}>Press ▶ to begin</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {targetDurationSec ? `${targetDurationSec}s` : `${targetReps} reps`}
            </Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{detail.targetSets ?? 3}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{supportsTracking ? 'AI' : 'Manual'}</Text>
            <Text style={styles.statLabel}>Tracking</Text>
          </View>
        </View>

        {supportsTracking ? (
          <View style={styles.aiBadge}>
            <Icon name="camera-iris" size={18} color="#2563EB" />
            <Text style={styles.aiBadgeText}>Live pose detection available</Text>
          </View>
        ) : (
          <View style={[styles.aiBadge, styles.aiBadgeMuted]}>
            <Icon name="information-outline" size={18} color="#888" />
            <Text style={[styles.aiBadgeText, { color: '#888' }]}>
              Manual tracking only for this exercise
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>How to perform</Text>
        {detail.instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        {detail.tips ? (
          <>
            <Text style={styles.sectionTitle}>Coach tip</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>{detail.tips}</Text>
            </View>
          </>
        ) : null}

        {loadingConfig ? (
          <ActivityIndicator style={{ marginTop: 16 }} color="#5A8BFF" />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {supportsTracking ? (
          <TouchableOpacity
            style={styles.liveBtn}
            activeOpacity={0.85}
            onPress={startLiveTracking}
          >
            <Icon name="video" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.liveBtnText}>Start Live Detection</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.manualBtn, styles.manualBtnFull]}
          activeOpacity={0.85}
          onPress={handleComplete}
        >
          <Icon name="check-bold" size={20} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.manualBtnTextWhite}>
            {hasNext ? 'Complete & Next' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  hero: { height: 220, backgroundColor: '#1C1C2E', position: 'relative' },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroImage: { opacity: 0.35 },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(28,28,46,0.5)' },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  heroEmojiWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 72 },
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 26,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 6, marginBottom: 20, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 17, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF1FF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
  },
  aiBadgeMuted: { backgroundColor: '#F4F5F7' },
  aiBadgeText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 12, marginTop: 8 },
  stepRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  stepText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
  tipCard: { backgroundColor: '#FFF8E7', borderRadius: 14, padding: 14, marginBottom: 10 },
  tipText: { color: '#8B6914', fontSize: 14, lineHeight: 21 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.07, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  liveBtn: {
    flexDirection: 'row',
    backgroundColor: '#0066EE',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  liveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  manualBtn: {
    flexDirection: 'row',
    backgroundColor: '#0066EE',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0066EE',
  },
  manualBtnFull: { backgroundColor: '#0066EE', borderColor: '#0066EE' },
  manualBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
  manualBtnTextWhite: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  actionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    alignSelf: 'center',
  },
  demoPillText: {
    color: '#FF0000',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  timerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  timerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  timerDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  timerControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  prepareText: {
    fontSize: 12,
    color: '#E53E3E',
    fontWeight: '600',
    marginTop: 8,
  },
});

export default SpecificWorkoutPage;
