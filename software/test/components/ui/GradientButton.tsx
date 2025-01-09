import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  text: string;
  onPress: () => void;
  colors?: string[];
  disabled?: boolean;
}

export default function GradientButton({ 
  text, 
  onPress, 
  colors = ['#9702E7', '#E14949'],
  disabled = false 
}: GradientButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.text}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    gap: 8,
    alignSelf: 'stretch',
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});