import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import {
  NotificationListSkeleton,
  NotificationItemSkeleton,
} from '../../components/common/SkeletonLoading';
import { BellIcon } from '../../components/icons/SvgIcons';
import { HighwayHeader } from '../../components/shared/HighwayHeader';
import { AppRoutes } from '../../constants';
import { RootStackParamList } from '../../navigation/types';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import { useTasksStore } from '../../store/useTasksStore';
import { NotificationItem } from '../../types/notifications';
import { styles } from './NotificationsScreen.styles';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    fetchNotifications,
    loadMoreNotifications,
    toggleNotificationRead,
  } = useNotificationsStore();

  const { tasks, selectTask } = useTasksStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const handleLoadMore = useCallback(() => {
    loadMoreNotifications();
  }, [loadMoreNotifications]);

  const handleNotificationPress = (item: NotificationItem) => {
    // Chạm để toggle trạng thái Đã đọc <-> Chưa đọc
    toggleNotificationRead(item.id);

    // Nếu thông báo gắn với nhiệm vụ và đang chưa đọc -> mở chi tiết nhiệm vụ
    if (!item.isRead && item.taskId) {
      const targetTask = tasks.find(t => t.id === item.taskId);
      if (targetTask) {
        selectTask(targetTask);
        navigation.navigate(AppRoutes.TASK_DETAIL, { task: targetTask });
      }
    }
  };

  const renderHeader = () => (
    <View>
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
    </View>
  );

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const isUnread = !item.isRead;

    return (
      <View style={styles.listContainer}>
        <TouchableOpacity
          style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
          activeOpacity={0.8}
          onPress={() => handleNotificationPress(item)}
        >
          {/* Icon squircle */}
          <View
            style={[
              styles.iconSquircle,
              isUnread ? styles.iconSquircleUnread : styles.iconSquircleRead,
            ]}
          >
            <BellIcon size={22} color={isUnread ? '#ffffff' : '#94a3b8'} />
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
      </View>
    );
  };

  const renderFooter = () => {
    // Khi đang lazy load trang tiếp theo -> hiển thị Skeleton shimmer
    if (isLoadingMore) {
      return (
        <View style={[styles.listContainer, styles.loadingMoreContainer]}>
          <NotificationItemSkeleton rowIndex={notifications.length} />
          <NotificationItemSkeleton rowIndex={notifications.length + 1} />
        </View>
      );
    }

    // Đã cuộn hết toàn bộ thông báo
    if (!hasMore && notifications.length > 0) {
      return (
        <View style={styles.endListNotice}>
          <Text style={styles.endListNoticeText}>Đã hiển thị tất cả thông báo</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.listContainer}>
          <NotificationListSkeleton count={5} />
        </View>
      );
    }

    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={isLoading && notifications.length === 0 ? [] : notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotificationItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0090e7']}
            tintColor="#0090e7"
          />
        }
      />
    </View>
  );
};
