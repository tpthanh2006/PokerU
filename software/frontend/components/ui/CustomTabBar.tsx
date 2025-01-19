import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 4; // Since we have 4 tabs

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const translateX = React.useRef(new Animated.Value(state.index * TAB_WIDTH)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      speed: 12,
      bounciness: 0,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.activeBackground,
        {
          transform: [{ translateX }],
        }
      ]}>
        <LinearGradient
          colors={['#9702E7', '#E14949']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeBackgroundGradient}
        />
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        switch (route.name) {
          case 'HomePage':
            iconName = 'home';
            break;
          case 'FindGamesPage':
            iconName = 'search';
            break;
          case 'ChatPage':
            iconName = 'chatbubbles';
            break;
          case 'ProfilePage':
            iconName = 'person';
            break;
          default:
            iconName = 'home';
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.iconWrapper}>
              <Ionicons 
                name={iconName as any} 
                size={24} 
                color={isFocused ? 'white' : 'rgba(255, 255, 255, 0.5)'} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2a1335',
    height: 80,
    paddingBottom: 20,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
  },
  activeBackground: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackgroundGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 