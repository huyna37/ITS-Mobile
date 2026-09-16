import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HighwayHeader } from '../../components/shared/HighwayHeader';
import { BellIcon } from '../../components/icons/SvgIcons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { useTasksStore } from '../../store/useTasksStore';
import { RootStackParamList } from '../../navigation/types';
import { NotificationItem } from '../../types/notifications';
import { AppRoutes } from '../../constants/routes';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    toggleNotificationRead,
  } = useNotificationsStore();

  const { tasks, selectTask } = useTasksStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.isRead) {
      toggleNotificationRead(item.id);
    }

    if (item.taskId) {
      const targetTask = tasks.find((t) => t.id === item.taskId);
      if (targetTask) {
        selectTask(targetTask);
        navigation.navigate(AppRoutes.TASK_DETAIL, { task: targetTask });
      }
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchNotifications}
            colors={['#0090e7']}
            tintColor="#0090e7"
          />
        }
      >
        {/* Header cao tốc chuẩn thiết kế */}
        <HighwayHeader />

        {/* Tiêu đề & Badge Chưa đọc */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Thông báo</Text>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreadCount > 0 ? `${unreadCount} chưa đọc` : '0 chưa đọc'}
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitleText}>Đã đọc / chưa đọc</Text>
        </View>

        {/* Danh sách thông báo dạng pill cards riêng biệt */}
        <View style={styles.listContainer}>
          {isLoading && notifications.length === 0 ? (
            <LoadingSpinner message="Đang tải thông báo..." />
          ) : (
            notifications.map((item) => {
              const isUnread = !item.isRead;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notificationCard,
                    isUnread && styles.notificationCardUnread,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationPress(item)}
                >
                  {/* Icon squircle */}
                  <View
                    style={[
                      styles.iconSquircle,
                      isUnread
                        ? styles.iconSquircleUnread
                        : styles.iconSquircleRead,
                    ]}
                  >
                    <BellIcon
                      size={22}
                      color={isUnread ? '#ffffff' : '#94a3b8'}
                    />
                  </View>

                  {/* Nội dung thông báo */}
                  <View style={styles.cardContent}>
                    <View style={styles.topContentRow}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemTime}>{item.timestamp}</Text>
                    </View>
                    <Text style={styles.itemBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 120,
  },
  titleRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  subtitleRow: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
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
  notificationCardUnread: {
    borderColor: '#e0f2fe',
    backgroundColor: '#fcfdff',
  },
  iconSquircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconSquircleUnread: {
    backgroundColor: '#0090e7',
  },
  iconSquircleRead: {
    backgroundColor: '#f1f5f9',
  },
  cardContent: {
    flex: 1,
  },
  topContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  itemBody: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
