import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon, onPress }) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {icon && <Ionicons name={icon} size={24} color="#BB86FC" style={styles.icon} />}
        <View style={styles.textContainer}>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          <Text style={styles.value} numberOfLines={1}>{value}</Text>
        </View>
      </View>
      {onPress && <Ionicons name="pencil" size={20} color="#BB86FC" />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  icon: {
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 4,
    ellipsizeMode: 'tail',
  },
  value: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    ellipsizeMode: 'tail',
  },
}); 