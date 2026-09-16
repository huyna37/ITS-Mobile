import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { triggerSOSCall } from '../../utils/dialer';

export const FloatingSOS: React.FC = () => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.floatingButton}
      onPress={() => triggerSOSCall()}
    >
      <Text style={styles.sosText}>SOS</Text>
      <Text style={styles.subText}>113</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 84, // Trên tabbar
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  sosText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 18,
  },
  subText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    opacity: 0.9,
  },
});
