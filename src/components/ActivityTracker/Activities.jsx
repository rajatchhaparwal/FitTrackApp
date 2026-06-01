import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ActivityCard from './ActitvityCard'
const Activities = ({userData}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Activity</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        
      <ActivityCard
  type="Calories"
  trackValue={0}
  value="1914"
  unit="cal"
  progress={72}
  icon="🔥"
  variant="calorie"
  bgcolor="#FFFFFF"
  iconcolor="#FFE8CC"/>

<ActivityCard
  type="Workout"
  value="02:10"
  unit="hrs"
  icon="🏋️"
  variant="Workout"/>

  
<ActivityCard
  type="Drink Water"
  trackValue={3}
  value="12"
  unit="glasses"
  progress={60}
  progressColor="#4FC3F7"
  icon="💧"
  variant="bar"
/>

<ActivityCard
  type="Steps"
  trackValue={100}
  value="8,854"
  unit="steps"
  progress={88}
  progressColor="#4FC3F7"
  icon="👣"
  variant="bar"
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
  title: {     fontSize: 18,
    fontFamily: 'Montserrat-SemiBold', 
    color: '#1A1A1A', },
  scroll: { paddingLeft: 20 }
});

export default Activities;