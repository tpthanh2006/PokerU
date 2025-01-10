import { Image, StyleSheet, View, ViewProps } from 'react-native';

interface SplashScreenProps {
  onLayout?: ViewProps['onLayout'];
}

export function SplashScreen({ onLayout }: SplashScreenProps) {
  return (
    <View style={styles.container} onLayout={onLayout}>
      <Image
        style={styles.image}
        source={require('../assets/images/splash.png')}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0325',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 