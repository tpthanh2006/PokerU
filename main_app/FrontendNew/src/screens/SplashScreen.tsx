import React from 'react';
import {
  View,
  Image,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const SplashScreen = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <Image
          source={require('../../assets/circle_bg.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/logo_large.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#1a0325',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: width, 
    height: height, 
  },
  logo: {
    width: width * 0.5, // 50% of screen width
    height: width * 0.5, // Keep aspect ratio square
    zIndex: 1, // Ensures logo appears above the background
  },
}); 