import React from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const ActivityCard = ({
  type,
  value,
  unit,
  icon,
  bgcolor,
  iconcolor,
  OnPress,
  // Progress
  progress = 0,
  progressColor = '#4F8EF7',
  trackValue,
  // Variants
  variant = 'bar', // bar | pulse
}) => {

  const navigation = useNavigation();
  
  const cardBg = bgcolor || '#FFFFFF';
  const themeColor = iconcolor || '#F5F5F5';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <TouchableOpacity 
        disabled={!OnPress}
        onPress={() => OnPress && navigation.navigate(OnPress)}
        activeOpacity={OnPress ? 0.7 : 1}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.typeText} numberOfLines={2}>
          {type}
        </Text>

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: themeColor },
          ]}
        >
          <Icon name={icon} size={20} color={iconcolor || '#5A8BFF'} />
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottomSection}>
        {/* Value */}
        <View style={styles.valueRow}>
          <Text style={styles.valueText}>
          {unit === "steps" || unit === "glasses" || unit === "cal"? `${trackValue}/${value}`: value}
          </Text>

          {unit && (
            <Text style={styles.unitText}>
              {unit}
            </Text>
          )}
          
        </View>

        {/* Dynamic UI */}
        {variant === 'calorie' && (
  <>
    <View style={styles.calorieRow}>

      <View style={styles.calorieBackground}>
        <View
          style={[
            styles.calorieFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.caloriePercent}>
        {progress}%
      </Text>

    </View>

    <Text style={styles.calorieText}>
      Daily goal reached
    </Text>
  </>
)}

        {variant === 'bar' && (
          <>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {progress}% completed
            </Text>
          </>
        )}

        {variant === 'Workout' && (
          <View style={styles.pulseContainer}>
            <Text>Active Time</Text>
            <View style={styles.pulseRow}></View>
          </View>
        )}

      </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 150,
    borderRadius: 24,
    padding: 18,
    marginRight: 12,
    marginBottom: 12,
    justifyContent: 'space-between',

    backgroundColor: '#FFF',

    borderColor:'#000',
    borderWidth:0,
    elevation:1,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },

  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3142',
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomSection: {
    width: '100%',
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },

  valueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  unitText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9B9EAC',
    marginLeft: 4,
  },

  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  calorieBackground: {
    flex: 1,
    height: 10,
    backgroundColor: '#FFE7DE',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  
  calorieFill: {
    height: '100%',
    backgroundColor: '#FF7A45',
    borderRadius: 20,
  },
  
  caloriePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A45',
  },
  
  calorieText: {
    marginTop: 6,
    fontSize: 11,
    color: '#9B9EAC',
    fontWeight: '500',
  },
  // Progress Bar
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
  },

  progressText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    color: '#9B9EAC',
  },

  // Heart Rate UI
  pulseContainer: {
    marginTop: 2,
  },

  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4D6D',
    marginRight: 6,
  },

  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4D6D',
  },

  heartStatus: {
    marginTop: 6,
    fontSize: 11,
    color: '#9B9EAC',
    fontWeight: '500',
  },
});

export default ActivityCard;