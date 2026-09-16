import React, { useEffect, useState } from 'react';
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
import { TaskCard } from '../../components/modules/TaskCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useTasksStore } from '../../store/useTasksStore';
import { RootStackParamList } from '../../navigation/types';
import { IncidentTask } from '../../types/tasks';
import { COLORS } from '../../constants/colors';
import { AppRoutes } from '../../constants/routes';

export const TasksScreen: React.FC = () => {
  const [filterStep, setFilterStep] = useState<'ACTIVE' | 'DONE'>('ACTIVE');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    tasks,
    events,
    isLoading,
    isRefreshing,
    fetchTasks,
    refreshTasks,
    selectTask,
  } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskPress = (task: IncidentTask) => {
    selectTask(task);
    navigation.navigate(AppRoutes.TASK_DETAIL, { task });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStep === 'ACTIVE') {
      return t.step === 'RECEIVED' || t.step === 'IN_PROGRESS';
    }
    return t.step === 'COMPLETED';
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header title="Nhiệm Vụ Hiện Trường" subtitle="Điều phối từ Trung tâm TMC" />

      {/* Events ticker bar */}
      {events.length > 0 ? (
        <View style={styles.eventTicker}>
          <Text style={styles.eventIcon}>⚠️</Text>
          <Text style={styles.eventText} numberOfLines={1}>
            <Text style={styles.eventBold}>{events[0].title}: </Text>
            {events[0].location}
          </Text>
        </View>
      ) : null}

      {/* Segment switcher */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filterStep === 'ACTIVE' && styles.filterBtnActive]}
          onPress={() => setFilterStep('ACTIVE')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterText,
              filterStep === 'ACTIVE' && styles.filterTextActive,
            ]}
          >
            Đang xử lý (
            {tasks.filter((t) => t.step === 'RECEIVED' || t.step === 'IN_PROGRESS').length}
            )
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterStep === 'DONE' && styles.filterBtnActive]}
          onPress={() => setFilterStep('DONE')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterText,
              filterStep === 'DONE' && styles.filterTextActive,
            ]}
          >
            Đã hoàn thành ({tasks.filter((t) => t.step === 'COMPLETED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading && !isRefreshing ? (
        <LoadingSpinner message="Đang đồng bộ nhiệm vụ hiện trường..." />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={() => handleTaskPress(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshTasks}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={
                filterStep === 'ACTIVE'
                  ? 'Không có sự cố cần xử lý'
                  : 'Chưa có sự cố hoàn thành'
              }
              description={
                filterStep === 'ACTIVE'
                  ? 'Tuyến đường thông suốt. Kéo xuống để cập nhật sự cố mới từ TMC.'
                  : 'Các nhiệm vụ đã hoàn thành nghiệm thu sẽ hiển thị tại đây.'
              }
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
  eventTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  eventIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  eventText: {
    fontSize: 12,
    color: COLORS.warningDark,
    flex: 1,
  },
  eventBold: {
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
});
