import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperPlaneIcon, SearchIcon, CloseIcon } from '../icons/SvgIcons';
import { HIGHWAY_CONSTANTS, FONT_FAMILY } from '../../constants';

interface HighwayHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearchPress?: () => void;
  isSearching?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onCloseSearch?: () => void;
  searchPlaceholder?: string;
}

export const HighwayHeader: React.FC<HighwayHeaderProps> = ({
  title = HIGHWAY_CONSTANTS.NAME,
  subtitle = HIGHWAY_CONSTANTS.SUBTITLE,
  showSearch = true,
  onSearchPress,
  isSearching: controlledSearching,
  searchQuery = '',
  onSearchChange,
  onCloseSearch,
  searchPlaceholder = 'Tìm theo mã, vị trí Km, sự cố...',
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topPadding = Math.max(insets.top, statusBarHeight, 32) + 12;

  const [localSearching, setLocalSearching] = useState(false);
  const isSearchActive = controlledSearching !== undefined ? controlledSearching : localSearching;

  const handleOpenSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      setLocalSearching(true);
    }
  };

  const handleCloseSearch = () => {
    if (onCloseSearch) {
      onCloseSearch();
    } else {
      setLocalSearching(false);
    }
  };

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      {isSearchActive ? (
        <View style={styles.searchBarRow}>
          <View style={styles.searchInputWrap}>
            <SearchIcon size={18} color="#0097f0" />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                activeOpacity={0.7}
                onPress={() => onSearchChange && onSearchChange('')}
              >
                <CloseIcon size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.cancelSearchBtn}
            activeOpacity={0.7}
            onPress={handleCloseSearch}
          >
            <Text style={styles.cancelSearchText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerTop}>
          {/* Nút phi thuyền tròn xanh chuẩn thiết kế căn chính tâm */}
          <View style={styles.navButton}>
            <PaperPlaneIcon size={22} color="#ffffff" />
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
              onPress={handleOpenSearch}
            >
              <SearchIcon size={20} color="#475569" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderButton} />
          )}
        </View>
      )}
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
  titleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#0097f0',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
    color: '#7ba0bf',
    letterSpacing: 1.8,
    marginTop: 3,
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
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  searchInputWrap: {
    flex: 1,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#0097f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  cancelSearchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelSearchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0097f0',
  },
});

