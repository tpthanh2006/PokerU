import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(187, 134, 252, 0.15)', 'rgba(187, 134, 252, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <TouchableOpacity 
          onPress={toggleExpand}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>{title}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#BB86FC"
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.content}>
            {children}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gradientCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(187, 134, 252, 0.2)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    color: '#BB86FC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(187, 134, 252, 0.2)',
    backgroundColor: 'rgba(187, 134, 252, 0.05)',
  },
});
