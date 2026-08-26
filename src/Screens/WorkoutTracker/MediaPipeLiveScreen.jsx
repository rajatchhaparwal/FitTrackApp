/**
 * MediaPipeLiveScreen.jsx
 *
 * Drop-in replacement for QuickPoseLiveScreen.jsx.
 * Accepts identical route.params and has identical UI.
 *
 * Landmark source: MediaPipeWebView (BlazePose, full model)
 * Rep counting:    poseAnalyzer.analyzePoseFrame  +  createRepCounter
 * Config source:   exercisePoseConfigs.js (local fallback)
 *                  GET /Exercise/:id/tracking     (API, if available)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAuth } from '@react-native-firebase/auth';
import axios from 'axios';
import api_call from '../../../api';
import MediaPipeWebView from './MediaPipeWebView';
import {
  getPoseConfigForExercise,
  getExerciseDetail,
} from './data/exercisePoseConfigs';
import {
  analyzePoseFrame,
  createRepCounter,
  mapApiPoseConfig,
} from './utils/poseAnalyzer';

const { width } = Dimensions.get('window');

// ─── Instruction overlay (identical to QuickPoseLiveScreen) ──────────────────
const InstructionOverlay = ({ instructions, exerciseName, onReady }) => {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let current = 0;
    const advance = () => {
      if (current >= instructions.length) {
        onReady();
        return;
      }
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        current++;
        setStep(current);
        advance();
      });
    };
    advance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step >= instructions.length) return null;

  return (
    <View style={styles.instructionOverlay}>
      <View style={styles.instructionCard}>
        <View style={styles.instructionIconRow}>
          <View style={styles.instructionIconCircle}>
            <Icon name="robot-outline" size={28} color="#5A8BFF" />
          </View>
          <Text style={styles.instructionExName}>{exerciseName}</Text>
        </View>
        <Animated.Text style={[styles.instructionText, { opacity: fadeAnim }]}>
          {instructions[step]}
        </Animated.Text>
        <View style={styles.instructionDots}>
          {instructions.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={onReady}>
          <Text style={styles.skipText}>Skip →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MediaPipeLiveScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const {
    exerciseName = 'Exercise',
    exerciseId,
    targetReps = 12,
    targetDurationSec,
    workoutTitle,
    workoutId,
  } = route.params ?? {};

  // ── Exercise detail & instructions ─────────────────────────────────────────
  const detail = getExerciseDetail(exerciseName);
  const instructions = detail.instructions ?? [
    'Stand with your full body visible to the camera.',
    'Follow your normal form for this exercise.',
    'The AI will track your movement in real-time.',
  ];

  // ── Pose config (local fallback + API override) ─────────────────────────────
  const [poseConfig, setPoseConfig] = useState(
    getPoseConfigForExercise(exerciseName)
  );

  useEffect(() => {
    const id = exerciseId ?? detail.exerciseId ?? poseConfig?.exercise_id;
    if (!id) return;
    axios
      .get(`${api_call}/Exercise/${id}/tracking`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setPoseConfig(mapApiPoseConfig(res.data.data));
        }
      })
      .catch(() => {
        // Local fallback already set — no-op
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  // ── Android camera permission ────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'MyFitFly needs camera access for live pose detection.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Camera Permission Denied',
            'Live pose detection requires camera access. Please enable it in Settings.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (e) {
        console.warn('Camera permission error:', e);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rep counter (recreated if poseConfig changes) ───────────────────────────
  const repCounterRef = useRef(null);
  useEffect(() => {
    const thresholds = poseConfig?.metrics_calculation?.thresholds ?? {};
    repCounterRef.current = createRepCounter(thresholds);
  }, [poseConfig]);

  // ── Session state ───────────────────────────────────────────────────────────
  const [showInstructions, setShowInstructions] = useState(true);
  const [repCount, setRepCount]     = useState(0);
  const [formScore, setFormScore]   = useState(100);
  const [feedbackText, setFeedbackText] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDone, setSessionDone]     = useState(false);

  // Refs to avoid stale closures inside callbacks
  const sessionActiveRef = useRef(false);
  const sessionDoneRef   = useRef(false);
  const repCountRef      = useRef(0);
  const formScoreRef     = useRef(100);
  const elapsedRef       = useRef(0);

  useEffect(() => { sessionActiveRef.current = sessionActive; }, [sessionActive]);
  useEffect(() => { sessionDoneRef.current   = sessionDone; },   [sessionDone]);
  useEffect(() => { repCountRef.current      = repCount; },      [repCount]);
  useEffect(() => { formScoreRef.current     = formScore; },     [formScore]);

  const timerRef         = useRef(null);
  const bannerTimeoutRef = useRef(null);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionActive && !sessionDone) {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSec(elapsedRef.current);
        if (targetDurationSec && elapsedRef.current >= targetDurationSec) {
          clearInterval(timerRef.current);
          setSessionDone(true);
          setSessionActive(false);
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive, sessionDone, targetDurationSec]);

  // ── MediaPipe landmark callback ─────────────────────────────────────────────
  const handleLandmarks = useCallback((landmarks) => {
    if (!sessionActiveRef.current || sessionDoneRef.current) return;
    if (!repCounterRef.current || !poseConfig) return;

    const result = analyzePoseFrame(landmarks, poseConfig, repCounterRef.current);

    // Rep count update
    if (result.repCount !== repCountRef.current) {
      const newReps = result.repCount;
      repCountRef.current = newReps;
      setRepCount(newReps);

      // Auto-finish on rep goal
      if (targetReps && newReps >= targetReps && !sessionDoneRef.current) {
        clearInterval(timerRef.current);
        sessionDoneRef.current = true;
        setSessionDone(true);
        setSessionActive(false);
      }
    }

    // Form score update
    if (result.formScore !== formScoreRef.current) {
      formScoreRef.current = result.formScore;
      setFormScore(result.formScore);
    }

    // Live correction banners
    if (result.activeCorrections?.length > 0) {
      const banner = result.activeCorrections[0].ui_banner;
      setFeedbackText(banner);
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = setTimeout(() => setFeedbackText(null), 3000);
    }
  }, [poseConfig, targetReps]);

  // ── Finish session ──────────────────────────────────────────────────────────
  const finishSession = useCallback(async () => {
    clearInterval(timerRef.current);
    setSessionActive(false);
    setSessionDone(true);

    const durationMins = Math.max(1, Math.round(elapsedRef.current / 60));
    const finalReps    = repCountRef.current;
    const finalScore   = formScoreRef.current;

    try {
      const uid = getAuth().currentUser?.uid;
      if (uid) {
        await fetch(`${api_call}/WorkoutTemplates/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'firebase-uid': uid,
          },
          body: JSON.stringify({
            durationMins,
            workoutType: 'strength',
            title: workoutTitle || exerciseName,
            caloriesBurned: Math.round(durationMins * 6),
            poseData: { repCount: finalReps, formScore: finalScore },
          }),
        });
      }
    } catch (e) {
      console.warn('Workout log save failed (offline ok):', e?.message);
    }

    Alert.alert(
      '🏆 Session Complete!',
      `${exerciseName}\nReps: ${finalReps}\nForm Score: ${finalScore}%\nDuration: ${Math.round(elapsedRef.current)}s`,
      [{ text: 'Done', onPress: () => navigation.goBack() }],
    );
  }, [exerciseName, workoutTitle, navigation]);

  // Auto-finish when goals trigger sessionDone
  useEffect(() => {
    if (sessionDone && repCountRef.current > 0) {
      finishSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDone]);

  // ── Progress ────────────────────────────────────────────────────────────────
  const progress = targetReps
    ? Math.min(100, Math.round((repCount / targetReps) * 100))
    : targetDurationSec
      ? Math.min(100, Math.round((elapsedSec / targetDurationSec) * 100))
      : 0;

  const formatTime = (s) => {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── MediaPipe Camera Feed + Skeleton Overlay ── */}
      <MediaPipeWebView
        onLandmarks={handleLandmarks}
        active={sessionActive && !sessionDone}
      />

      {/* ── Top Bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.exerciseTitle} numberOfLines={1}>{exerciseName}</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTag}>LIVE AI TRACKING</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={finishSession}>
          <Icon name="check-bold" size={22} color="#4ADE80" />
        </TouchableOpacity>
      </View>

      {/* ── Instruction Overlay ── */}
      {showInstructions && (
        <InstructionOverlay
          instructions={instructions}
          exerciseName={exerciseName}
          onReady={() => {
            setShowInstructions(false);
            setSessionActive(true);
          }}
        />
      )}

      {/* ── Feedback Banner ── */}
      {feedbackText && !showInstructions ? (
        <View style={styles.feedbackBanner}>
          <Icon name="alert-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.feedbackText} numberOfLines={2}>{feedbackText}</Text>
        </View>
      ) : null}

      {/* ── Bottom Stats Panel ── */}
      {!showInstructions && (
        <View style={[styles.statsPanel, { paddingBottom: insets.bottom + 16 }]}>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🔁</Text>
              <Text style={styles.statValue}>
                {targetReps ? `${repCount}/${targetReps}` : repCount}
              </Text>
              <Text style={styles.statLabel}>Reps</Text>
            </View>

            <View style={styles.statBoxCenter}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={[styles.statValue, {
                color: formScore >= 80 ? '#4ADE80' : formScore >= 60 ? '#FBBF24' : '#F87171',
              }]}>
                {formScore}%
              </Text>
              <Text style={styles.statLabel}>Form Score</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>⏱</Text>
              <Text style={styles.statValue}>{formatTime(elapsedSec)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {targetReps
              ? `${repCount} of ${targetReps} reps`
              : targetDurationSec
                ? `${elapsedSec}s / ${targetDurationSec}s`
                : 'Tracking active — finish when ready'}
          </Text>

          {/* Finish Button */}
          <TouchableOpacity
            style={styles.finishBtn}
            activeOpacity={0.85}
            onPress={finishSession}
          >
            <Icon name="flag-checkered" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.finishBtnText}>Finish & Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Styles (identical to QuickPoseLiveScreen) ────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  iconBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  exerciseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  liveDot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 5,
  },
  liveTag: { color: '#4ADE80', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // Instructions
  instructionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,13,22,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    paddingHorizontal: 24,
  },
  instructionCard: {
    backgroundColor: 'rgba(19, 26, 42, 0.96)',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(90,139,255,0.3)',
  },
  instructionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionIconCircle: {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(90,139,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionExName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Montserrat-Bold',
    flex: 1,
  },
  instructionText: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 24,
    minHeight: 80,
  },
  instructionDots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { backgroundColor: '#5A8BFF', width: 18 },
  skipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(90,139,255,0.4)',
  },
  skipText: { color: '#5A8BFF', fontWeight: '700', fontSize: 14 },

  // Feedback banner
  feedbackBanner: {
    position: 'absolute',
    top: '18%',
    left: 20, right: 20,
    backgroundColor: 'rgba(239,68,68,0.92)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  feedbackText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    fontFamily: 'Montserrat-SemiBold',
  },

  // Stats panel
  statsPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(9,13,22,0.88)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(90,139,255,0.2)',
  },
  statsRow: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statBoxCenter: {
    flex: 1,
    backgroundColor: 'rgba(90,139,255,0.12)',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(90,139,255,0.25)',
  },
  statEmoji: { fontSize: 16, marginBottom: 4 },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Montserrat-Bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },

  // Progress
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5A8BFF',
    borderRadius: 3,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Montserrat-Medium',
  },

  // Finish button
  finishBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  finishBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
  },
});

export default MediaPipeLiveScreen;
