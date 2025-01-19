import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';

interface CheckBoxProps {
  checked?: boolean;
  onPress?: () => void;
}

export const CheckBox: React.FC<CheckBoxProps> = ({ checked, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {checked && (
          <Image 
            source={require('../../assets/images/check.png')} 
            style={{ width: 16, height: 16 }} 
            resizeMode="contain"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
