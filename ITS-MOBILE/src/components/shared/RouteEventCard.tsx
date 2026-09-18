import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExpresswayEvent } from '../../types/tasks';
import { BarrierIcon, CloudRainIcon } from '../icons/SvgIcons';
import {
  COLORS,
  UI_ICONS,
  EVENT_TAG_LABELS,
  FONT_FAMILY,
} from '../../constants';
import { formatFullDateTime } from '../../utils/formatting';

interface RouteEventCardProps {
  event: ExpresswayEvent;
}

export const RouteEventCard: React.FC<RouteEventCardProps> = ({ event }) => {
  const renderIcon = () => {
    if (event.type === 'CONSTRUCTION') {
      return <BarrierIcon size={24} color="#f59e0b" />;
    }
    if (event.type === 'WEATHER') {
      return <CloudRainIcon size={24} color="#0284c7" />;
    }
    return <Text style={styles.eventEmoji}>{UI_ICONS.ALERT_WARNING}</Text>;
  };

  const getEventTagLabel = (type: ExpresswayEvent['type']): string => {
    switch (type) {
      case 'WEATHER':
        return EVENT_TAG_LABELS.WEATHER;
      case 'CONSTRUCTION':
        return EVENT_TAG_LABELS.CONSTRUCTION;
      case 'TRAFFIC_JAM':
        return EVENT_TAG_LABELS.TRAFFIC_JAM;
      case 'ACCIDENT':
        return EVENT_TAG_LABELS.ACCIDENT;
      default:
        return EVENT_TAG_LABELS.ACCIDENT;
    }
  };

  const displayTime = formatFullDateTime(event.time) || event.time;

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventIconBox}>
        {renderIcon()}
      </View>
      <View style={styles.eventInfo}>
        <View style={styles.eventHeaderRow}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.eventTag}>
            <Text style={styles.eventTagText}>{getEventTagLabel(event.type)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.eventLocation}>
            📍 {event.location}
          </Text>
          <Text style={styles.eventTime}>
            🕒 {displayTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  eventIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  eventTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  eventTagText: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventLocation: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  eventTime: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
});
