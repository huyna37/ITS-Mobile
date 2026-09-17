import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILY } from '../../constants/typography';
import { TaskStep, TaskPriority } from '../../types/tasks';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: COLORS.successLight, text: COLORS.successDark };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warningDark };
      case 'danger':
        return { bg: COLORS.dangerLight, text: COLORS.dangerDark };
      case 'neutral':
        return { bg: COLORS.gray100, text: COLORS.gray600 };
      case 'primary':
      default:
        return { bg: COLORS.primaryLight, text: COLORS.primaryDark };
    }
  };

  const { bg, text } = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: text }, textStyle]}>{label}</Text>
    </View>
  );
};

export const TaskStepBadge: React.FC<{ step: TaskStep }> = ({ step }) => {
  switch (step) {
    case 'RECEIVED':
      return <Badge label="1. Đã nhận" variant="warning" />;
    case 'IN_PROGRESS':
      return <Badge label="2. Đang xử lý" variant="primary" />;
    case 'COMPLETED':
      return <Badge label="3. Hoàn thành" variant="success" />;
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case 'P0':
      return <Badge label="Khẩn cấp P0" variant="danger" />;
    case 'P1':
      return <Badge label="Ưu tiên cao P1" variant="warning" />;
    case 'P2':
      return <Badge label="Bình thường P2" variant="primary" />;
    case 'P3':
      return <Badge label="Thấp P3" variant="neutral" />;
  }
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
  },
});
