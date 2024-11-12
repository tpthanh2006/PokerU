import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface TransparentButtonProps extends TouchableOpacityProps {
  label: string;
}

const TransparentButton: React.FC<TransparentButtonProps> = ({ label, ...props }) => {
  return (
    <TouchableOpacity
      style={{
        overflow: 'hidden',
        gap: 8,
        alignSelf: 'stretch',
        paddingHorizontal: 28,
        paddingVertical: 20,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }}
      {...props}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default TransparentButton;