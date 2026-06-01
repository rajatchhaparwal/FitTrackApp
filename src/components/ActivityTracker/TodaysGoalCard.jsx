import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TodaysGoalCard = ({ foodGoal, workoutGoal, workoutDone }) => {
  // Hardcoded macro values with clear, readable data structure
  const macros = {
    protein: { value: '92g', label: 'Protein', percent: 45, color: '#2C5E5A' },
    carb: { value: '120g', label: 'Carbs', percent: 40, color: '#3A6B88' },
    fat: { value: '45g', label: 'Fat', percent: 25, color: '#A97C50' },
    fibre: { value: '28g', label: 'Fibre', percent: 20, color: '#7B628C' },
  };

  const workoutPercent = Math.min((workoutDone / workoutGoal) * 100, 100);

  return (
    <View style={styles.cardContainer}>
      
      {/* ================= SECTION 1: FOOD TRACKER ================= */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Text style={styles.emojiIcon}>🍴</Text>
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.mainTitle}>Track Food</Text>
            <Text style={styles.subTitle}>Target: {foodGoal} kcal</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.orangeAddBtn} activeOpacity={0.7}>
          <Text style={styles.orangeAddText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* NEW: Premium Large Macro Mini-Cards Grid */}
      <View style={styles.macroGridContainer}>
        {Object.values(macros).map((macro, idx) => (
          <View key={idx} style={styles.macroMiniCard}>
            <Text style={styles.macroValueText}>{macro.value}</Text>
            <Text style={styles.macroLabelText}>{macro.label}</Text>
            {/* Minimalist Micro Progress Line */}
            <View style={styles.microBarBg}>
              <View style={[styles.microBarFill, { width: `${macro.percent}%`, backgroundColor: '#3D7372' }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Elegant Architectural Divider Line */}
      <View style={styles.dividerLine} />

      {/* ================= SECTION 2: EXERCISE TRACKER ================= */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, { backgroundColor: '#F4F5F7' }]}>
            <Text style={styles.emojiIcon}>🏃‍♂️</Text>
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
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#F0EFEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 18,
  },
  titleGroup: {
    marginLeft: 12,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A8F99',
    marginTop: 1,
  },
  orangeAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5a8bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orangeAddText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5a8bff',
    lineHeight: 18,
  },
  
  // MACRO MINI-CARDS STYLING
  macroGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 4,
  },
  macroMiniCard: {
    width: '23%', // Dynamically creates 4 perfectly balanced columns
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 10,
    alignItems: 'flex-start',
  },
  macroValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  macroLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8F99',
    marginTop: 1,
    marginBottom: 6,
  },
  microBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: '#EAECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  microBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  dividerLine: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 18,
  },

  // EXERCISE MODIFICATIONS
  exerciseDataAlign: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  exerciseValueMain: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  exerciseGoalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8F99',
    marginLeft: 2,
  },
  workoutTrackBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F3F5',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  workoutTrackFill: {
    height: '100%',
    backgroundColor: '#5a8bff', // Slate charcoal color instead of distracting loud blue
    borderRadius: 3,
  },
});

export default TodaysGoalCard;