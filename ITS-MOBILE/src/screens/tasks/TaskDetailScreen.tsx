import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PriorityBadge, TaskStepBadge } from '../../components/common/Badge';
import { StateMachineBar } from '../../components/modules/StateMachineBar';
import { useTasksStore } from '../../store/useTasksStore';
import { RootStackParamList } from '../../navigation/types';
import { formatMilestone, formatVietnameseDate, formatTime } from '../../utils/formatting';
import { COLORS } from '../../constants/colors';

export const TaskDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const navigation = useNavigation();
  const { task: initialTask } = route.params;

  const [isUpdating, setIsUpdating] = useState(false);
  const { tasks, advanceTaskStep, addAttachment } = useTasksStore();

  // Luôn lấy task mới nhất từ store
  const task = tasks.find((t) => t.id === initialTask.id) || initialTask;

  const handleAdvanceStep = async () => {
    let confirmMsg = '';
    if (task.step === 'RECEIVED') {
      confirmMsg = 'Chuyển trạng thái sang "2. Đang xử lý"? TMC sẽ nhận được thông báo bạn đã tiếp cận hiện trường.';
    } else if (task.step === 'IN_PROGRESS') {
      confirmMsg = 'Xác nhận hoàn thành xử lý sự cố và gửi báo cáo nghiệm thu lên TMC (Bước 3)?';
    } else {
      return;
    }

    Alert.alert('CẬP NHẬT TIẾN ĐỘ', confirmMsg, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận chuyển bước',
        onPress: async () => {
          setIsUpdating(true);
          const ok = await advanceTaskStep(task.id);
          setIsUpdating(false);
          if (ok) {
            Alert.alert('Thành công', 'Đã cập nhật tiến độ sự cố!');
          }
        },
      },
    ]);
  };

  const handleCapturePhoto = () => {
    Alert.alert(
      'CHỤP ẢNH HIỆN TRƯỜNG',
      'Hệ thống sẽ tự động nén ảnh (< 500KB) trước khi upload qua sóng 4G.',
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Chụp & Upload mẫu',
          onPress: () => {
            addAttachment(task.id, {
              id: `ATT-${Date.now()}`,
              name: `anh-hien-truong-${Date.now()}.jpg`,
              type: 'image',
              uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
              sizeBytes: 342000,
              uploadedAt: new Date().toISOString(),
            });
            Alert.alert('Thành công', 'Đã chụp và nén ảnh (342 KB), upload hoàn tất!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header
        title={task.code}
        subtitle="Chi tiết sự cố hiện trường"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* State Machine 3-step visualization */}
        <StateMachineBar currentStep={task.step} />

        {/* Action Button for State Machine */}
        <View style={styles.actionBox}>
          {task.step === 'RECEIVED' ? (
            <Button
              title="TIẾP CẬN & BẮT ĐẦU XỬ LÝ (BƯỚC 2)"
              onPress={handleAdvanceStep}
              loading={isUpdating}
              size="lg"
              variant="primary"
            />
          ) : task.step === 'IN_PROGRESS' ? (
            <Button
              title="BÁO CÁO & HOÀN THÀNH NHIỆM VỤ (BƯỚC 3)"
              onPress={handleAdvanceStep}
              loading={isUpdating}
              size="lg"
              variant="success"
            />
          ) : (
            <View style={styles.completedBox}>
              <Text style={styles.completedText}>✓ SỰ CỐ ĐÃ HOÀN THÀNH NGHIỆM THU</Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <PriorityBadge priority={task.priority} />
            <TaskStepBadge step={task.step} />
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.description}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Vị trí lý trình:</Text>
            <Text style={styles.valueHighlight}>
              {formatMilestone(task.milestoneKm, task.milestoneM, task.direction)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Thời điểm phát hiện:</Text>
            <Text style={styles.value}>
              {formatTime(task.createdAt)} — {formatVietnameseDate(task.createdAt)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Cán bộ phụ trách:</Text>
            <Text style={styles.value}>{task.assignedTo}</Text>
          </View>
        </Card>

        {/* Attachments Section */}
        <Card style={styles.mediaCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Hình Ảnh & Video Hiện Trường ({task.attachments.length})
            </Text>
            {task.step !== 'COMPLETED' ? (
              <TouchableOpacity
                style={styles.addMediaBtn}
                onPress={handleCapturePhoto}
                activeOpacity={0.7}
              >
                <Text style={styles.addMediaText}>+ Chụp ảnh</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {task.attachments.length === 0 ? (
            <Text style={styles.noMediaText}>
              Chưa có hình ảnh hiện trường. Bấm "Chụp ảnh" để lưu bằng chứng nghiệm thu.
            </Text>
          ) : (
            <View style={styles.mediaGrid}>
              {task.attachments.map((att) => (
                <View key={att.id} style={styles.mediaItem}>
                  <View style={styles.mediaThumbnailPlaceholder}>
                    <Text style={styles.mediaThumbText}>📷</Text>
                  </View>
                  <Text style={styles.mediaName} numberOfLines={1}>
                    {att.name}
                  </Text>
                  <Text style={styles.mediaSize}>
                    {att.sizeBytes ? `${Math.round(att.sizeBytes / 1024)} KB` : 'Ảnh đã nén'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Timeline Notes */}
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Nhật Ký Tác Nghiệp (TMC)</Text>
          {task.notes.length === 0 ? (
            <Text style={styles.noMediaText}>Chưa có ghi chú nhật ký.</Text>
          ) : (
            task.notes.map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteAuthor}>{note.author}</Text>
                  <Text style={styles.noteTime}>{formatTime(note.createdAt)}</Text>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  actionBox: {
    marginBottom: 16,
  },
  completedBox: {
    backgroundColor: COLORS.successLight,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  completedText: {
    color: COLORS.successDark,
    fontSize: 14,
    fontWeight: '800',
  },
  infoCard: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.gray900,
    lineHeight: 24,
    marginBottom: 8,
  },
  taskDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  label: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  mediaCard: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  addMediaBtn: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  addMediaText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noMediaText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontStyle: 'italic',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mediaItem: {
    width: '30%',
    marginRight: '3%',
    marginBottom: 10,
  },
  mediaThumbnailPlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 4,
  },
  mediaThumbText: {
    fontSize: 24,
  },
  mediaName: {
    fontSize: 10,
    color: COLORS.gray700,
  },
  mediaSize: {
    fontSize: 9,
    color: COLORS.gray400,
  },
  notesCard: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: COLORS.gray50,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  noteTime: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  noteContent: {
    fontSize: 13,
    color: COLORS.gray800,
  },
});
