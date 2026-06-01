import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Simple, clean fallback theme — replace these strings with your global config if you have one
const GLOBAL_THEME = {
  primary: '#4FC3F7',
  success: '#10B981',
  danger: '#EF4444',
  bg: '#F5F7FA',
  card: '#FFFFFF',
  textDark: '#111111',
  textMid: '#2D3142',
  textSoft: '#9B9EAC',
  border: '#ECECEC',
};

const GOAL_ML = 2500;
const CUP_SIZES = [
  { label: 'S', ml: 150 },
  { label: 'M', ml: 250 },
  { label: 'L', ml: 500 },
];

const DrinkWaterScreen = ({ navigation }) => {
  const [consumed, setConsumed] = useState(1200);
  const [cupIndex, setCupIndex] = useState(1);
  const [history, setHistory] = useState([
    { id: 1, ml: 500, time: '08:00' },
    { id: 2, ml: 250, time: '09:30' },
    { id: 3, ml: 250, time: '11:15' },
    { id: 4, ml: 200, time: '13:00' },
  ]);

  const currentCup = CUP_SIZES[cupIndex];
  const progressPercent = Math.min(Math.round((consumed / GOAL_ML) * 100), 100);
  const remaining = Math.max(0, GOAL_ML - consumed);

  const addWater = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setConsumed((prev) => prev + currentCup.ml);
    setHistory((prev) => [{ id: Date.now(), ml: currentCup.ml, time }, ...prev]);
  };

  const removeLastWater = () => {
    if (history.length === 0) return;
    const last = history[0];
    setConsumed((prev) => Math.max(0, prev - last.ml));
    setHistory((prev) => prev.slice(1));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={GLOBAL_THEME.bg} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack()}>
          <Icon name="arrow-left" size={22} color={GLOBAL_THEME.textMid} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hydration</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Display Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Total Consumed</Text>
          <View style={styles.valueRow}>
            <Text style={styles.mainValue}>{consumed}</Text>
            <Text style={styles.mainUnit}> / {GOAL_ML} ml</Text>
          </View>

          {/* Clean Progress Bar matching your original system */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.progressStatusRow}>
            <Text style={styles.statusText}>{progressPercent}% completed</Text>
            <Text style={styles.statusText}>{(remaining / 1000).toFixed(2)}L left</Text>
          </View>
        </View>

        {/* Cup Quick Selector */}
        <Text style={styles.sectionTitle}>Select Cup Size</Text>
        <View style={styles.selectorContainer}>
          {CUP_SIZES.map((cup, i) => {
            const active = i === cupIndex;
            return (
              <TouchableOpacity
                key={cup.label}
                style={[styles.cupCard, active && styles.cupCardActive]}
                onPress={() => setCupIndex(i)}
              >
                <Icon name="cup-water" size={24} color={active ? '#FFF' : GLOBAL_THEME.primary} />
                <Text style={[styles.cupLabel, active && styles.textWhite]}>{cup.ml} ml</Text>
                <Text style={[styles.cupSub, active && styles.textWhiteSoft]}>Size {cup.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary Input Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnSecondary, history.length === 0 && styles.disabledBtn]} 
            onPress={removeLastWater}
            disabled={history.length === 0}
          >
            <Icon name="minus" size={24} color={GLOBAL_THEME.danger} />
            <Text style={styles.btnTextSecondary}>Undo Log</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.btnPrimary]} onPress={addWater}>
            <Icon name="plus" size={24} color="#FFF" />
            <Text style={styles.btnTextPrimary}>Add {currentCup.ml}ml</Text>
          </TouchableOpacity>
        </View>

        {/* Simplified History Log */}
        <Text style={styles.sectionTitle}>Today's Logs</Text>
        <View style={styles.logCard}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No fluid logged yet for today.</Text>
          ) : (
            history.map((item, index) => (
              <View 
                key={item.id} 
                style={[styles.logItem, index === history.length - 1 && styles.noBorder]}
              >
                <View style={styles.logLeft}>
                  <Icon name="water" size={18} color={GLOBAL_THEME.primary} />
                  <Text style={styles.logValue}>{item.ml} ml</Text>
                </View>
                <Text style={styles.logTime}>{item.time}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.bg,
  },
  scrollContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GLOBAL_THEME.textDark,
  },
  headerRightSpace: {
    width: 30, // Keeps text strictly centered
  },
  mainCard: {
    backgroundColor: GLOBAL_THEME.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: GLOBAL_THEME.textSoft,
    fontWeight: '500',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 16,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '700',
    color: GLOBAL_THEME.textDark,
  },
  mainUnit: {
    fontSize: 16,
    color: GLOBAL_THEME.textSoft,
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GLOBAL_THEME.primary,
    borderRadius: 20,
  },
  progressStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    color: GLOBAL_THEME.textSoft,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GLOBAL_THEME.textMid,
    marginBottom: 12,
    paddingLeft: 4,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cupCard: {
    flex: 1,
    backgroundColor: GLOBAL_THEME.card,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cupCardActive: {
    backgroundColor: GLOBAL_THEME.primary,
  },
  cupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: GLOBAL_THEME.textDark,
    marginTop: 6,
  },
  cupSub: {
    fontSize: 11,
    color: GLOBAL_THEME.textSoft,
    marginTop: 2,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textWhiteSoft: {
    color: 'rgba(255,255,255,0.7)',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: GLOBAL_THEME.primary,
  },
  btnSecondary: {
    backgroundColor: GLOBAL_THEME.card,
    borderWidth: 1,
    borderColor: GLOBAL_THEME.border,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnTextPrimary: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextSecondary: {
    color: GLOBAL_THEME.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  logCard: {
    backgroundColor: GLOBAL_THEME.card,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 20,
    elevation: 1,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: GLOBAL_THEME.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logValue: {
    fontSize: 14,
    fontWeight: '600',
    color: GLOBAL_THEME.textDark,
  },
  logTime: {
    fontSize: 12,
    color: GLOBAL_THEME.textSoft,
  },
  emptyText: {
    textAlign: 'center',
    color: GLOBAL_THEME.textSoft,
    paddingVertical: 20,
    fontSize: 13,
  },
});

export default DrinkWaterScreen;