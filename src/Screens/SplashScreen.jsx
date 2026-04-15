import React from 'react';
import { View, Image, StyleSheet, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <View style={styles.logoContainer}>
        <Image
          source={require('../images/fittrackLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#5a8bffff',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  logoContainer: {
    width: width * 0.9,
    height: width * 0.9,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;