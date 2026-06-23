import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ActivityCard from './ActitvityCard';
import { useUser } from '../../../UserContext';

const Activities = ({
  navigation,
  caloriesConsumed = 0,
  waterConsumed = 0,
  workoutMinutes = 0
}) => {
  const { userData } = useUser();

  const calorieGoal = userData?.personalPlan?.dailyCalories || 2000;
  const waterGoal   = userData?.daily_water_goal_ml || 2000;

  const calorieProgress = Math.min(Math.round((caloriesConsumed / calorieGoal) * 100), 100);
  const waterProgress   = Math.min(Math.round((waterConsumed / waterGoal) * 100), 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Activity</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <ActivityCard
          type="Calories"
          trackValue={Math.round(caloriesConsumed)}
          value={String(calorieGoal)}
          unit="cal"
          progress={calorieProgress}
          icon="fire"
          variant="calorie"
          bgcolor="#FFFFFF"
          iconcolor="#E67E22"
          OnPress="Diet"
          navigation={navigation}
        />

        <ActivityCard
          type="Workout"
          value={workoutMinutes > 0 ? `${workoutMinutes} mins` : "0 mins"}
          unit=""
          icon="dumbbell"
          iconcolor="#5A8BFF"
          variant="Workout"
          bgcolor="#FFFFFF"
          OnPress="Workout"
          navigation={navigation}
        />
          
        <ActivityCard
          type="Drink Water"
          trackValue={waterConsumed}
          value={String(waterGoal)}
          unit="ml"
          progress={waterProgress}
          progressColor="#4FC3F7"
          OnPress='DrinkWaterScreen'
          navigation={navigation}
          icon="water"
          iconcolor="#4FC3F7"
          variant="bar"
          bgcolor="#FFFFFF"
        />

        <ActivityCard
          type="Steps"
          trackValue={0}
          value="10,000"
          unit="steps"
          progress={0}
          progressColor="#2ECC71"
          icon="walk"
          iconcolor="#2ECC71"
          variant="bar"
          bgcolor="#FFFFFF"
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', 
    color: '#1A1A1A',
  },
  scroll: { paddingLeft: 20 }
});

export default Activities;