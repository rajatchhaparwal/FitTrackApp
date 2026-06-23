import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '../../../UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TodaysGoalCard = ({
  workoutGoal = 45,
  workoutDone = 0,
  caloriesConsumed = 0,
  proteinConsumed = 0,
  carbConsumed = 0,
  fatConsumed = 0,
  onAddFoodPress
}) => {
  const { userData } = useUser();

  const calorieGoal = userData?.personalPlan?.dailyCalories || 2000;
  const proteinGoal = userData?.personalPlan?.proteinGrams || 120;
  const carbGoal    = userData?.personalPlan?.carbGrams || 200;
  const fatGoal     = userData?.personalPlan?.fatGrams || 60;

  const macros = {
    protein: {
      value: Math.round(proteinConsumed),
      required: proteinGoal,
      label: 'Protein',
      percent: Math.min(Math.round((proteinConsumed / proteinGoal) * 100), 100),
      color: '#0066EE'
    },
    carb: {
      value: Math.round(carbConsumed),
      required: carbGoal,
      label: 'Carbs',
      percent: Math.min(Math.round((carbConsumed / carbGoal) * 100), 100),
      color: '#5A8BFF'
    },
    fat: {
      value: Math.round(fatConsumed),
      required: fatGoal,
      label: 'Fat',
      percent: Math.min(Math.round((fatConsumed / fatGoal) * 100), 100),
      color: '#29B6F6'
    },
  };

  const workoutPercent = Math.min((workoutDone / workoutGoal) * 100, 100);

  return (
    <View style={styles.cardContainer}>
      
      {/* ================= SECTION 1: FOOD TRACKER ================= */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Icon name="silverware-fork-knife" size={20} color="#0066EE" />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.mainTitle}>Track Food</Text>
            <Text style={styles.subTitle}>
              Target: {caloriesConsumed} / {calorieGoal} kcal
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.orangeAddBtn} 
          activeOpacity={0.7}
          onPress={onAddFoodPress}
        >
          <Text style={styles.orangeAddText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Large Macro Mini-Cards Grid */}
      <View style={styles.macroGridContainer}>
        {Object.values(macros).map((macro, idx) => (
          <View key={idx} style={styles.macroMiniCard}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.macroValueText}>{macro.value}</Text>
              <Text style={styles.macroSlashText}>/{macro.required}g</Text>
            </View>
            <Text style={styles.macroLabelText}>{macro.label}</Text>
            {/* Minimalist Micro Progress Line */}
            <View style={styles.microBarBg}>
              <View style={[styles.microBarFill, { width: `${macro.percent}%`, backgroundColor: macro.color }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Elegant Architectural Divider Line */}
      <View style={styles.dividerLine} />

      {/* ================= SECTION 2: EXERCISE TRACKER ================= */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, { backgroundColor: '#F0F4FF' }]}>
            <Icon name="run" size={20} color="#0066EE" />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.mainTitle}>Exercise</Text>
            <Text style={styles.subTitle}>Active Movement</Text>
          </View>
        </View>
        <View style={styles.exerciseDataAlign}>
          <Text style={styles.exerciseValueMain}>{workoutDone}</Text>
          <Text style={styles.exerciseGoalLabel}>/ {workoutGoal} min</Text>
        </View>
      </View>

      {/* Clean Extended Progress Track */}
      <View style={styles.workoutTrackBg}>
        <View style={[styles.workoutTrackFill, { width: `${workoutPercent}%` }]} />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGroup: {
    marginLeft: 12,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  orangeAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0066EE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  orangeAddText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066EE',
    lineHeight: 18,
  },
  macroGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 4,
  },
  macroMiniCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  macroValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  macroSlashText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  macroLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  microBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  microBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  exerciseDataAlign: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  exerciseValueMain: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  exerciseGoalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 2,
  },
  workoutTrackBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  workoutTrackFill: {
    height: '100%',
    backgroundColor: '#0066EE',
    borderRadius: 3,
  },
});

export default TodaysGoalCard;