import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useTasksStore } from '../../store/useTasksStore';
import { RootStackParamList } from '../../navigation/types';
import { IncidentTask, ExpresswayEvent } from '../../types/tasks';
import {
  COLORS,
  AppRoutes,
  TASK_SECTION_CONSTANTS,
  THEME_CONSTANTS,
  UI_ICONS,
} from '../../constants';
import {
  HighwayHeader,
  SectionHeader,
  IncidentTaskCard,
  RouteEventCard,
  CompletedTaskCard,
  EmptyCard,
} from '../../shared';
import { CheckCircleIcon } from '../../components/icons/SvgIcons';

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleTaskPress = (task: IncidentTask): void => {
    selectTask(task);
    navigation.navigate(AppRoutes.TASK_DETAIL, { task });
  };

  const q = searchQuery.trim().toLowerCase();

  const activeTasks: IncidentTask[] = tasks
    .filter((t: IncidentTask) => t.step === 'RECEIVED' || t.step === 'IN_PROGRESS')
    .filter((t: IncidentTask) => {
      if (!q) return true;
      const kmStr = `km ${t.milestoneKm}+${t.milestoneM}`.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        kmStr.includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.direction.toLowerCase().includes(q)
      );
    });

  const completedTasks: IncidentTask[] = tasks
    .filter((t: IncidentTask) => t.step === 'COMPLETED')
    .filter((t: IncidentTask) => {
      if (!q) return true;
      const kmStr = `km ${t.milestoneKm}+${t.milestoneM}`.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        kmStr.includes(q)
      );
    });

  const filteredEvents: ExpresswayEvent[] = events.filter((e: ExpresswayEvent) => {
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshTasks}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 1. HEADER CAO TỐC CHUẨN VEC (SHARED) VỚI THANH TÌM KIẾM */}
        <HighwayHeader
          isSearching={isSearching}
          searchQuery={searchQuery}
          onSearchPress={() => setIsSearching(true)}
          onSearchChange={setSearchQuery}
          onCloseSearch={() => {
            setIsSearching(false);
            setSearchQuery('');
          }}
        />

        {/* Dòng ngày tháng hoặc thông tin kết quả tìm kiếm */}
        <View style={styles.dateRow}>
          {isSearching && searchQuery ? (
            <Text style={[styles.dateText, { color: '#0097f0', fontWeight: '700' }]}>
              Kết quả cho "{searchQuery}": {activeTasks.length + completedTasks.length + filteredEvents.length} mục
            </Text>
          ) : (
            <Text style={styles.dateText}>Thứ Hai, 20/04/2026</Text>
          )}
        </View>

        {isLoading && !isRefreshing ? (
          <LoadingSpinner message={TASK_SECTION_CONSTANTS.LOADING_MESSAGE} />
        ) : (
          <>
            {/* 2. KHỐI NHIỆM VỤ ĐƯỢC GIAO */}
            <View style={styles.section}>
              <SectionHeader
                title={TASK_SECTION_CONSTANTS.ASSIGNED_TITLE}
                subtitle={TASK_SECTION_CONSTANTS.ASSIGNED_SUBTITLE}
                badgeText={`${activeTasks.length} ${TASK_SECTION_CONSTANTS.ASSIGNED_UNIT}`}
                badgeType="primary"
              />

              {activeTasks.length === 0 ? (
                <EmptyCard message={TASK_SECTION_CONSTANTS.EMPTY_ASSIGNED} />
              ) : (
                activeTasks.map((task: IncidentTask) => (
                  <IncidentTaskCard
                    key={task.id}
                    task={task}
                    onPress={() => handleTaskPress(task)}
                  />
                ))
              )}
            </View>

            {/* 3. KHỐI SỰ KIỆN TRÊN TUYẾN */}
            <View style={styles.section}>
              <SectionHeader
                title={TASK_SECTION_CONSTANTS.EVENTS_TITLE}
                badgeText={TASK_SECTION_CONSTANTS.EVENTS_BADGE_WATCH}
                badgeType="gray"
              />

              {filteredEvents.length === 0 ? (
                <EmptyCard message={TASK_SECTION_CONSTANTS.EMPTY_EVENTS} />
              ) : (
                filteredEvents.map((ev: ExpresswayEvent) => (
                  <RouteEventCard key={ev.id} event={ev} />
                ))
              )}
            </View>

            {/* 4. KHỐI CÔNG VIỆC GẦN ĐÂY HOÀN THÀNH */}
            <View style={styles.section}>
              <SectionHeader
                title={TASK_SECTION_CONSTANTS.COMPLETED_TITLE}
                subtitle={`${TASK_SECTION_CONSTANTS.COMPLETED_SUBTITLE_PREFIX} (${completedTasks.length})`}
                badgeType="success"
                rightElement={
                  <View style={styles.checkCircle}>
                    <CheckCircleIcon size={32} color="#16a34a" />
                  </View>
                }
              />

              {completedTasks.length === 0 ? (
                <EmptyCard message={TASK_SECTION_CONSTANTS.EMPTY_COMPLETED} />
              ) : (
                completedTasks.map((t: IncidentTask) => (
                  <CompletedTaskCard
                    key={t.id}
                    task={t}
                    onPress={() => handleTaskPress(t)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_CONSTANTS.HEADER_BG,
  },
  container: {
    flex: 1,
    backgroundColor: THEME_CONSTANTS.CONTAINER_BG,
  },
  contentContainer: {
    paddingBottom: 150,
  },
  dateRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME_CONSTANTS.CHECK_CIRCLE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.success,
  },
});
