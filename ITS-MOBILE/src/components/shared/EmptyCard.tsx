import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY } from '../../constants';

interface EmptyCardProps {
  message: string;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({ message }) => {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.gray200,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: COLORS.gray400,
    fontWeight: '500',
  },
});
