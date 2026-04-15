import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const userData = {
    proteinConsumed: 45,
    proteinGoal: 100,
    carbConsumed: 120,
    carbGoal: 300,
    calorie:3100,
  };

  // 2. Logic tp Calculate the percentage strings
  const proteinPercent = `${(userData.proteinConsumed / userData.proteinGoal) * 100}%`;
  const carbPercent = `${(userData.carbConsumed / userData.carbGoal) * 100}%`;

const TrackFood = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Todays Goal</Text>

      {/* Main Food Card */}
      <TouchableOpacity  activeOpacity={0.9} onPress={() => navigation.navigate("DietDetails")}>
      <View style={styles.card}>
        {/* Icon, Text, and Add Button */}
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={{ fontSize: 20 }}>🍴</Text> 
          </View>
          
          <View style={styles.textGroup}>
            <Text style={styles.cardTitle}>Track Food</Text>
            <Text style={styles.cardSubtitle}>Eat {userData.calorie} cal</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={()=>navigation.navigate("CaptureMeal")}>
            <Text style={styles.plusSymbol}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Macros Grid */}
        <View style={styles.macroGrid}>
          <MacroBar label="Protein" percentage= {proteinPercent} />
          <MacroBar label="Carb" percentage={carbPercent} />
          <MacroBar label="Fat" percentage="0%" />
          <MacroBar label="Fibre" percentage="0%" />
        </View>
      </View>
      </TouchableOpacity>
    </View>
  );
};


const MacroBar = ({ label, percentage }) => (
  <View style={styles.macroItem}>
    <Text style={styles.macroLabel}>{label}: {percentage}</Text>
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: percentage }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffffff', 
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', 
    color: '#1A1A1A',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSymbol: {
    color: '#E67E22',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  premiumText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#417D7A',
    fontWeight: '600',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '45%',
    marginBottom: 15,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EEE',
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#417D7A',
    borderRadius: 3,
  },
});

export default TrackFood;