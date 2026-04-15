import React, { useState } from 'react';
import { View, TextInput, StyleSheet ,Text,TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SearchBar = ({ placeholder = "Search for Exercises,Food..." }) => {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => setQuery(text)}
          underlineColorAndroid="transparent"
        />
            <TouchableOpacity style={styles.searchBtn}>
              <Icon name="magnify" size={22} color="#5a8bff" />
            </TouchableOpacity>
      </View>
    </View>



  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,

  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4', // Light gray to match modern apps
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5a8bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
});

export default SearchBar;