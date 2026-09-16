import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PaperPlaneIcon, SearchIcon } from '../icons/SvgIcons';
import { HIGHWAY_CONSTANTS } from '../../constants';

interface HighwayHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
}

export const HighwayHeader: React.FC<HighwayHeaderProps> = ({
  title = HIGHWAY_CONSTANTS.NAME,
  subtitle = HIGHWAY_CONSTANTS.SUBTITLE,
  showSearch = true,
  onSearchPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {/* Nút phi thuyền tròn xanh chuẩn thiết kế */}
        <View style={styles.navButton}>
          <View style={styles.planeWrapper}>
            <PaperPlaneIcon size={22} color="#ffffff" />
          </View>
        </View>

        {/* Tiêu đề trung tâm 2 dòng */}
        <View style={styles.titleBox}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        {/* Nút tìm kiếm tròn trắng */}
        {showSearch ? (
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.7}
            onPress={onSearchPress}
          >
            <SearchIcon size={20} color="#475569" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#dff1fd',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0097f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0097f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  planeWrapper: {
    transform: [{ rotate: '-45deg' }],
    marginLeft: 2,
    marginTop: 2,
  },
  titleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0097f0',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8da3b8',
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  placeholderButton: {
    width: 48,
    height: 48,
  },
});

