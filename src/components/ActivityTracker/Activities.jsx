import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ActivityCard from './ActitvityCard';
import { useUser } from '../../../UserContext';

const Activities = ({
  navigation,
  caloriesConsumed = 0,
  waterConsumed = 0,
  workoutMinutes = 0,
  stepsCount = 0
}) => {
  const { userData } = useUser();

  const calorieGoal = userData?.personalPlan?.dailyCalories || 2000;
  const waterGoal = userData?.daily_water_goal_ml || 2000;
  const stepsGoal = 10000;

  const calorieProgress = Math.min(Math.round((caloriesConsumed / calorieGoal) * 100), 100);
  const waterProgress = Math.min(Math.round((waterConsumed / waterGoal) * 100), 100);
  const stepsProgress = Math.min(Math.round((stepsCount / stepsGoal) * 100), 100);

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
          iconcolor="#0066EE"
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
          progressColor="#0066EE"
          OnPress='DrinkWaterScreen'
          navigation={navigation}
          icon="water"
          iconcolor="#5A8BFF"
          variant="bar"
          bgcolor="#FFFFFF"
        />

        <ActivityCard
          type="Steps"
          trackValue={stepsCount}
          value="10,000"
          unit="steps"
          progress={stepsProgress}
          progressColor="#5A8BFF"
          icon="walk"
          iconcolor="#0066EE"
          variant="bar"
          bgcolor="#FFFFFF"
          OnPress="Steps"
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