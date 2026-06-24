import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import api_call from '../../../api';

const { width } = Dimensions.get('window');

const StepsScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(6); // Default to today (last index in 7 days)
  const [stepsGoal] = useState(10000);

  const fetchHistory = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const res = await fetch(`${api_call}/DietLog/steps-history`, {
        headers: { 'firebase-uid': user.uid }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHistory(data.data);
      }
    } catch (e) {
      console.error("Error fetching steps history:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const selectedDayData = history[selectedDayIndex] || { steps: 0, dayLabel: 'Today', date: new Date().toISOString().split('T')[0] };

  // Standard step metrics converters
  const getKcal = (steps) => Math.round(steps * 0.04);
  const getKm = (steps) => (steps * 0.0008).toFixed(2);
  const getMins = (steps) => Math.round(steps * 0.0075);

  const maxStepsInHistory = Math.max(...history.map(h => h.steps), 6000);
  const selectedProgress = Math.min(Math.round((selectedDayData.steps / stepsGoal) * 100), 100);

  // Format full date label (e.g. "Wednesday, Jun 24")
  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Steps Tracker</Text>
          <Text style={styles.headerSub}>Active Steps & History</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#0066EE" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── Today's / Selected Day Steps Card ── */}
          <View style={styles.mainStepsCard}>
            <Text style={styles.dateLabel}>{formatFullDate(selectedDayData.date)}</Text>
            
            <View style={styles.stepsCircleContainer}>
              <View style={[styles.stepsCircleOuter, { borderColor: selectedProgress >= 100 ? '#0066EE' : '#F1F5F9' }]}>
                <View style={styles.stepsCircleInner}>
                  <Icon name="run" size={32} color="#0066EE" style={{ marginBottom: 4 }} />
                  <Text style={styles.stepsValueText}>{selectedDayData.steps.toLocaleString()}</Text>
                  <Text style={styles.stepsGoalText}>Goal: {stepsGoal.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.progressPctText}>{selectedProgress}% of goal completed</Text>

            {/* Micro progress line */}
            <View style={styles.progressLineBg}>
              <View style={[styles.progressLineFill, { width: `${selectedProgress}%` }]} />
            </View>
          </View>

          {/* ── Step Metrics Cards ── */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#F0F4FF' }]}>
                <Icon name="fire" size={22} color="#0066EE" />
              </View>
              <Text style={styles.metricVal}>{getKcal(selectedDayData.steps)} kcal</Text>
              <Text style={styles.metricLabel}>Calories Burned</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#F0F4FF' }]}>
                <Icon name="map-marker-distance" size={22} color="#0066EE" />
              </View>
              <Text style={styles.metricVal}>{getKm(selectedDayData.steps)} km</Text>
              <Text style={styles.metricLabel}>Distance Walked</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#F0F4FF' }]}>
                <Icon name="clock-outline" size={22} color="#0066EE" />
              </View>
              <Text style={styles.metricVal}>{getMins(selectedDayData.steps)} mins</Text>
              <Text style={styles.metricLabel}>Active Time</Text>
            </View>
          </View>

          {/* ── 7-Day History Section with Bar Chart ── */}
          <View style={styles.chartSectionCard}>
            <Text style={styles.chartTitle}>7-Day Steps Activity</Text>
            <Text style={styles.chartSub}>Tap any bar to inspect daily statistics</Text>

            {/* Custom Bar Graph */}
            <View style={styles.chartContainer}>
              <View style={styles.graphRow}>
                {history.map((day, idx) => {
                  const barHeightPct = (day.steps / maxStepsInHistory) * 100;
                  const isSelected = selectedDayIndex === idx;

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => setSelectedDayIndex(idx)}
                      style={styles.barColumn}
                    >
                      {/* Tooltip on top if selected */}
                      {isSelected && (
                        <View style={styles.barTooltip}>
                          <Text style={styles.barTooltipText}>{day.steps.toLocaleString()}</Text>
                        </View>
                      )}

                      {/* Bar fill container */}
                      <View style={styles.barWrapper}>
                        <View style={[styles.barBackground, isSelected && styles.barBackgroundActive]}>
                          <View 
                            style={[
                              styles.barFill, 
                              { height: `${barHeightPct}%` },
                              isSelected ? styles.barFillActive : styles.barFillInactive
                            ]} 
                          />
                        </View>
                      </View>

                      {/* Day Label */}
                      <Text style={[styles.barLabel, isSelected && styles.barLabelActive]}>
                        {day.dayLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 6,
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#64748B',
    marginTop: 1,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mainStepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderColor: '#F1F5F9',
    borderWidth: 1,
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16,
  },
  stepsCircleContainer: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepsCircleOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsCircleInner: {
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#F1F5F9',
    borderWidth: 1,
  },
  stepsValueText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepsGoalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  progressPctText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  progressLineBg: {
    width: '85%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: '#0066EE',
    borderRadius: 3,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    width: '100%',
  },
  metricCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderColor: '#F1F5F9',
    borderWidth: 1,
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  chartSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 18,
    borderColor: '#F1F5F9',
    borderWidth: 1,
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  chartSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    marginBottom: 20,
  },
  chartContainer: {
    height: 180,
    justifyContent: 'flex-end',
    width: '100%',
    paddingBottom: 10,
  },
  graphRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    width: '100%',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  barTooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barTooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  barWrapper: {
    height: 110,
    width: 14,
    justifyContent: 'flex-end',
  },
  barBackground: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barBackgroundActive: {
    backgroundColor: '#EBF1FF',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barFillActive: {
    backgroundColor: '#0066EE',
  },
  barFillInactive: {
    backgroundColor: '#5A8BFF',
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
  },
  barLabelActive: {
    color: '#0066EE',
    fontWeight: '700',
  },
});

export default StepsScreen;
