import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { ContactRow } from '../../components/modules/ContactRow';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useContactsStore } from '../../store/useContactsStore';
import { triggerPBXCall } from '../../utils/dialer';
import { Contact, CallRecord } from '../../types/contacts';
import { COLORS } from '../../constants/colors';
import { formatTime, formatVietnameseDate } from '../../utils/formatting';

export const ContactsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'HISTORY'>('DIRECTORY');
  const [searchText, setSearchText] = useState('');

  const {
    contacts,
    callHistory,
    isLoading,
    fetchContacts,
    recordCall,
  } = useContactsStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCall = (contact: Contact) => {
    recordCall(contact);
    triggerPBXCall(contact.extension, contact.name);
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchText.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.extension.includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  const renderCallRecord = ({ item }: { item: CallRecord }) => (
    <View style={styles.historyRow}>
      <View style={styles.historyIconBox}>
        <Text style={styles.historyIcon}>
          {item.type === 'INCOMING' ? '↙️' : item.type === 'OUTGOING' ? '↗️' : '❌'}
        </Text>
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyName}>{item.contactName}</Text>
        <Text style={styles.historyMeta}>
          Ext: {item.extension} • {formatTime(item.timestamp)}
        </Text>
      </View>
      <Text style={styles.historyDuration}>
        {item.durationSeconds > 0 ? `${item.durationSeconds}s` : 'Nhỡ'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header
        title="Liên Lạc & Danh Bạ PBX"
        subtitle={formatVietnameseDate()}
      />

      {/* Segment tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'DIRECTORY' && styles.segmentActive]}
          onPress={() => setActiveTab('DIRECTORY')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'DIRECTORY' && styles.segmentTextActive,
            ]}
          >
            Danh bạ nội bộ ({contacts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'HISTORY' && styles.segmentActive]}
          onPress={() => setActiveTab('HISTORY')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'HISTORY' && styles.segmentTextActive,
            ]}
          >
            Lịch sử cuộc gọi ({callHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input for Directory */}
      {activeTab === 'DIRECTORY' ? (
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Tìm theo tên hoặc số extension 4 số..."
            placeholderTextColor={COLORS.gray400}
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message="Đang tải danh bạ tổng đài..." />
      ) : activeTab === 'DIRECTORY' ? (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactRow contact={item} onCall={handleCall} />
          )}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchContacts} />
          }
          ListEmptyComponent={
            <EmptyState
              title="Không tìm thấy liên hệ"
              description="Thử tìm kiếm với tên hoặc số extension khác"
            />
          }
        />
      ) : (
        <FlatList
          data={callHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderCallRecord}
          ListEmptyComponent={
            <EmptyState
              title="Chưa có lịch sử cuộc gọi"
              description="Các cuộc gọi nội bộ PBX sẽ được lưu tại đây"
              iconText="📞"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 4,
  },
  segmentActive: {
    backgroundColor: COLORS.primaryLight,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  segmentTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray900,
  },
  clearText: {
    color: COLORS.gray400,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  historyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyIcon: {
    fontSize: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  historyMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  historyDuration: {
    fontSize: 12,
    color: COLORS.gray400,
  },
});
