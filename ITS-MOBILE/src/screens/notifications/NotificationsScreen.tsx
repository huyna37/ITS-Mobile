import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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
  const { notifications, unreadCount, isLoading, fetchNotifications, toggleNotificationRead } =
    useNotificationsStore();

  const { tasks, selectTask } = useTasksStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

  return (
    <View style={styles.safeArea}>
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
            notifications.map(item => {
              const isUnread = !item.isRead;

              return (
                <TouchableOpacity
                  key={item.id}
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
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};
