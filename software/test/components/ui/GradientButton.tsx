import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  text: string;
  onPress?: () => void; // Optional onPress prop for handling button presses
}

const GradientButton: React.FC<GradientButtonProps> = ({ text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ borderRadius: 100 }}>
      <LinearGradient
        colors={['#9702E7', '#E14949']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          overflow: 'hidden',
          gap: 8,
          alignSelf: 'stretch',
          paddingHorizontal: 28,
          paddingVertical: 20,
          borderRadius: 100,
          alignItems: 'center', // Center the content
          justifyContent: 'center', // Center the content vertically
        }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#FFFFFF',
          textAlign: 'center', // Center the text
        }}>
          {text}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;