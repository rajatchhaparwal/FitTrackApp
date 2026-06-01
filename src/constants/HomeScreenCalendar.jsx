import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreenCalendar = () => {
  // Dynamically generated days to match your exact layout row (May 25 - May 31)
  const daysOfWeek = [
    { id: 1, dayName: 'Mon', dateNum: '25' },
    { id: 2, dayName: 'Tue', dateNum: '26' },
    { id: 3, dayName: 'Wed', dateNum: '27' },
    { id: 4, dayName: 'Thu', dateNum: '28' },
    { id: 5, dayName: 'Fri', dateNum: '29' }, // Today / Selected in your screenshot
    { id: 6, dayName: 'Sat', dateNum: '30' },
    { id: 7, dayName: 'Sun', dateNum: '31' },
  ];


  const [selectedDay, setSelectedDay] = useState(5);

  return (
    <View style={styles.container}>
      {/* Header Label Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setSelectedDay(5)} activeOpacity={0.7}>
          <Text style={styles.todayBtnText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Week Row Container */}
      <View style={styles.weekRow}>
        {daysOfWeek.map((item) => {
          const isSelected = item.id === selectedDay;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => setSelectedDay(item.id)}
              style={[
                styles.dayButton,
                isSelected && styles.activeDayButton
              ]}
            >
              <Text style={[styles.dayNameText, isSelected && styles.activeDayNameText]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dateNumberText, isSelected && styles.activeDateNumberText]}>
                {item.dateNum}
              </Text>
              
              {/* Bottom White Dot indicator on the active pill */}
              {isSelected && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 20, // Perfectly aligns with your screen's outer layout margins
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  todayBtnText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', 
    color: '#1A1A1A', // Subtle primary blue link accent
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Spreads days perfectly across the device width
    alignItems: 'center',
    width: '100%',
  },
  dayButton: {
    width: 42,
    height: 70, // Height setup creates that tall aesthetic 
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Unselected days stay completely clean and transparent
  },
  activeDayButton: {
    backgroundColor: '#111111', // Solid black/dark pill background from the screenshot
    // Smooth shadow properties to make the pill pop out slightly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dayNameText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9E9E9E', // Inactive text gray
    marginBottom: 6,
  },
  activeDayNameText: {
    color: '#A0A0A0', // Slightly muted gray text on black background
    fontWeight: '500',
  },
  dateNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  activeDateNumberText: {
    color: '#FFFFFF', // High-contrast crisp white number
    marginBottom: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF', // Clean white indicator dot at the bottom
    marginTop: 4,
  },
});

export default HomeScreenCalendar;