import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Image
          source={require('../assets/images/circle_bg.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/images/logo_large.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

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
    opacity: 0.6,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    zIndex: 1,
  },
}); 