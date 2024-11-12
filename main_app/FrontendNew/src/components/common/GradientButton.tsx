import React from 'react';
import { Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientButtonProps {
  text: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({ text }) => {
  return (
    <LinearGradient
      colors={['#9702E7', '#6D00A8']}
      useAngle={true}
      angle={90}
      style={{
        overflow: 'hidden',
        gap: 8,
        alignSelf: 'stretch',
        paddingHorizontal: 28,
        paddingVertical: 20,
        borderRadius: 100,
      }}>
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF'
      }}>{text}</Text>
    </LinearGradient>
  );
};

export default GradientButton;