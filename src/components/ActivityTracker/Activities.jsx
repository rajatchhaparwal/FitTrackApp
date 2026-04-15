import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ActivityCard from './ActitvityCard'
const Activities = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Activity</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ActivityCard 
          type="Steps" 
          value="8,854" 
          unit="Steps" 
          updateTime="2m" 
          icon="👣" 
        />
        <ActivityCard 
          type="Workout" 
          value="02:10" 
          unit="hours" 
          updateTime="1m" 
          icon="🏋️" 
        />
        <ActivityCard 
          type="Heart rate" 
          value="102" 
          unit="bpm" 
          updateTime="34m" 
          icon="❤️" 
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