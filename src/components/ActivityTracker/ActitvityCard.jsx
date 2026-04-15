import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActivityCard = ({ type, value, unit, updateTime, icon, bgcolor, iconcolor }) => {
  return (
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.typeText}>{type}</Text>

      {/* Center Icon Section */}
      <View style={[styles.iconContainer, { borderColor: iconcolor + '33' }]}>
         {/* You can replace this Text with an <Image /> or Icon library later */}
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>

      {/* Value and Time Section */}
      <View style={styles.bottomSection}>
        <View style={styles.valueRow}>
          <Text style={styles.valueText}>{value}</Text>
          {unit ? <Text style={styles.unitText}> {unit}</Text> : null}
        </View>
        <Text style={styles.updateText}>Updated {updateTime} ago</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 160,
    borderRadius: 20,
    padding: 15,
    marginBottom:5,
    marginRight: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Glass effect
  },
  bottomSection: {
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  unitText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  updateText: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
});

export default ActivityCard;