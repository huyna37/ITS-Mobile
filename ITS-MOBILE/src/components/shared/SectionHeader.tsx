import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, THEME_CONSTANTS, FONT_FAMILY } from '../../constants';

export type SectionBadgeType = 'primary' | 'gray' | 'success';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeType?: SectionBadgeType;
  rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeType = 'primary',
  rightElement,
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'gray':
        return {
          container: styles.watchBadge,
          text: styles.watchBadgeText,
        };
      case 'success':
        return {
          container: styles.successBadge,
          text: styles.successBadgeText,
        };
      case 'primary':
      default:
        return {
          container: styles.countBadge,
          text: styles.countBadgeText,
        };
    }
  };

  const badgeStyles = getBadgeStyle();

  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>

      {rightElement ? (
        rightElement
      ) : badgeText ? (
        <View style={badgeStyles.container}>
          <Text style={badgeStyles.text}>{badgeText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  countBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: 0.3,
  },
  watchBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  watchBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  successBadge: {
    backgroundColor: THEME_CONSTANTS.SUCCESS_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME_CONSTANTS.SUCCESS_BORDER,
  },
  successBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
});
