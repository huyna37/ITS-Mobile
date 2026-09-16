import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { TaskStepBadge, PriorityBadge } from '../common/Badge';
import { IncidentTask } from '../../types/tasks';
import { formatMilestone, formatTime } from '../../utils/formatting';
import { COLORS } from '../../constants/colors';

interface TaskCardProps {
  task: IncidentTask;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.codeText}>{task.code}</Text>
        <View style={styles.badgeGroup}>
          <PriorityBadge priority={task.priority} />
          <View style={styles.badgeSpacer} />
          <TaskStepBadge step={task.step} />
        </View>
      </View>

      <Text style={styles.titleText} numberOfLines={2}>
        {task.title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.milestoneBox}>
          <Text style={styles.milestoneIcon}>📍</Text>
          <Text style={styles.milestoneText}>
            {formatMilestone(task.milestoneKm, task.milestoneM, task.direction)}
          </Text>
        </View>
        <Text style={styles.timeText}>{formatTime(task.createdAt)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSpacer: {
    width: 6,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 8,
  },
  milestoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray400,
  },
});
