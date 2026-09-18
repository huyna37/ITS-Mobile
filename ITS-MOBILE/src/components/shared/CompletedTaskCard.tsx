import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IncidentTask } from '../../types/tasks';
import {
  COLORS,
  UI_ICONS,
  TASK_STATUS_LABELS,
  THEME_CONSTANTS,
  FONT_FAMILY,
} from '../../constants';
import { formatMilestone, formatFullDateTime } from '../../utils/formatting';

interface CompletedTaskCardProps {
  task: IncidentTask;
  onPress?: () => void;
}

export const CompletedTaskCard: React.FC<CompletedTaskCardProps> = ({ task, onPress }) => {
  const displayTime = formatFullDateTime(task.updatedAt) || '14:30 20/04/2026';

  const content = (
    <View style={styles.completedCard}>
      <View style={styles.completedAccent} />
      <View style={styles.completedIconBox}>
        <Text style={styles.checkIcon}>{UI_ICONS.CHECKMARK}</Text>
      </View>
      <View style={styles.completedInfo}>
        <View style={styles.codeAndBadgeRow}>
          <Text style={styles.completedCode}>{task.code}</Text>
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>{TASK_STATUS_LABELS.COMPLETED}</Text>
          </View>
        </View>
        <Text style={styles.completedTitle} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.completedMeta}>
          {UI_ICONS.LOCATION_PIN} {formatMilestone(task.milestoneKm, task.milestoneM, task.direction)} · {displayTime}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  completedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  completedAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.success,
  },
  completedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: THEME_CONSTANTS.SUCCESS_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginRight: 10,
  },
  checkIcon: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: '900',
  },
  completedInfo: {
    flex: 1,
  },
  codeAndBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedCode: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  completedTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 3,
  },
  completedMeta: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
});
