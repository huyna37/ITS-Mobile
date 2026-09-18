import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IncidentTask } from '../../types/tasks';
import { ChevronRightIcon } from '../icons/SvgIcons';
import {
  COLORS,
  UI_ICONS,
  TASK_STATUS_LABELS,
  THEME_CONSTANTS,
  FONT_FAMILY,
} from '../../constants';
import { formatMilestone, formatFullDateTime } from '../../utils/formatting';

interface IncidentTaskCardProps {
  task: IncidentTask;
  onPress: () => void;
}

export const IncidentTaskCard: React.FC<IncidentTaskCardProps> = ({ task, onPress }) => {
  const isReceived: boolean = task.step === 'RECEIVED';
  const isUrgent: boolean = task.priority === 'P0' || task.priority === 'P1';

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Vạch màu trạng thái bên trái cong theo card */}
      <View
        style={[
          styles.accentBorder,
          {
            backgroundColor: isUrgent ? '#ef4444' : '#f59e0b',
          },
        ]}
      />

      <View style={styles.cardBody}>
        {/* Icon squircle cảnh báo */}
        <View
          style={[
            styles.alertIconSquircle,
            {
              backgroundColor: isUrgent ? '#fee2e2' : '#fef3c7',
            },
          ]}
        >
          <Text
            style={[
              styles.alertEmoji,
              {
                color: isUrgent ? '#ef4444' : '#d97706',
              },
            ]}
          >
            !
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.codeAndBadgeRow}>
            <Text style={styles.taskCode}>{task.code}</Text>
            <View
              style={[
                styles.stepBadge,
                {
                  backgroundColor: isReceived ? '#fef3c7' : '#dbeafe',
                },
              ]}
            >
              <Text
                style={[
                  styles.stepBadgeText,
                  {
                    color: isReceived ? '#b45309' : '#2563eb',
                  },
                ]}
              >
                {isReceived ? 'Đã tiếp nhận' : 'Đang xử lý'}
              </Text>
            </View>
          </View>

          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>
                📍 Km {task.milestoneKm}+{task.milestoneM < 100 ? `0${task.milestoneM}` : task.milestoneM}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>
                🕒 {formatFullDateTime(task.createdAt) || '14:20 20/04/2026'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chevronBox}>
          <ChevronRightIcon size={18} color="#94a3b8" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 18,
  },
  alertIconSquircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  alertEmoji: {
    fontSize: 26,
    fontWeight: '900',
  },
  cardInfo: {
    flex: 1,
  },
  codeAndBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskCode: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
  },
  taskTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaPill: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  metaPillText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chevronBox: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
