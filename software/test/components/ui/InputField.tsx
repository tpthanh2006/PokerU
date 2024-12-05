import React from 'react';
import { View, Text, TextInput, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export interface InputFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  icon?: string;
  value?: string;
  onChange?: (text: string) => void;
  multiline?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = 'text',
  icon,
  value,
  onChange,
  multiline,
  ...textInputProps
}) => {
  const ContainerComponent = Platform.OS === 'ios' ? BlurView : View;
  const blurViewProps = Platform.OS === 'ios' ? {
    intensity: 20,
    tint: "light" as const
  } : {};
  
  return (
    <View style={{ flexDirection: 'column', width: '100%', paddingHorizontal: 0 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: 'white', marginBottom: 6 }}>
        {label}
      </Text>
      <ContainerComponent
        {...blurViewProps}
        style={{
          overflow: 'hidden',
          alignItems: 'center',
          paddingVertical: 8,
          marginTop: 1.5,
          width: '100%',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: Platform.OS === 'ios' ? undefined : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 12 }}>
          <TextInput
            secureTextEntry={type === 'password'}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            style={{ 
              flex: 1,
              color: 'white',
              fontSize: 15,
              paddingVertical: 6,
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? 100 : undefined,
            }}
            accessibilityLabel={label}
            {...textInputProps}
          />
          {icon && (
            <Image
              source={{ uri: icon }}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          )}
        </View>
      </ContainerComponent>
    </View>
  );
};