import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/common/Header';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { useTasksStore } from '../../store/useTasksStore';
import { RootStackParamList } from '../../navigation/types';
import { NotificationItem } from '../../types/notifications';
import { formatTime, formatVietnameseDate } from '../../utils/formatting';
import { COLORS } from '../../constants/colors';
import { AppRoutes } from '../../constants/routes';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    toggleNotificationRead,
    markAllAsRead,
  } = useNotificationsStore();

  const { tasks, selectTask } = useTasksStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = (item: NotificationItem) => {
    // Đánh dấu đã đọc khi chạm
    if (!item.isRead) {
      toggleNotificationRead(item.id);
    }

    // Deep linking: Nếu notification trỏ tới taskId, mở thẳng TaskDetail
    if (item.taskId) {
      const targetTask = tasks.find((t) => t.id === item.taskId);
      if (targetTask) {
        selectTask(targetTask);
        navigation.navigate(AppRoutes.TASK_DETAIL, { task: targetTask });
      }
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
        style={[styles.itemCard, !item.isRead && styles.itemUnread]}
      >
        <View style={styles.itemHeader}>
          <View style={styles.titleBox}>
            {!item.isRead ? <View style={styles.unreadDot} /> : null}
            <Text style={[styles.title, !item.isRead && styles.titleUnread]}>
              {item.title}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>

        <Text style={styles.bodyText}>{item.body}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.dateText}>{formatVietnameseDate(item.timestamp)}</Text>
          {item.taskId ? (
            <Text style={styles.deepLinkHint}>Bấm để mở sự cố ➔</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header
        title={`Thông Báo (${unreadCount} chưa đọc)`}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Đang tải thông báo TMC..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchNotifications}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Không có thông báo mới"
              description="Các cảnh báo sự cố từ TMC sẽ hiển thị tại đây"
              iconText="🔔"
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
  listContent: {
    padding: 16,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  itemUnread: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  titleUnread: {
    fontWeight: '800',
    color: COLORS.gray900,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 6,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  deepLinkHint: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
