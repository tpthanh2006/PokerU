import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Game should have started');
        onComplete?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;

      setTimeLeft(timeString);
    };

    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    calculateTimeLeft(); // Initial calculation

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  return <Text style={styles.text}>{timeLeft}</Text>;
};

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 