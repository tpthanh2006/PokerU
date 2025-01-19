import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

interface SegmentedControlProps {
  options: [string, string];  // Exactly two options
  selectedIndex: number;
  onChange: (index: number) => void;
  containerStyle?: object;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
  containerStyle,
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: selectedIndex * (containerWidth / 2),
      useNativeDriver: true,
      speed: 12,
      bounciness: 0,
    }).start();
  }, [selectedIndex, containerWidth]);

  return (
    <View 
      style={[styles.container, containerStyle]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View 
        style={[
          styles.selectedBackground,
          {
            width: containerWidth / 2,
            transform: [{ translateX }],
          }
        ]} 
      />
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={styles.option}
          onPress={() => onChange(index)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.optionText,
            selectedIndex === index && styles.selectedOptionText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2a1335',
    borderRadius: 100,
    height: 50,
    padding: 4,
    position: 'relative',
    marginHorizontal: 20,
  },
  selectedBackground: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: 'white',
    borderRadius: 100,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#9702E7',
  },
}); 