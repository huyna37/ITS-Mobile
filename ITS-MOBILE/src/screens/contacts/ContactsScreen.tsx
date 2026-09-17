import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HighwayHeader } from '../../components/shared/HighwayHeader';
import { PhoneHandsetIcon } from '../../components/icons/SvgIcons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useContactsStore } from '../../store/useContactsStore';
import { triggerPBXCall } from '../../utils/dialer';
import { Contact, CallRecord } from '../../types/contacts';
import { COLORS } from '../../constants/colors';
import { formatCallDateTime } from '../../utils/formatting';

export const ContactsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'HISTORY'>('DIRECTORY');

  const {
    contacts,
    callHistory,
    isLoading,
    fetchContacts,
    fetchHistory,
    recordCall,
  } = useContactsStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Tự động làm mới lịch sử cuộc gọi mỗi khi người dùng mở màn hình Liên lạc
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const handleCall = (contact: Contact) => {
    triggerPBXCall(contact.extension, contact.name);
  };

  const initialLetter = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'T';
    return trimmed.charAt(0).toUpperCase();
  };

  const handleRefresh = async () => {
    await Promise.all([fetchContacts(), fetchHistory()]);
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header cao tốc chuẩn thiết kế */}
        <HighwayHeader />

        {/* Tiêu đề màn hình */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Liên lạc PBX</Text>
        </View>

        {/* Segment Tabs: Danh bạ | Lịch sử */}
        <View style={styles.segmentWrapper}>
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[
                styles.segmentTab,
                activeTab === 'DIRECTORY' && styles.segmentTabActive,
              ]}
              onPress={() => setActiveTab('DIRECTORY')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  activeTab === 'DIRECTORY' && styles.segmentTabTextActive,
                ]}
              >
                Danh bạ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentTab,
                activeTab === 'HISTORY' && styles.segmentTabActive,
              ]}
              onPress={() => {
                setActiveTab('HISTORY');
                fetchHistory();
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  activeTab === 'HISTORY' && styles.segmentTabTextActive,
                ]}
              >
                🕒 Lịch sử
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'DIRECTORY' ? (
          <>
            {/* Header danh bạ nội bộ */}
            <View style={styles.subHeaderRow}>
              <Text style={styles.subHeaderTitle}>Danh bạ nội bộ</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.statusFilterText}>Online / offline</Text>
              </TouchableOpacity>
            </View>

            {/* Khối card danh bạ chứa các dòng liên lạc */}
            <View style={styles.contactsCard}>
              {isLoading && contacts.length === 0 ? (
                <LoadingSpinner message="Đang tải danh bạ..." />
              ) : (
                contacts.map((contact, index) => {
                  const isOnline = contact.extension !== '8501'; // Trạm IC12 offline như trong thiết kế
                  const isLast = index === contacts.length - 1;

                  return (
                    <React.Fragment key={contact.id}>
                      <View style={styles.contactRow}>
                        {/* Avatar Squircle */}
                        <View style={styles.avatarSquircle}>
                          <Text style={styles.avatarLetter}>
                            {initialLetter(contact.name)}
                          </Text>
                          {isOnline ? <View style={styles.onlineDot} /> : null}
                        </View>

                        {/* Thông tin Contact */}
                        <View style={styles.contactInfo}>
                          <Text style={styles.contactName} numberOfLines={1}>
                            {contact.name}
                          </Text>
                          <Text style={styles.contactExt}>
                            Extension: {contact.extension}
                          </Text>
                        </View>

                        {/* Nút gọi PBX */}
                        <TouchableOpacity
                          style={styles.callButton}
                          activeOpacity={0.7}
                          onPress={() => handleCall(contact)}
                        >
                          <PhoneHandsetIcon size={20} color="#0284c7" />
                        </TouchableOpacity>
                      </View>

                      {!isLast ? <View style={styles.rowDivider} /> : null}
                    </React.Fragment>
                  );
                })
              )}
            </View>

            {/* Ghi chú dưới card */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Bấm icon điện thoại để ghi lịch sử cuộc gọi cục bộ trên thiết bị (chưa kết nối VoIP).
              </Text>
            </View>
          </>
        ) : (
          /* Tab Lịch sử cuộc gọi */
          <View style={styles.historySection}>
            <View style={styles.contactsCard}>
              {callHistory.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Text style={styles.emptyHistoryText}>Chưa có cuộc gọi nào</Text>
                </View>
              ) : (
                callHistory.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <View style={styles.contactRow}>
                      <View style={styles.historyIconBox}>
                        <Text style={styles.historyArrow}>
                          {item.type === 'INCOMING' ? '↙' : '↗'}
                        </Text>
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.contactName}</Text>
                        <Text style={styles.contactExt}>
                          Ext: {item.extension}
                        </Text>
                        <Text style={styles.contactTime}>
                          Bắt đầu: {formatCallDateTime(item.timestamp)}
                        </Text>
                      </View>
                      <Text style={styles.durationText}>
                        {item.durationSeconds > 0 ? `${item.durationSeconds}s` : 'Nhỡ'}
                      </Text>
                    </View>
                    {index < callHistory.length - 1 ? (
                      <View style={styles.rowDivider} />
                    ) : null}
                  </React.Fragment>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dff1fd',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 150,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  segmentWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  segmentTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  segmentTabTextActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  subHeaderRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0090e7',
  },
  contactsCard: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatarSquircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 14,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: '#64748b',
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  contactExt: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  contactTime: {
    fontSize: 12,
    color: '#0284c7',
    marginTop: 3,
    fontWeight: '600',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  noteContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  noteText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  historySection: {
    marginTop: 4,
  },
  historyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0284c7',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  emptyHistoryBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
