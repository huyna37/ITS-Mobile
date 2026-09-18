import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  PanResponder,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HighwayHeader } from '../../components/shared/HighwayHeader';
import { PhoneHandsetIcon, TrashIcon } from '../../components/icons/SvgIcons';
import { ContactListSkeleton } from '../../components/common';
import { useContactsStore } from '../../store/useContactsStore';
import { triggerPBXCall } from '../../utils/dialer';
import { Contact, CallRecord } from '../../types/contacts';
import { COLORS } from '../../constants';
import { formatTime, formatCallHistoryTime } from '../../utils/formatting';
import { showAppToast } from '../../store/useToastStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './ContactsScreen.styles';

interface SwipeableCallRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const SwipeableCallRow: React.FC<SwipeableCallRowProps> = ({
  children,
  onDelete,
  isOpen,
  onOpen,
  onClose,
}) => {
  const pan = useRef(new Animated.Value(0)).current;

  // Khi có dòng khác được mở -> tự động đóng dòng này lại
  useEffect(() => {
    if (!isOpen) {
      Animated.spring(pan, {
        toValue: 0,
        useNativeDriver: false,
        bounciness: 3,
      }).start();
    }
  }, [isOpen, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        if (!isOpen) {
          onOpen();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          const newX = isOpen ? Math.max(-120, gestureState.dx - 76) : Math.max(-120, gestureState.dx);
          pan.setValue(newX);
        } else if (isOpen && gestureState.dx > 0) {
          pan.setValue(Math.min(0, -76 + gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -35 || (isOpen && gestureState.dx < 20)) {
          Animated.spring(pan, {
            toValue: -76,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          onOpen();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          onClose();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(pan, {
      toValue: -400,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onDelete();
    });
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Nút Xóa phong cách iOS khi vuốt sang trái */}
      <View style={styles.deleteActionBox}>
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.75}
          onPress={handleDelete}
          accessibilityLabel="Xóa bản ghi"
        >
          <View style={styles.deleteIconBox}>
            <TrashIcon size={22} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.swipeContent,
          { transform: [{ translateX: pan }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export const ContactsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'HISTORY'>('DIRECTORY');
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const {
    contacts,
    callHistory,
    isLoading,
    fetchContacts,
    fetchHistory,
    recordCall,
    deleteCallRecord,
  } = useContactsStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    setOpenRowId(null);
  }, [activeTab]);

  // Tự động làm mới lịch sử cuộc gọi mỗi khi người dùng mở màn hình Liên lạc
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const handleCall = (contact: Contact) => {
    triggerPBXCall(contact.extension, contact.name, async () => {
      await recordCall(contact, 45, 1);
    });
  };

  const handleDeleteCall = async (id: string, contactName?: string) => {
    await deleteCallRecord(id);
    const who = contactName && contactName !== 'Không rõ' ? `với ${contactName}` : '';
    showAppToast(
      'success',
      'Nhật ký cuộc gọi',
      who ? `Đã xóa lịch sử đàm thoại ${who}` : 'Đã xóa cuộc gọi khỏi nhật ký liên lạc'
    );
  };

  const initialLetter = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'T';
    return trimmed.charAt(0).toUpperCase();
  };

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Chuyển động mượt mà: thu bé 2 tab và ghim mượt mà khi cuộn xuống dưới
  const tabScale = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.88],
    extrapolate: 'clamp',
  });

  const tabPaddingVertical = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [10, 6],
    extrapolate: 'clamp',
  });

  const wrapperPaddingHorizontal = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [16, 44],
    extrapolate: 'clamp',
  });

  const wrapperPaddingVertical = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [8, 4],
    extrapolate: 'clamp',
  });

  const stickyTopPadding = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, Math.max(insets.top, 0)],
    extrapolate: 'clamp',
  });

  const borderBottomColor = scrollY.interpolate({
    inputRange: [50, 140],
    outputRange: ['rgba(226, 232, 240, 0)', 'rgba(226, 232, 240, 1)'],
    extrapolate: 'clamp',
  });

  const shadowOpacity = scrollY.interpolate({
    inputRange: [50, 140],
    outputRange: [0, 0.08],
    extrapolate: 'clamp',
  });

  const elevation = scrollY.interpolate({
    inputRange: [50, 140],
    outputRange: [0, 3],
    extrapolate: 'clamp',
  });
  const handleRefresh = async () => {
    await Promise.all([fetchContacts(), fetchHistory()]);
  };

  return (
    <View style={styles.safeArea}>
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        stickyHeaderIndices={[2]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Index 0: Header cao tốc chuẩn thiết kế */}
        <HighwayHeader />

        {/* Index 1: Tiêu đề màn hình */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Liên lạc PBX</Text>
        </View>

        {/* Index 2: Segment Tabs: Danh bạ | Lịch sử (Sticky & Collapsible) */}
        <Animated.View
          style={[
            styles.stickySegmentWrapper,
            {
              paddingHorizontal: wrapperPaddingHorizontal,
              paddingTop: stickyTopPadding,
              paddingBottom: wrapperPaddingVertical,
              borderBottomColor: borderBottomColor,
              shadowOpacity: shadowOpacity,
              elevation: elevation,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.segmentContainer,
              {
                transform: [{ scale: tabScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setActiveTab('DIRECTORY')}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.segmentTab,
                  activeTab === 'DIRECTORY' && styles.segmentTabActive,
                  { paddingVertical: tabPaddingVertical },
                ]}
              >
                <Text
                  style={[
                    styles.segmentTabText,
                    activeTab === 'DIRECTORY' && styles.segmentTabTextActive,
                  ]}
                >
                  Danh bạ
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                setActiveTab('HISTORY');
                fetchHistory();
              }}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.segmentTab,
                  activeTab === 'HISTORY' && styles.segmentTabActive,
                  { paddingVertical: tabPaddingVertical },
                ]}
              >
                <Text
                  style={[
                    styles.segmentTabText,
                    activeTab === 'HISTORY' && styles.segmentTabTextActive,
                  ]}
                >
                  🕒 Lịch sử
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

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
                <ContactListSkeleton count={6} type="DIRECTORY" />
              ) : (
                contacts.map((contact, index) => {
                  const isOnline = contact.isOnline ?? (contact.extension !== '8501');
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
                          accessibilityLabel={`Gọi ${contact.name}`}
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
              {isLoading && callHistory.length === 0 ? (
                <ContactListSkeleton count={6} type="HISTORY" />
              ) : callHistory.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Text style={styles.emptyHistoryText}>Chưa có cuộc gọi nào</Text>
                </View>
              ) : (
                callHistory.map((item, index) => {
                  const isMissed = item.type === 'MISSED' || item.durationSeconds === 0;
                  return (
                    <React.Fragment key={item.id}>
                      <SwipeableCallRow
                        isOpen={openRowId === item.id}
                        onOpen={() => setOpenRowId(item.id)}
                        onClose={() => setOpenRowId(prev => (prev === item.id ? null : prev))}
                        onDelete={() => {
                          setOpenRowId(null);
                          handleDeleteCall(item.id, item.contactName);
                        }}
                      >
                        <View style={styles.contactRow}>
                          {/* Avatar Squircle: đỏ nhạt nổi bật khi cuộc gọi nhỡ */}
                          <View
                            style={[
                              styles.avatarSquircle,
                              isMissed && styles.missedAvatarSquircle,
                            ]}
                          >
                            <Text
                              style={[
                                styles.avatarLetter,
                                isMissed && styles.missedAvatarLetter,
                              ]}
                            >
                              {initialLetter(item.contactName)}
                            </Text>
                          </View>
                          <View style={styles.contactInfo}>
                            <Text
                              style={[
                                styles.contactName,
                                isMissed && styles.missedContactName,
                              ]}
                              numberOfLines={1}
                            >
                              {item.contactName}
                            </Text>
                            <Text style={styles.contactExt}>
                              Ext: {item.extension} · {formatCallHistoryTime(item.timestamp)}
                            </Text>
                          </View>

                          {/* Nhãn trạng thái cuộc gọi: Badge đỏ 'Cuộc gọi nhỡ' hoặc thời lượng đàm thoại */}
                          {isMissed ? (
                            <View style={styles.missedBadge}>
                              <View style={styles.missedBadgeDot} />
                              <Text style={styles.missedBadgeText}>Cuộc gọi nhỡ</Text>
                            </View>
                          ) : (
                            <View style={styles.durationBadge}>
                              <Text style={styles.durationBadgeText}>
                                {item.durationSeconds >= 60
                                  ? `${Math.floor(item.durationSeconds / 60)}p ${item.durationSeconds % 60}s`
                                  : `${item.durationSeconds}s`}
                              </Text>
                            </View>
                          )}
                        </View>
                      </SwipeableCallRow>
                      {index < callHistory.length - 1 ? (
                        <View style={styles.rowDivider} />
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

