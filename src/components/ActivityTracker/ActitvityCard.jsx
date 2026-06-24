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
  const themeColor = iconcolor ? `${iconcolor}1A` : '#F0F4FF';

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
            <Icon name={icon} size={20} color={iconcolor || '#0066EE'} />
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
                      backgroundColor: progressColor || '#0066EE',
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
              <Text style={styles.workoutLabel}>Active Time</Text>
              <View style={styles.pulseRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveText}>Tracked</Text>
              </View>
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
    borderColor: '#F1F5F9',
    borderWidth: 1,
    shadowColor: '#0066EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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
    color: '#0F172A',
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
    color: '#0F172A',
  },

  unitText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 4,
  },

  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  calorieBackground: {
    flex: 1,
    height: 10,
    backgroundColor: '#F0F4FF',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  
  calorieFill: {
    height: '100%',
    backgroundColor: '#0066EE',
    borderRadius: 20,
  },
  
  caloriePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066EE',
  },
  
  calorieText: {
    marginTop: 6,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Progress Bar
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#F1F5F9',
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
    color: '#64748B',
  },

  // Heart Rate UI / Workout UI
  pulseContainer: {
    marginTop: 2,
  },

  workoutLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },

  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066EE',
    marginRight: 6,
  },

  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066EE',
  },
});

export default ActivityCard;