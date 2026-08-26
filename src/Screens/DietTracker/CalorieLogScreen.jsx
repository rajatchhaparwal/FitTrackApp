import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useUser } from '../../../UserContext';
import api_call from '../../../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const BAR_WIDTH = 22;
const BAR_GAP = 6;

// ── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0066EE',
  primaryLight: '#E8F0FE',
  intake: '#0066EE',
  intakeLight: '#B3CCFF',
  burned: '#FF6B35',
  burnedLight: '#FFD4C0',
  net: '#10B981',
  netNeg: '#EF4444',
  bg: '#F5F7FA',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  protein: '#0066EE',
  carbs: '#5A8BFF',
  fat: '#FF9500',
};

// ── Meal Display Names ──────────────────────────────────────────────────────
const MEAL_NAMES = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  pre_workout: 'Pre-Workout',
  post_workout: 'Post-Workout',
};

const MEAL_ICONS = {
  breakfast: 'weather-sunset-up',
  lunch: 'white-balance-sunny',
  dinner: 'weather-night',
  snacks: 'cookie-outline',
  pre_workout: 'lightning-bolt',
  post_workout: 'lightning-bolt-outline',
};

// ── Bar Chart Component ─────────────────────────────────────────────────────
const BarChart = ({ data, calorieGoal, selectedIndex, onSelectDay }) => {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.intake.calories, d.burned.calories, calorieGoal)),
    1
  );

  return (
    <View style={chartStyles.container}>
      {/* Y-axis labels */}
      <View style={chartStyles.yAxis}>
        <Text style={chartStyles.yLabel}>{maxValue}</Text>
        <Text style={chartStyles.yLabel}>{Math.round(maxValue / 2)}</Text>
        <Text style={chartStyles.yLabel}>0</Text>
      </View>

      {/* Bars area */}
      <View style={chartStyles.barsArea}>
        {/* Goal line */}
        <View
          style={[
            chartStyles.goalLine,
            { bottom: (calorieGoal / maxValue) * CHART_HEIGHT },
          ]}
        >
          <Text style={chartStyles.goalLineLabel}>Goal</Text>
          <View style={chartStyles.goalLineDash} />
        </View>

        {/* Grid lines */}
        <View style={[chartStyles.gridLine, { bottom: CHART_HEIGHT }]} />
        <View style={[chartStyles.gridLine, { bottom: CHART_HEIGHT / 2 }]} />
        <View style={[chartStyles.gridLine, { bottom: 0 }]} />

        {/* Day columns */}
        <View style={chartStyles.barsRow}>
          {data.map((day, idx) => {
            const intakeH = Math.max((day.intake.calories / maxValue) * CHART_HEIGHT, 2);
            const burnedH = Math.max((day.burned.calories / maxValue) * CHART_HEIGHT, 2);
            const isSelected = idx === selectedIndex;
            const isToday = idx === data.length - 1;

            return (
              <TouchableOpacity
                key={day.date}
                style={[
                  chartStyles.dayColumn,
                  isSelected && chartStyles.dayColumnSelected,
                ]}
                onPress={() => onSelectDay(idx)}
                activeOpacity={0.7}
              >
                {/* Bars */}
                <View style={chartStyles.barPair}>
                  <View
                    style={[
                      chartStyles.bar,
                      {
                        height: intakeH,
                        backgroundColor: isSelected ? COLORS.intake : COLORS.intakeLight,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      },
                    ]}
                  />
                  <View
                    style={[
                      chartStyles.bar,
                      {
                        height: burnedH,
                        backgroundColor: isSelected ? COLORS.burned : COLORS.burnedLight,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      },
                    ]}
                  />
                </View>
                {/* Day label */}
                <Text
                  style={[
                    chartStyles.dayLabel,
                    isSelected && chartStyles.dayLabelSelected,
                    isToday && chartStyles.dayLabelToday,
                  ]}
                >
                  {isToday ? 'Today' : day.dayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// ── Legend Row ───────────────────────────────────────────────────────────────
const ChartLegend = () => (
  <View style={chartStyles.legend}>
    <View style={chartStyles.legendItem}>
      <View style={[chartStyles.legendDot, { backgroundColor: COLORS.intake }]} />
      <Text style={chartStyles.legendText}>Intake</Text>
    </View>
    <View style={chartStyles.legendItem}>
      <View style={[chartStyles.legendDot, { backgroundColor: COLORS.burned }]} />
      <Text style={chartStyles.legendText}>Burned</Text>
    </View>
    <View style={chartStyles.legendItem}>
      <View style={[chartStyles.legendDash, { backgroundColor: COLORS.primary }]} />
      <Text style={chartStyles.legendText}>Goal</Text>
    </View>
  </View>
);

// ── Summary Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, unit, color, bgColor }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
      <Icon name={icon} size={18} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>
        {value} <Text style={styles.statUnit}>{unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

// ── Macro Bar ───────────────────────────────────────────────────────────────
const MacroItem = ({ label, value, color }) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}g</Text>
  </View>
);

// ── Meal Breakdown Pill ──────────────────────────────────────────────────────
const MealPill = ({ mealKey, calories }) => (
  <View style={styles.mealPill}>
    <Icon name={MEAL_ICONS[mealKey] || 'food'} size={14} color={COLORS.primary} />
    <Text style={styles.mealPillName}>{MEAL_NAMES[mealKey] || mealKey}</Text>
    <Text style={styles.mealPillCal}>{calories} cal</Text>
  </View>
);

// ── Workout Detail Row ──────────────────────────────────────────────────────
const WorkoutRow = ({ workout }) => (
  <View style={styles.workoutRow}>
    <View style={styles.workoutIconWrap}>
      <Icon name="dumbbell" size={14} color={COLORS.burned} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.workoutTitle}>{workout.title}</Text>
      {workout.durationMins > 0 && (
        <Text style={styles.workoutSub}>{workout.durationMins} min</Text>
      )}
    </View>
    <Text style={styles.workoutCal}>-{workout.caloriesBurned} cal</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const CalorieLogScreen = ({ navigation }) => {
  const { userData } = useUser();
  const [history, setHistory] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(6); // default to "today"

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const user = auth().currentUser;
          if (!user) return;
          const res = await fetch(`${api_call}/DietLog/calorie-history`, {
            headers: { 'firebase-uid': user.uid },
          });
          const data = await res.json();
          if (isActive && data.success) {
            setHistory(data.data || []);
            setCalorieGoal(data.calorieGoal || 2000);
            setSelectedDay((data.data || []).length - 1);
          }
        } catch (e) {
          console.error('Error fetching calorie history:', e);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchHistory();
      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading calorie data…</Text>
      </View>
    );
  }

  const selected = history[selectedDay] || {};
  const intake = selected?.intake?.calories || 0;
  const burned = selected?.burned?.calories || 0;
  const net = intake - burned;
  const mealEntries = Object.entries(selected?.mealBreakdown || {});
  const workouts = selected?.burned?.workouts || [];

  // 7-day totals
  const weekIntake = history.reduce((s, d) => s + (d.intake?.calories || 0), 0);
  const weekBurned = history.reduce((s, d) => s + (d.burned?.calories || 0), 0);
  const weekAvgIntake = history.length > 0 ? Math.round(weekIntake / history.length) : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calorie Log</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* ── Weekly Summary Strip ── */}
      <View style={styles.weekSummary}>
        <View style={styles.weekStat}>
          <Text style={styles.weekStatVal}>{weekAvgIntake}</Text>
          <Text style={styles.weekStatLabel}>Avg Intake</Text>
        </View>
        <View style={[styles.weekDivider]} />
        <View style={styles.weekStat}>
          <Text style={styles.weekStatVal}>{Math.round(weekIntake)}</Text>
          <Text style={styles.weekStatLabel}>Total Intake</Text>
        </View>
        <View style={[styles.weekDivider]} />
        <View style={styles.weekStat}>
          <Text style={[styles.weekStatVal, { color: COLORS.burned }]}>{Math.round(weekBurned)}</Text>
          <Text style={styles.weekStatLabel}>Total Burned</Text>
        </View>
      </View>

      {/* ── Chart Card ── */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>7-Day Overview</Text>
          <Text style={styles.chartSubtitle}>Tap a bar for details</Text>
        </View>
        <ChartLegend />
        {history.length > 0 ? (
          <BarChart
            data={history}
            calorieGoal={calorieGoal}
            selectedIndex={selectedDay}
            onSelectDay={setSelectedDay}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="chart-bar" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyChartText}>No data yet</Text>
          </View>
        )}
      </View>

      {/* ── Selected Day Detail Card ── */}
      {history.length > 0 && (
        <View style={styles.detailCard}>
          <Text style={styles.detailDate}>{selected.dayFull || selected.date}</Text>

          {/* Stat row */}
          <View style={styles.statsRow}>
            <StatCard
              icon="food-apple"
              label="Intake"
              value={intake}
              unit="cal"
              color={COLORS.intake}
              bgColor={COLORS.primaryLight}
            />
            <StatCard
              icon="fire"
              label="Burned"
              value={burned}
              unit="cal"
              color={COLORS.burned}
              bgColor="#FFF0E8"
            />
          </View>

          {/* Net calories */}
          <View style={[styles.netCard, { backgroundColor: net >= 0 ? '#F0FFF4' : '#FFF5F5' }]}>
            <Icon
              name={net >= 0 ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
              size={22}
              color={net >= 0 ? COLORS.net : COLORS.netNeg}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.netLabel}>Net Calories</Text>
              <Text style={[styles.netValue, { color: net >= 0 ? COLORS.net : COLORS.netNeg }]}>
                {net >= 0 ? '+' : ''}{net} cal
              </Text>
            </View>
            <View style={{ marginLeft: 'auto' }}>
              <Text style={styles.netGoalText}>
                Goal: {calorieGoal} cal
              </Text>
            </View>
          </View>

          {/* Macros */}
          {(selected.intake?.proteinG > 0 || selected.intake?.carbsG > 0 || selected.intake?.fatG > 0) && (
            <View style={styles.macrosSection}>
              <Text style={styles.sectionTitle}>Macros Breakdown</Text>
              <View style={styles.macrosRow}>
                <MacroItem label="Protein" value={selected.intake.proteinG} color={COLORS.protein} />
                <MacroItem label="Carbs" value={selected.intake.carbsG} color={COLORS.carbs} />
                <MacroItem label="Fat" value={selected.intake.fatG} color={COLORS.fat} />
              </View>
              {/* Macro proportion bar */}
              <View style={styles.macroPropBar}>
                {(() => {
                  const total = (selected.intake.proteinG || 0) * 4 +
                    (selected.intake.carbsG || 0) * 4 +
                    (selected.intake.fatG || 0) * 9;
                  if (total === 0) return null;
                  const proteinPct = ((selected.intake.proteinG * 4) / total) * 100;
                  const carbsPct = ((selected.intake.carbsG * 4) / total) * 100;
                  const fatPct = ((selected.intake.fatG * 9) / total) * 100;
                  return (
                    <>
                      <View style={[styles.macroPropSeg, { width: `${proteinPct}%`, backgroundColor: COLORS.protein, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                      <View style={[styles.macroPropSeg, { width: `${carbsPct}%`, backgroundColor: COLORS.carbs }]} />
                      <View style={[styles.macroPropSeg, { width: `${fatPct}%`, backgroundColor: COLORS.fat, borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                    </>
                  );
                })()}
              </View>
            </View>
          )}

          {/* Meal Breakdown */}
          {mealEntries.length > 0 && (
            <View style={styles.mealSection}>
              <Text style={styles.sectionTitle}>Meal Breakdown</Text>
              <View style={styles.mealPillRow}>
                {mealEntries.map(([key, cal]) => (
                  <MealPill key={key} mealKey={key} calories={cal} />
                ))}
              </View>
            </View>
          )}

          {/* Workouts */}
          {workouts.length > 0 && (
            <View style={styles.workoutSection}>
              <Text style={styles.sectionTitle}>Exercises Burned</Text>
              {workouts.map((w, i) => (
                <WorkoutRow key={i} workout={w} />
              ))}
            </View>
          )}

          {/* Empty state */}
          {intake === 0 && burned === 0 && (
            <View style={styles.emptyDay}>
              <Icon name="calendar-blank-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyDayText}>No data recorded for this day</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHART STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingBottom: 8,
  },
  yAxis: {
    width: 36,
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
  barsArea: {
    flex: 1,
    height: CHART_HEIGHT + 28,
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  goalLineDash: {
    flex: 1,
    height: 1.5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 1,
  },
  goalLineLabel: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '700',
    marginRight: 4,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingHorizontal: 4,
  },
  dayColumn: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4,
    paddingTop: 6,
    borderRadius: 8,
  },
  dayColumnSelected: {
    backgroundColor: '#F0F4FF',
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: BAR_WIDTH / 2,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 6,
  },
  dayLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dayLabelToday: {
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDash: {
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STYLES
// ═══════════════════════════════════════════════════════════════════════════════
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
    marginBottom: 16,
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

  // Weekly summary
  weekSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekStatVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  weekStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  weekDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },

  // Chart card
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chartSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    color: COLORS.textMuted,
    marginTop: 8,
    fontSize: 13,
  },

  // Detail card
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  detailDate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 3,
    gap: 10,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Net calories
  netCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  netLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  netValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  netGoalText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Macros
  macrosSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  macroItem: {
    alignItems: 'center',
    gap: 4,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  macroPropBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  macroPropSeg: {
    height: '100%',
  },

  // Meal breakdown
  mealSection: {
    marginBottom: 16,
  },
  mealPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mealPillName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mealPillCal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Workouts
  workoutSection: {
    marginBottom: 4,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  workoutIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE8DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  workoutSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  workoutCal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.burned,
  },

  // Empty state
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyDayText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

export default CalorieLogScreen;
