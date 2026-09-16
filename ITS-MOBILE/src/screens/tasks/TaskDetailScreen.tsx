import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTasksStore } from '../../store/useTasksStore';
import {
  ChevronLeftIcon,
  PhoneHandsetIcon,
  CameraIcon,
  VideoIcon,
  PaperclipIcon,
  PaperPlaneIcon,
} from '../../components/icons/SvgIcons';
import { triggerPBXCall } from '../../utils/dialer';

export const TaskDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const navigation = useNavigation();
  const { task: initialTask } = route.params;

  const { tasks, advanceTaskStep, addAttachment } = useTasksStore();
  const currentTask = tasks.find((t) => t.id === initialTask.id);
  const task = currentTask !== undefined ? currentTask : initialTask;

  const [fieldNotes, setFieldNotes] = useState('');

  const handleStepPress = async (targetStep: 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (targetStep === task.step) return;

    Alert.alert(
      'CẬP NHẬT TRẠNG THÁI',
      `Xác nhận chuyển trạng thái sang bước "${targetStep}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            await advanceTaskStep(task.id);
            Alert.alert('Thành công', 'Đã cập nhật trạng thái nhiệm vụ!');
          },
        },
      ]
    );
  };

  const handleCapturePhoto = () => {
    Alert.alert('Chụp ảnh', 'Đã mở máy ảnh và đính kèm ảnh hiện trường (<500KB).');
    addAttachment(task.id, {
      id: `ATT-${Date.now()}`,
      name: `anh-hien-truong-${Date.now()}.jpg`,
      type: 'image',
      uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
      sizeBytes: 320000,
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleSendReport = () => {
    Alert.alert(
      'GỬI BÁO CÁO VỀ TMC',
      'Đã đồng bộ toàn bộ ghi nhận hiện trường và tệp đính kèm về Trung tâm điều hành ITS.',
      [{ text: 'Đóng' }]
    );
  };

  const isReceived = task.step === 'RECEIVED';
  const isInProgress = task.step === 'IN_PROGRESS';
  const isCompleted = task.step === 'COMPLETED';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Top Header thanh mảnh chuẩn thiết kế */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chi tiết sự cố</Text>

        <TouchableOpacity
          style={styles.phoneBtn}
          activeOpacity={0.7}
          onPress={() => triggerPBXCall('9901', 'Trung tâm điều hành TMC')}
        >
          <PhoneHandsetIcon size={22} color="#0090e7" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Khối Card Thông tin sự cố */}
        <View style={styles.incidentCard}>
          <View style={styles.badgeAndCodeRow}>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityBadgeText}>Nghiêm trọng</Text>
            </View>
            <Text style={styles.codeText}>Mã: NB-2024-001</Text>
          </View>

          <Text style={styles.incidentTitle}>Tai nạn giao thông</Text>

          <View style={styles.cardDivider} />

          {/* 2 Cột Vị trí & Hướng */}
          <View style={styles.twoColsRow}>
            <View style={styles.colItem}>
              <Text style={styles.colLabel}>VỊ TRÍ</Text>
              <Text style={styles.colValue}>Km 24+500</Text>
            </View>
            <View style={styles.colItem}>
              <Text style={styles.colLabel}>HƯỚNG</Text>
              <Text style={styles.colValue}>Hướng Lào Cai</Text>
            </View>
          </View>

          {/* Mô tả ban đầu */}
          <Text style={styles.sectionLabel}>MÔ TẢ BAN ĐẦU</Text>
          <View style={styles.descBubble}>
            <Text style={styles.descText}>
              Va chạm giữa 2 xe con, gây ùn tắc nhẹ lane ngoài.
            </Text>
          </View>

          {/* Phương án xử lý (Script) */}
          <Text style={styles.sectionLabel}>PHƯƠNG ÁN XỬ LÝ (SCRIPT)</Text>
          <View style={styles.scriptBubble}>
            <Text style={styles.scriptText}>
              Phân luồng từ xa, xe cứu hộ IC3 xuất phát.
            </Text>
          </View>
        </View>

        {/* Lịch sử cập nhật trạng thái */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Lịch sử cập nhật trạng thái</Text>

          <View style={styles.timelineContainer}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.dotWithRing}>
                <View style={styles.innerDot} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>14:20 20/04</Text>
                <Text style={styles.timelineTitle}>Phân công nhiệm vụ từ ITS/TMC</Text>
                <Text style={styles.timelineActor}>Hệ thống</Text>
              </View>
            </View>

            {/* Vertical connector line */}
            <View style={styles.verticalLine} />

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.solidDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>13:55 20/04</Text>
                <Text style={styles.timelineTitle}>Đã tiếp nhận (1)</Text>
                <Text style={styles.timelineActor}>Nguyễn Minh Hoàng</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cập nhật trạng thái (1 -> 2 -> 3) */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Cập nhật trạng thái (1 → 2 → 3)</Text>
          <Text style={styles.currentStatusSubtitle}>
            Hiện tại: {isReceived ? 'Đã tiếp nhận' : isInProgress ? 'Đang xử lý' : 'Hoàn thành'}
          </Text>

          <View style={styles.statusButtonsRow}>
            <TouchableOpacity
              style={[styles.statusBtn, isReceived && styles.statusBtnActive]}
              activeOpacity={0.8}
              onPress={() => handleStepPress('RECEIVED')}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  isReceived && styles.statusBtnTextActive,
                ]}
              >
                Đã nhận (1)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, isInProgress && styles.statusBtnActive]}
              activeOpacity={0.8}
              onPress={() => handleStepPress('IN_PROGRESS')}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  isInProgress && styles.statusBtnTextActive,
                ]}
              >
                Đang xử lý (2)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, isCompleted && styles.statusBtnActive]}
              activeOpacity={0.8}
              onPress={() => handleStepPress('COMPLETED')}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  isCompleted && styles.statusBtnTextActive,
                ]}
              >
                Hoàn thành (3)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ghi nhận hiện trường */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Ghi nhận hiện trường</Text>
          <Text style={styles.sectionSubDesc}>
            Nhập diễn biến, quan sát tại hiện trường để gửi kèm báo cáo về TMC.
          </Text>

          <TextInput
            style={styles.notesInput}
            placeholder="Ví dụ: Đã phân luồng, 2 làn lưu thông; đang chờ cứu hộ..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={fieldNotes}
            onChangeText={setFieldNotes}
          />
        </View>

        {/* Ảnh & video gửi TMC */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Ảnh & video gửi TMC</Text>
          <Text style={styles.sectionSubDesc}>
            Chụp mới hoặc đính kèm từ thư viện thiết bị.
          </Text>

          <View style={styles.attachmentsRow}>
            {/* Chụp ảnh */}
            <TouchableOpacity
              style={styles.dashedBox}
              activeOpacity={0.7}
              onPress={handleCapturePhoto}
            >
              <CameraIcon size={26} color="#475569" />
              <Text style={styles.dashedLabel}>Chụp ảnh</Text>
            </TouchableOpacity>

            {/* Quay video */}
            <TouchableOpacity
              style={styles.dashedBox}
              activeOpacity={0.7}
              onPress={handleCapturePhoto}
            >
              <VideoIcon size={26} color="#475569" />
              <Text style={styles.dashedLabel}>Quay / video</Text>
            </TouchableOpacity>

            {/* Đính kèm */}
            <TouchableOpacity
              style={[styles.dashedBox, styles.dashedBoxAmber]}
              activeOpacity={0.7}
              onPress={handleCapturePhoto}
            >
              <PaperclipIcon size={26} color="#d97706" />
              <Text style={styles.dashedLabelAmber}>Đính kèm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nút gửi báo cáo về TMC */}
        <TouchableOpacity
          style={styles.sendReportBtn}
          activeOpacity={0.85}
          onPress={handleSendReport}
        >
          <View style={styles.planeIconWrap}>
            <PaperPlaneIcon size={18} color="#ffffff" />
          </View>
          <Text style={styles.sendReportText}>Gửi báo cáo về TMC</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBar: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  phoneBtn: {
    padding: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  incidentCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  badgeAndCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  codeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  incidentTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  twoColsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colItem: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  colValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  descBubble: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
  },
  descText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  scriptBubble: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    padding: 14,
  },
  scriptText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284c7',
    lineHeight: 20,
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  timelineContainer: {
    marginTop: 16,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotWithRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    marginRight: 12,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0090e7',
  },
  solidDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0090e7',
    marginTop: 5,
    marginLeft: 3,
    marginRight: 15,
  },
  verticalLine: {
    width: 2,
    height: 28,
    backgroundColor: '#e2e8f0',
    marginLeft: 6,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  timelineActor: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  currentStatusSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 14,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  statusBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  sectionSubDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    color: '#0f172a',
    textAlignVertical: 'top',
  },
  attachmentsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dashedBox: {
    flex: 1,
    height: 104,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedBoxAmber: {
    borderColor: '#f59e0b',
    backgroundColor: '#fefce8',
  },
  dashedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  dashedLabelAmber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
    marginTop: 8,
  },
  sendReportBtn: {
    marginHorizontal: 16,
    marginTop: 28,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#0090e7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0090e7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  planeIconWrap: {
    transform: [{ rotate: '-45deg' }],
    marginRight: 6,
  },
  sendReportText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
