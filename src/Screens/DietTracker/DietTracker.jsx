import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CaptureMeal from './CaptureMeal';

const slider = [
  { id: '1', name: "Diet Plan", iconName: "description" }, // 'description' looks like the doc icon
  { id: '2', name: "Insights", iconName: "bar-chart" },
  { id: '3', name: "Recipes", iconName: "restaurant" },
  { id: '4', name: "Snap Gallery", iconName: "photo-library" },
  { id: '5', name: "Meals", iconName: "bookmark" }
];

const DietTracker = ({navigation}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header with Settings Icon */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={()=> navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Meal</Text>
        <TouchableOpacity>
        <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 2. Circular Calorie Card */}
      <View style={styles.calorieCard}>
        <View style={styles.progressCircle}>
           <Icon name="restaurant" size={20} color="#5a8bff" />
        </View>
        <Text style={styles.calorieText}>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>73 </Text> 
          of 3200 Cal
        </Text>
        <Icon name="bar-chart" size={24} color="#5a8bff" opacity={0.5} />
      </View>

      {/* 3. Horizontal Action Icons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.horizontalScroll}
      >
        {slider.map((item) => (
          <TouchableOpacity key={item.id} style={styles.actionCard}>
            <View style={styles.iconBackground}>
              <Icon name={item.iconName} size={24} color="#ffffffff" />
            </View>
            <Text style={styles.actionText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 4. Meal Section */}
      <MealSection navigation={navigation} title="Breakfast" consumed={73} total={800} hasData={true} />
      <MealSection navigation={navigation} title="Morning Snack" consumed={0} total={400} hasData={false} />
      <MealSection navigation={navigation} title="Lunch" consumed={0} total={800} hasData={false} />
      <MealSection navigation={navigation} title="Evening Snack" consumed={0} total={800} hasData={false} />
      <MealSection navigation={navigation} title="Dinner" consumed={0} total={800} hasData={false} />

    </ScrollView>
  );
};

const MealSection = ({ title, consumed, total, hasData,navigation }) => {

  return (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <View style={styles.mealRight}>
          <Text style={styles.mealCalText}>{consumed} of {total} Cal</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CaptureMeal',{mealtype:title})}>
            <Icon name="add-circle" size={26} color="#5a8bff" />
          </TouchableOpacity>
        </View>
      </View>

      {hasData ? (
        <View style={styles.mealItem}>
          <View>
            <Text style={styles.foodName}>Tea</Text>
            <Text style={styles.foodSubText}>1.0 teacup</Text>
          </View>
          <Text style={styles.foodCal}>{consumed}.0 Cal</Text>
          <Icon name="more-vert" size={20} color="#666" />
        </View>
      ) : (
        <View style={styles.emptyMeal}>
            <Text style={styles.emptyText}>Don't miss {title.toLowerCase()}! It's time to get a tasty meal.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 15 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  
  // Calorie Card
  calorieCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    marginBottom: 20
  },
  progressCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  calorieText: { fontSize: 16, color: '#333' },

  // Horizontal Scroll
  horizontalScroll: { paddingVertical: 10, gap: 15 },
  actionCard: { 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 15, 
    minWidth: 130, 
    elevation: 1 
  },
  iconBackground: { backgroundColor: '#5a8bff', padding: 8, borderRadius: 8, marginRight: 10 },
  actionText: { fontWeight: '600', color: '#000' },

  // Meal Sections
  mealContainer: { marginTop: 20 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mealTitle: { fontSize: 18, fontWeight: 'bold' },
  mealRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealCalText: { color: '#666' },
  mealItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee' },
  foodName: { fontSize: 16, fontWeight: '500' },
  foodSubText: { fontSize: 12, color: '#888' },
  foodCal: { fontSize: 14, color: '#333', marginLeft: 'auto', marginRight: 10 },
  emptyMeal: { padding: 20, alignItems: 'center' , backgroundColor: '#ffffffff', borderRadius:10},
  emptyText: { color: '#888', textAlign: 'center' }
});

export default DietTracker;