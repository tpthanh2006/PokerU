import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface GameAvatarProps {
  title: string;
  size?: number;
}

export const GameAvatar = ({ title = '', size = 40 }: GameAvatarProps) => {
  // Get initials from title (up to 2 characters)
  const getInitials = (text: string) => {
    if (!text) return '??';
    
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size,
        borderRadius: size / 2
      }
    ]}>
      <Text style={[
        styles.text,
        { fontSize: size * 0.35 }
      ]}>
        {getInitials(title)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#BB86FC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
}); 