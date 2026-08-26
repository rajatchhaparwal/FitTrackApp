import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import api_call from '../../../api';
import { useUser } from '../../../UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 170;

const COLORS = {
  primary: '#0066EE',
  primaryLight: '#EBF1FF',
  secondary: '#5A8BFF',
  card: '#FFFFFF',
  bg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
};

// Calculate BMI & Category
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return { bmi: '0.0', category: 'N/A', color: COLORS.textMuted };
  const heightM = heightCm / 100;
  const bmiVal = (weightKg / (heightM * heightM)).toFixed(1);
  let category = 'Normal';
  let color = '#10B981';

  if (bmiVal < 18.5) {
    category = 'Underweight';
    color = '#3B82F6';
  } else if (bmiVal >= 25 && bmiVal < 30) {
    category = 'Overweight';
    color = '#F59E0B';
  } else if (bmiVal >= 30) {
    category = 'Obese';
    color = '#EF4444';
  }

  return { bmi: bmiVal, category, color };
};

// ── Native View-based Weight Trend Chart ──────────────────────────────────────
const WeightChart = ({ history, targetWeight, goalType, mainColor }) => {
  if (!history || history.length === 0) {
    return (
      <View style={chartStyles.emptyContainer}>
        <Icon name="scale-off" size={36} color={COLORS.textMuted} />
        <Text style={chartStyles.emptyText}>No weight logs recorded yet.</Text>
      </View>
    );
  }

  const weights = history.map(h => Number(h.weight) || 0);
  const validTarget = Number(targetWeight) || weights[weights.length - 1] || 70;
  const allValues = [...weights, validTarget].filter(v => v > 0);
  const minW = Math.max(Math.floor(Math.min(...allValues)) - 2, 0);
  const maxW = Math.ceil(Math.max(...allValues)) + 2;
  const range = Math.max(maxW - minW, 1);

  // Target line position
  const targetPct = (validTarget - minW) / range;
  const targetBottom = Math.min(Math.max(targetPct * CHART_HEIGHT, 10), CHART_HEIGHT - 10);

  return (
    <View style={chartStyles.container}>
      {/* Y-Axis Labels */}
      <View style={chartStyles.yAxis}>
        <Text style={chartStyles.yLabel}>{maxW} kg</Text>
        <Text style={chartStyles.yLabel}>{Math.round((maxW + minW) / 2)} kg</Text>
        <Text style={chartStyles.yLabel}>{minW} kg</Text>
      </View>

      {/* Chart Area */}
      <View style={chartStyles.canvas}>
        {/* Horizontal grid lines */}
        <View style={[chartStyles.gridLine, { bottom: CHART_HEIGHT }]} />
        <View style={[chartStyles.gridLine, { bottom: CHART_HEIGHT / 2 }]} />
        <View style={[chartStyles.gridLine, { bottom: 0 }]} />

        {/* Target Weight Dotted Line */}
        {validTarget > 0 && (
          <View style={[chartStyles.targetLine, { bottom: targetBottom }]}>
            <View style={[chartStyles.targetBadge, { backgroundColor: mainColor }]}>
              <Text style={chartStyles.targetBadgeText}>Target: {validTarget}kg</Text>
            </View>
            <View style={[chartStyles.targetDash, { borderColor: mainColor }]} />
          </View>
        )}

        {/* Data Columns */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chartStyles.pointsRow}>
          {history.map((entry, idx) => {
            const val = Number(entry.weight) || 0;
            const hPct = (val - minW) / range;
            const barH = Math.max(hPct * CHART_HEIGHT, 10);
            const dateObj = new Date(entry.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isLast = idx === history.length - 1;

            return (
              <View key={idx} style={chartStyles.column}>
                <Text style={[chartStyles.pointValue, isLast && { color: mainColor, fontWeight: '800' }]}>
                  {val}
                </Text>
                <View style={chartStyles.barTrack}>
                  <View
                    style={[
                      chartStyles.barFill,
                      {
                        height: barH,
                        backgroundColor: isLast ? mainColor : `${mainColor}66`,
                      },
                    ]}
                  />
                </View>
                <Text style={[chartStyles.xLabel, isLast && { color: mainColor, fontWeight: '700' }]}>
                  {dateStr}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const ProgressHistoryScreen = ({ navigation }) => {
  const { userData, setUserData, updateUserProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    currentWeight: 0,
    targetWeight: 0,
    height: 170,
    goal: 'weight_loss',
    history: [],
  });

  // Selected Goal State
  const [selectedGoalKey, setSelectedGoalKey] = useState('weight_loss');

  // Modal State for logging weight
  const [modalVisible, setModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputTargetWeight, setInputTargetWeight] = useState('');
  const [inputNotes, setInputNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWeightData = useCallback(async () => {
    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${api_call}/User/weight-history`, {
        headers: { 'firebase-uid': user.uid },
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        const rawGoal = userData?.goal || json.goal || 'weight_loss';
        setSelectedGoalKey(rawGoal);

        setData({
          currentWeight: json.currentWeight || userData?.weight || 70,
          targetWeight: json.targetWeight || userData?.targetWeight || (json.currentWeight ? json.currentWeight - 5 : 65),
          height: json.height || userData?.height || 170,
          goal: rawGoal,
          history: json.history || [],
        });

        setInputWeight(String(json.currentWeight || userData?.weight || ''));
        setInputTargetWeight(String(json.targetWeight || ''));
      }
    } catch (err) {
      console.warn('Weight history fetch fallback triggered:', err.message);
      if (userData) {
        const fallbackGoal = userData.goal || 'weight_loss';
        setSelectedGoalKey(fallbackGoal);
        const curW = Number(userData.weight) || 70;
        const isLoss = fallbackGoal.toLowerCase().includes('loss');
        const tarW = Number(userData.targetWeight) || (isLoss ? Math.round(curW - 5) : Math.round(curW + 5));
        setData({
          currentWeight: curW,
          targetWeight: tarW,
          height: Number(userData.height) || 170,
          goal: fallbackGoal,
          history: [{ weight: curW, date: new Date(), notes: 'Current Weight' }],
        });
        setInputWeight(String(curW));
        setInputTargetWeight(String(tarW));
      }
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useFocusEffect(
    useCallback(() => {
      fetchWeightData();
    }, [fetchWeightData])
  );

  // Handle Switching Goal Mode
  const handleGoalSwitch = async (newGoalKey) => {
    setSelectedGoalKey(newGoalKey);

    // Calculate default target weight based on new goal if needed
    let newTarget = data.targetWeight;
    const curW = data.currentWeight || 70;
    if (newGoalKey === 'weight_loss' && (newTarget >= curW || !newTarget)) {
      newTarget = Math.round(curW - 5);
    } else if (newGoalKey === 'weight_gain' && (newTarget <= curW || !newTarget)) {
      newTarget = Math.round(curW + 5);
    } else if (newGoalKey === 'maintenance') {
      newTarget = curW;
    }

    setData(prev => ({ ...prev, goal: newGoalKey, targetWeight: newTarget }));
    setInputTargetWeight(String(newTarget));

    // Save to user profile backend
    try {
      await updateUserProfile({ goal: newGoalKey, targetWeight: newTarget });
    } catch (err) {
      console.warn('Failed to sync goal change:', err);
    }
  };

  const handleLogWeight = async () => {
    const numW = parseFloat(inputWeight);
    if (!numW || isNaN(numW) || numW < 20 || numW > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kg (e.g. 72.5).');
      return;
    }

    const numTarget = inputTargetWeight ? parseFloat(inputTargetWeight) : data.targetWeight;

    try {
      setSubmitting(true);
      const user = auth().currentUser;
      if (!user) return;

      const body = {
        weight: numW,
        targetWeight: numTarget,
        notes: inputNotes,
      };

      const res = await fetch(`${api_call}/User/weight-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'firebase-uid': user.uid,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        setUserData(prev => ({ ...prev, weight: numW, targetWeight: numTarget }));
        setModalVisible(false);
        setInputNotes('');
        fetchWeightData();
        Alert.alert('Success', 'Weight update saved!');
      } else {
        throw new Error(json.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Error logging weight:', err);
      Alert.alert('Error', 'Could not save weight log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading progress history…</Text>
      </View>
    );
  }

  // Determine Goal Type
  const goalStr = (selectedGoalKey || '').toLowerCase();
  let goalType = 'loss';
  if (goalStr.includes('gain') || goalStr.includes('muscle')) {
    goalType = 'gain';
  } else if (goalStr.includes('maintain') || goalStr.includes('plan') || goalStr.includes('modify')) {
    goalType = 'maintain';
  }

  const mainColor = COLORS.primary;
  const mainBg = COLORS.primaryLight;
  const goalTitle = goalType === 'gain' ? 'Weight & Muscle Gain Goal' : goalType === 'maintain' ? 'Weight Maintenance Goal' : 'Weight Loss Goal';
  const goalIcon = goalType === 'gain' ? 'trending-up' : goalType === 'maintain' ? 'scale-balance' : 'trending-down';

  // Stats calculation
  const startWeight = data.history.length > 0 ? Number(data.history[0].weight) : data.currentWeight;
  const totalChanged = Number((data.currentWeight - startWeight).toFixed(1));
  const diffFromTarget = Number((data.currentWeight - data.targetWeight).toFixed(1));

  // BMI
  const { bmi, category: bmiCat, color: bmiColor } = calculateBMI(data.currentWeight, data.height);

  // Progress calculation
  let progressPct = 0;
  if (goalType === 'gain') {
    const totalGoalSpan = Math.max(data.targetWeight - startWeight, 0.5);
    const achieved = Math.max(data.currentWeight - startWeight, 0);
    progressPct = Math.min(Math.round((achieved / totalGoalSpan) * 100), 100);
  } else if (goalType === 'maintain') {
    const diff = Math.abs(data.currentWeight - data.targetWeight);
    progressPct = diff <= 1.5 ? 100 : Math.max(100 - Math.round(diff * 10), 10);
  } else {
    const totalGoalSpan = Math.max(startWeight - data.targetWeight, 0.5);
    const achieved = Math.max(startWeight - data.currentWeight, 0);
    progressPct = Math.min(Math.round((achieved / totalGoalSpan) * 100), 100);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weight History</Text>
        <TouchableOpacity style={styles.addBtnHeader} onPress={() => setModalVisible(true)}>
          <Icon name="plus" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Interactive Goal Switcher Tabs ── */}
      <View style={styles.goalTabRow}>
        <TouchableOpacity
          style={[styles.goalTab, goalType === 'loss' && styles.goalTabActive]}
          onPress={() => handleGoalSwitch('weight_loss')}
          activeOpacity={0.8}
        >
          <Icon name="trending-down" size={16} color={goalType === 'loss' ? '#FFF' : COLORS.primary} />
          <Text style={[styles.goalTabText, goalType === 'loss' && styles.goalTabTextActive]}>
            Weight Loss
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.goalTab, goalType === 'gain' && styles.goalTabActive]}
          onPress={() => handleGoalSwitch('weight_gain')}
          activeOpacity={0.8}
        >
          <Icon name="trending-up" size={16} color={goalType === 'gain' ? '#FFF' : COLORS.primary} />
          <Text style={[styles.goalTabText, goalType === 'gain' && styles.goalTabTextActive]}>
            Weight Gain
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.goalTab, goalType === 'maintain' && styles.goalTabActive]}
          onPress={() => handleGoalSwitch('maintenance')}
          activeOpacity={0.8}
        >
          <Icon name="scale-balance" size={16} color={goalType === 'maintain' ? '#FFF' : COLORS.primary} />
          <Text style={[styles.goalTabText, goalType === 'maintain' && styles.goalTabTextActive]}>
            Maintain
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Active Goal Banner ── */}
      <View style={[styles.goalBanner, { backgroundColor: mainBg, borderColor: `${mainColor}33` }]}>
        <View style={[styles.goalIconCircle, { backgroundColor: mainColor }]}>
          <Icon name={goalIcon} size={22} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.goalBannerTitle, { color: mainColor }]}>{goalTitle}</Text>
          <Text style={styles.goalBannerSub}>
            Target Weight: <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>{data.targetWeight} kg</Text>
            {goalType === 'gain'
              ? ` (${diffFromTarget >= 0 ? `${diffFromTarget}kg above target` : `${Math.abs(diffFromTarget)}kg left to gain`})`
              : goalType === 'loss'
              ? ` (${diffFromTarget > 0 ? `${diffFromTarget}kg left to lose` : `${Math.abs(diffFromTarget)}kg under target`})`
              : ` (${Math.abs(diffFromTarget)}kg from target)`}
          </Text>
        </View>
      </View>

      {/* ── Key Metrics Cards ── */}
      <View style={styles.metricsGrid}>
        {/* Current Weight */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Current</Text>
          <Text style={[styles.metricVal, { color: mainColor }]}>
            {data.currentWeight} <Text style={styles.metricUnit}>kg</Text>
          </Text>
          <Text style={styles.metricSub}>BMI {bmi}</Text>
        </View>

        {/* Target Weight */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Target</Text>
          <Text style={styles.metricVal}>
            {data.targetWeight} <Text style={styles.metricUnit}>kg</Text>
          </Text>
          <View style={[styles.bmiBadge, { backgroundColor: `${bmiColor}20` }]}>
            <Text style={[styles.bmiBadgeText, { color: bmiColor }]}>{bmiCat}</Text>
          </View>
        </View>

        {/* Total Changed */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Change</Text>
          <Text style={[styles.metricVal, { color: totalChanged <= 0 ? COLORS.success : COLORS.primary }]}>
            {totalChanged > 0 ? `+${totalChanged}` : totalChanged} <Text style={styles.metricUnit}>kg</Text>
          </Text>
          <Text style={styles.metricSub}>Since start</Text>
        </View>
      </View>

      {/* ── Goal Progress Bar ── */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Goal Progress</Text>
          <Text style={[styles.progressPctText, { color: mainColor }]}>{progressPct}% Achieved</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: mainColor }]} />
        </View>
      </View>

      {/* ── Weight Trend Chart Card ── */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {goalType === 'gain' ? 'Weight & Muscle Gain Trend' : goalType === 'maintain' ? 'Weight Maintenance Trend' : 'Weight Loss Trend'}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={[styles.logLink, { color: mainColor }]}>+ Log Weight</Text>
          </TouchableOpacity>
        </View>
        <WeightChart
          history={data.history}
          targetWeight={data.targetWeight}
          goalType={goalType}
          mainColor={mainColor}
        />
      </View>

      {/* ── Logged Entries History List ── */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recorded History</Text>
        {data.history.length > 0 ? (
          [...data.history].reverse().map((entry, idx) => {
            const dateStr = new Date(entry.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View key={entry._id || idx} style={styles.logRow}>
                <View style={[styles.logIconCircle, { backgroundColor: mainBg }]}>
                  <Icon name="scale-bathroom" size={20} color={mainColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logWeightText}>{entry.weight} kg</Text>
                  <Text style={styles.logDateText}>{dateStr} {entry.notes ? `• ${entry.notes}` : ''}</Text>
                </View>
                <Icon name="check-circle" size={18} color={mainColor} />
              </View>
            );
          })
        ) : (
          <View style={styles.emptyLogs}>
            <Text style={styles.emptyLogsText}>No weight logs added yet.</Text>
          </View>
        )}
      </View>

      {/* ── LOG WEIGHT MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Log Weight Update</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>Current Weight (kg)</Text>
            <TextInput
              style={modalStyles.input}
              keyboardType="decimal-pad"
              value={inputWeight}
              onChangeText={setInputWeight}
              placeholder="e.g. 72.5"
            />

            <Text style={modalStyles.label}>Target Weight Goal (kg)</Text>
            <TextInput
              style={modalStyles.input}
              keyboardType="decimal-pad"
              value={inputTargetWeight}
              onChangeText={setInputTargetWeight}
              placeholder="e.g. 68.0"
            />

            <Text style={modalStyles.label}>Notes (Optional)</Text>
            <TextInput
              style={modalStyles.input}
              value={inputNotes}
              onChangeText={setInputNotes}
              placeholder="e.g. Morning weight after workout"
            />

            <TouchableOpacity
              style={[modalStyles.submitBtn, { backgroundColor: mainColor }]}
              onPress={handleLogWeight}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={modalStyles.submitBtnText}>Save Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const chartStyles = StyleSheet.create({
  emptyContainer: {
    height: CHART_HEIGHT,
    justifycontent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: 8,
    fontSize: 13,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 24,
    paddingBottom: 8,
  },
  yAxis: {
    width: 44,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    marginBottom: 20,
  },
  yLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  canvas: {
    flex: 1,
    height: CHART_HEIGHT + 28,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  targetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  targetBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  targetDash: {
    flex: 1,
    height: 1.5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingHorizontal: 8,
    gap: 16,
  },
  column: {
    alignItems: 'center',
    width: 44,
  },
  pointValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    height: CHART_HEIGHT - 20,
    justifyContent: 'flex-end',
    width: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  xLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addBtnHeader: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Goal Tab Row
  goalTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  goalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  goalTabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Goal banner
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  goalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  goalBannerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  bmiBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  bmiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // Progress card
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressPctText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Chart card
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logLink: {
    fontSize: 13,
    fontWeight: '700',
  },

  // History section
  historySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    elevation: 1,
  },
  logIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logWeightText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logDateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyLogs: {
    padding: 20,
    alignItems: 'center',
  },
  emptyLogsText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});

export default ProgressHistoryScreen;
