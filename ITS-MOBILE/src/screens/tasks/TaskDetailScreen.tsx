import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTasksStore } from '../../store/useTasksStore';
import { showAppToast, showAppDialog } from '../../store/useToastStore';
import {
  ChevronLeftIcon,
  PhoneHandsetIcon,
  VideoIcon,
  PaperclipIcon,
  CloseIcon,
  CameraIcon,
  PaperPlaneIcon,
  RefreshCwIcon,
} from '../../components/icons/SvgIcons';
import { triggerPBXCall } from '../../utils/dialer';
import {
  MediaFile,
  capturePhoto,
  recordVideo,
  pickMediaFromLibrary,
} from '../../services/mediaService';
import { uploadMediaWithRetry } from '../../services/uploadService';

export const TaskDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const navigation = useNavigation();
  const { task: initialTask } = route.params;

  const { tasks, updateTaskStep, addAttachment } = useTasksStore();
  const currentTask = tasks.find((t) => t.id === initialTask.id);
  const task = currentTask !== undefined ? currentTask : initialTask;

  const [previewMediaUri, setPreviewMediaUri] = useState<string | null>(null);
  const [fieldNote, setFieldNote] = useState('');
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReceived = task.step === 'RECEIVED';
  const isInProgress = task.step === 'IN_PROGRESS';
  const isCompleted = task.step === 'COMPLETED';

  const startUploadMedia = async (file: MediaFile) => {
    try {
      const uploadedUrl = await uploadMediaWithRetry(
        file,
        { incidentId: task.id },
        {
          onProgress: (prog) => {
            setMediaList((prev) =>
              prev.map((m) => (m.id === file.id ? { ...m, progress: prog } : m))
            );
          },
          onStatusChange: (status, err) => {
            setMediaList((prev) =>
              prev.map((m) =>
                m.id === file.id ? { ...m, status, errorMessage: err } : m
              )
            );
          },
        }
      );

      setMediaList((prev) =>
        prev.map((m) =>
          m.id === file.id
            ? { ...m, status: 'success', progress: 100, uploadedUrl }
            : m
        )
      );
      showAppToast('success', 'Tải lên hoàn tất', `Tệp ${file.name} đã được tải lên máy chủ.`);
    } catch (err: any) {
      setMediaList((prev) =>
        prev.map((m) =>
          m.id === file.id
            ? { ...m, status: 'error', errorMessage: err?.message || 'Lỗi tải lên' }
            : m
        )
      );
      showAppToast('error', 'Lỗi tải lên', `Không thể tải lên ${file.name}. Vui lòng thử lại.`);
    }
  };

  const handleCapturePhoto = async () => {
    try {
      const file = await capturePhoto();
      if (file) {
        setMediaList((prev) => [...prev, file]);
        startUploadMedia(file);
      }
    } catch {
      showAppToast('error', 'Lỗi Camera', 'Không thể khởi động camera lúc này.');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const file = await recordVideo();
      if (file) {
        setMediaList((prev) => [...prev, file]);
        startUploadMedia(file);
      }
    } catch {
      showAppToast('error', 'Lỗi Quay video', 'Không thể quay video lúc này.');
    }
  };

  const handlePickAttachment = async () => {
    try {
      const file = await pickMediaFromLibrary();
      if (file) {
        setMediaList((prev) => [...prev, file]);
        startUploadMedia(file);
      }
    } catch {
      showAppToast('error', 'Lỗi Chọn tệp', 'Không thể mở thư viện lúc này.');
    }
  };

  const handleRetryUpload = (fileId: string) => {
    const file = mediaList.find((m) => m.id === fileId);
    if (file) {
      setMediaList((prev) =>
        prev.map((m) => (m.id === fileId ? { ...m, status: 'uploading', progress: 0, errorMessage: undefined } : m))
      );
      startUploadMedia(file);
    }
  };

  const handleRemoveMedia = (fileId: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== fileId));
  };

  const handleSubmitReport = async () => {
    const hasUploading = mediaList.some((m) => m.status === 'compressing' || m.status === 'uploading');
    if (hasUploading) {
      showAppToast('warning', 'Đang xử lý', 'Tệp đính kèm đang được tải lên, vui lòng đợi trong giây lát.');
      return;
    }

    if (!fieldNote.trim() && mediaList.length === 0) {
      showAppToast('warning', 'Chưa có thông tin', 'Vui lòng nhập ghi nhận hiện trường hoặc đính kèm ảnh/video.');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const m of mediaList) {
        if (m.status === 'success' && m.uploadedUrl) {
          addAttachment(task.id, {
            id: m.id,
            name: m.name,
            uri: m.uploadedUrl,
            type: m.type === 'video' ? 'video' : 'image',
            sizeBytes: m.size || 0,
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      showAppToast('success', 'Gửi báo cáo thành công', 'Báo cáo hiện trường và tệp tư liệu đã được gửi về TMC!');
      setFieldNote('');
      setMediaList([]);
    } catch {
      showAppToast('error', 'Thất bại', 'Không thể gửi báo cáo hiện trường lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepPress = (targetStep: 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (targetStep === task.step) return;

    const stepLabel = targetStep === 'RECEIVED' ? 'Đã tiếp nhận (1)' : targetStep === 'IN_PROGRESS' ? 'Đang xử lý (2)' : 'Hoàn thành (3)';

    showAppDialog(
      'CẬP NHẬT TIẾN TRÌNH',
      `Xác nhận chuyển trạng thái sang "${stepLabel}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const success = await updateTaskStep(task.id, targetStep);
            if (success) {
              showAppToast('success', 'Thành công', `Đã cập nhật tiến trình sang "${stepLabel}"!`);
            } else {
              showAppToast('error', 'Thất bại', 'Không thể cập nhật trạng thái lúc này.');
            }
          },
        },
      ],
      'info'
    );
  };

  const currentStepNum = isCompleted ? 3 : isInProgress ? 2 : 1;
  const statusLabel = isCompleted ? 'Hoàn thành' : isInProgress ? 'Đang xử lý' : 'Đã tiếp nhận';
  const statusBadgeBg = isCompleted ? '#dcfce7' : isInProgress ? '#fef3c7' : '#e0f2fe';
  const statusBadgeColor = isCompleted ? '#16a34a' : isInProgress ? '#d97706' : '#0284c7';

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'P0':
        return { label: 'Khẩn cấp', color: '#dc2626' };
      case 'P1':
        return { label: 'Nghiêm trọng', color: '#ef4444' };
      case 'P2':
        return { label: 'Cảnh báo', color: '#f59e0b' };
      case 'P3':
      default:
        return { label: 'Thông tin', color: '#0284c7' };
    }
  };
  const priorityInfo = getPriorityInfo(task.priority);
  const locationText = `Km ${task.milestoneKm}+${String(task.milestoneM).padStart(3, '0')}`;
  const directionText = task.direction === 'LAOCAI_HANOI' ? 'Lào Cai ➔ Hà Nội' : 'Hà Nội ➔ Lào Cai';

  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight, 28);

  return (
    <View style={styles.safeArea}>
      {/* Top Header chuẩn thiết kế */}
      <View style={[styles.headerBar, { paddingTop: topInset, height: 56 + topInset }]}>
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
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* Khối Card Thông tin sự cố */}
        <View style={styles.incidentCard}>
          <View style={styles.badgeAndCodeRow}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color }]}>
              <Text style={styles.priorityBadgeText}>{priorityInfo.label}</Text>
            </View>
            <Text style={styles.codeText}>Mã: {task.incidentCode || 'N/A'}</Text>
          </View>

          <Text style={styles.incidentTitle}>{task.title || 'Nhiệm vụ sự cố'}</Text>

          <View style={styles.cardDivider} />

          {/* 2 Cột Vị trí & Hướng */}
          <View style={styles.twoColsRow}>
            <View style={styles.colItem}>
              <Text style={styles.colLabel}>VỊ TRÍ</Text>
              <Text style={styles.colValue}>{locationText}</Text>
            </View>
            <View style={styles.colItem}>
              <Text style={styles.colLabel}>HƯỚNG</Text>
              <Text style={styles.colValue}>{directionText}</Text>
            </View>
          </View>

          {/* Mô tả ban đầu */}
          <Text style={styles.sectionLabel}>MÔ TẢ BAN ĐẦU</Text>
          <View style={styles.descBubble}>
            <Text style={styles.descText}>
              {task.description || 'Chưa có mô tả chi tiết từ trung tâm điều hành.'}
            </Text>
          </View>

          {/* Phương án xử lý (Script) */}
          <Text style={styles.sectionLabel}>PHƯƠNG ÁN XỬ LÝ (SCRIPT)</Text>
          <View style={styles.scriptBubble}>
            <Text style={styles.scriptText}>
              {task.script || 'Chưa có phương án kịch bản xử lý.'}
            </Text>
          </View>
        </View>

        {/* Tiến trình trạng thái (Chỉ xem - View-Only Stepper) */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Tiến trình xử lý</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBadgeBg }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadgeColor }]}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.stepperContainer}>
            {/* Bước 1 */}
            <TouchableOpacity
              style={styles.stepCol}
              activeOpacity={0.7}
              onPress={() => handleStepPress('RECEIVED')}
            >
              <View style={[styles.stepCircle, currentStepNum >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumText, currentStepNum >= 1 && styles.stepNumTextActive]}>1</Text>
              </View>
              <Text style={[styles.stepTitle, currentStepNum >= 1 && styles.stepTitleActive]}>Đã nhận</Text>
            </TouchableOpacity>

            <View style={[styles.stepTrack, currentStepNum >= 2 && styles.stepTrackActive]} />

            {/* Bước 2 */}
            <TouchableOpacity
              style={styles.stepCol}
              activeOpacity={0.7}
              onPress={() => handleStepPress('IN_PROGRESS')}
            >
              <View style={[styles.stepCircle, currentStepNum >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumText, currentStepNum >= 2 && styles.stepNumTextActive]}>2</Text>
              </View>
              <Text style={[styles.stepTitle, currentStepNum >= 2 && styles.stepTitleActive]}>Đang xử lý</Text>
            </TouchableOpacity>

            <View style={[styles.stepTrack, currentStepNum >= 3 && styles.stepTrackActive]} />

            {/* Bước 3 */}
            <TouchableOpacity
              style={styles.stepCol}
              activeOpacity={0.7}
              onPress={() => handleStepPress('COMPLETED')}
            >
              <View style={[styles.stepCircle, currentStepNum >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumText, currentStepNum >= 3 && styles.stepNumTextActive]}>3</Text>
              </View>
              <Text style={[styles.stepTitle, currentStepNum >= 3 && styles.stepTitleActive]}>Hoàn thành</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lịch sử cập nhật trạng thái */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Lịch sử cập nhật trạng thái</Text>

          <View style={styles.timelineContainer}>
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

            <View style={styles.verticalLine} />

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

        {/* Cập nhật trạng thái (1 -> 2 -> 3) chuẩn UI như ảnh */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Cập nhật trạng thái (1 → 2 → 3)</Text>
          <Text style={styles.currentStatusText}>
            Hiện tại: <Text style={styles.currentStatusHighlight}>{statusLabel}</Text>
          </Text>

          <View style={styles.stateButtonGroup}>
            <TouchableOpacity
              style={[styles.statePillBtn, isReceived && styles.statePillBtnActive]}
              activeOpacity={0.7}
              onPress={() => handleStepPress('RECEIVED')}
            >
              <Text style={[styles.statePillText, isReceived && styles.statePillTextActive]}>
                Đã nhận (1)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statePillBtn, isInProgress && styles.statePillBtnActive]}
              activeOpacity={0.7}
              onPress={() => handleStepPress('IN_PROGRESS')}
            >
              <Text style={[styles.statePillText, isInProgress && styles.statePillTextActive]}>
                Đang xử lý (2)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statePillBtn, isCompleted && styles.statePillBtnActive]}
              activeOpacity={0.7}
              onPress={() => handleStepPress('COMPLETED')}
            >
              <Text style={[styles.statePillText, isCompleted && styles.statePillTextActive]}>
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
            style={styles.fieldNoteInput}
            placeholder="Ví dụ: Đã phân luồng, 2 làn lưu thông; đang chờ cứu hộ..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={fieldNote}
            onChangeText={setFieldNote}
          />
        </View>

        {/* Ảnh & video gửi TMC */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Ảnh & video gửi TMC</Text>
          <Text style={styles.sectionSubDesc}>
            Chụp mới hoặc đính kèm từ thư viện thiết bị.
          </Text>

          {/* 3 nút tác vụ: Chụp ảnh, Quay video, Đính kèm */}
          <View style={styles.mediaActionsRow}>
            <TouchableOpacity
              style={styles.mediaActionCard}
              activeOpacity={0.75}
              onPress={handleCapturePhoto}
            >
              <View style={styles.mediaActionIconWrap}>
                <CameraIcon size={26} color="#475569" />
              </View>
              <Text style={styles.mediaActionText}>Chụp ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaActionCard}
              activeOpacity={0.75}
              onPress={handleRecordVideo}
            >
              <View style={styles.mediaActionIconWrap}>
                <VideoIcon size={26} color="#475569" />
              </View>
              <Text style={styles.mediaActionText}>Quay / video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaActionCard, styles.mediaActionCardHighlight]}
              activeOpacity={0.75}
              onPress={handlePickAttachment}
            >
              <View style={styles.mediaActionIconWrap}>
                <PaperclipIcon size={26} color="#92400e" />
              </View>
              <Text style={[styles.mediaActionText, styles.mediaActionTextHighlight]}>Đính kèm</Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách tệp đính kèm mới với progress bar và retry */}
          {mediaList.length > 0 && (
            <View style={styles.selectedMediaList}>
              {mediaList.map((item) => (
                <View key={item.id} style={styles.selectedMediaItem}>
                  <View style={styles.selectedMediaHeader}>
                    <Text style={styles.selectedMediaName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.selectedMediaItemActions}>
                      {item.status === 'error' && (
                        <TouchableOpacity
                          style={styles.retryBtn}
                          activeOpacity={0.7}
                          onPress={() => handleRetryUpload(item.id)}
                        >
                          <RefreshCwIcon size={13} color="#0284c7" />
                          <Text style={styles.retryBtnText}>Thử lại</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.removeMediaBtn}
                        activeOpacity={0.7}
                        onPress={() => handleRemoveMedia(item.id)}
                      >
                        <CloseIcon size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Thanh tiến trình upload */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${item.progress}%` },
                        item.status === 'error' && styles.progressBarError,
                        item.status === 'success' && styles.progressBarSuccess,
                      ]}
                    />
                  </View>

                  <View style={styles.selectedMediaStatusRow}>
                    <Text
                      style={[
                        styles.selectedMediaStatusText,
                        item.status === 'error' && styles.selectedMediaStatusError,
                        item.status === 'success' && styles.selectedMediaStatusSuccess,
                      ]}
                    >
                      {item.status === 'compressing'
                        ? 'Đang nén...'
                        : item.status === 'uploading'
                        ? `Đang tải lên: ${item.progress}%`
                        : item.status === 'success'
                        ? '✓ Đã tải lên hoàn tất'
                        : `✕ Lỗi: ${item.errorMessage || 'Tải lên thất bại'}`}
                    </Text>
                    {item.size ? (
                      <Text style={styles.selectedMediaSizeText}>
                        {Math.round(item.size / 1024)} KB
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tệp đính kèm & Tư liệu (Chỉ xem) */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Tệp đính kèm & Tư liệu</Text>
          <Text style={styles.sectionSubDesc}>
            Hình ảnh, video hoặc tài liệu được ghi nhận từ hiện trường (chỉ xem).
          </Text>

          {task.attachments && task.attachments.length > 0 ? (
            <View style={styles.attachedListWrap}>
              {task.attachments.map((item) => (
                <View key={item.id} style={styles.attachedItemRow}>
                  {item.type === 'image' ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setPreviewMediaUri(item.uri)}
                    >
                      <Image source={{ uri: item.uri }} style={styles.attachedThumbnail} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.attachedIconPlaceholder}>
                      {item.type === 'video' ? (
                        <VideoIcon size={22} color="#0090e7" />
                      ) : (
                        <PaperclipIcon size={22} color="#d97706" />
                      )}
                    </View>
                  )}

                  <View style={styles.attachedInfoCol}>
                    <Text style={styles.attachedFileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.attachedFileSize}>
                      {item.type === 'video' ? '🎬 Video' : item.type === 'image' ? '📸 Ảnh' : '📄 Tệp'} •{' '}
                      {item.sizeBytes ? Math.round(item.sizeBytes / 1024) : 0} KB
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyAttachmentsBox}>
              <Text style={styles.emptyAttachmentsText}>
                Không có tệp đính kèm nào được ghi nhận cho sự cố này.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Call Button */}
      <TouchableOpacity
        style={[styles.floatingSosBtn, { bottom: 84 + insets.bottom }]}
        activeOpacity={0.85}
        onPress={() => triggerPBXCall('113', 'Tổng đài Cứu hộ')}
      >
        <PhoneHandsetIcon size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Thanh nút gửi báo cáo cố định phía dưới */}
      <View style={[styles.bottomBarWrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.submitReportBtn, isSubmitting && styles.submitReportBtnDisabled]}
          activeOpacity={0.8}
          disabled={isSubmitting}
          onPress={handleSubmitReport}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <PaperPlaneIcon size={18} color="#ffffff" />
              <Text style={styles.submitReportBtnText}>Gửi báo cáo về TMC</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal xem ảnh phóng to */}
      <Modal
        visible={previewMediaUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewMediaUri(null)}
      >
        <View style={styles.previewModalOverlay}>
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setPreviewMediaUri(null)}
          >
            <CloseIcon size={24} color="#ffffff" />
          </TouchableOpacity>
          {previewMediaUri && (
            <Image
              source={{ uri: previewMediaUri }}
              style={styles.previewFullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
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
    paddingBottom: 60,
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
  codeColumn: {
    alignItems: 'flex-end',
  },
  codeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  subCodeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionSubDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepCol: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#0090e7',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
  },
  stepNumTextActive: {
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stepTitleActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  stepTrack: {
    height: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
    marginBottom: 18,
  },
  stepTrackActive: {
    backgroundColor: '#0090e7',
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
  attachedListWrap: {
    marginTop: 8,
    gap: 10,
  },
  attachedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  attachedThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  attachedIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  attachedFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  attachedFileSize: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  emptyAttachmentsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginTop: 8,
  },
  emptyAttachmentsText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  previewFullImage: {
    width: '94%',
    height: '80%',
  },
  currentStatusText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 14,
  },
  currentStatusHighlight: {
    fontWeight: '700',
    color: '#0f172a',
  },
  stateButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statePillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statePillBtnActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  statePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  statePillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  fieldNoteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    fontSize: 13,
    color: '#0f172a',
    minHeight: 96,
    textAlignVertical: 'top',
  },
  mediaActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  mediaActionCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  mediaActionCardHighlight: {
    borderColor: '#fde047',
    backgroundColor: '#fefce8',
  },
  mediaActionIconWrap: {
    marginBottom: 6,
  },
  mediaActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  mediaActionTextHighlight: {
    color: '#92400e',
  },
  selectedMediaList: {
    marginTop: 12,
    gap: 8,
  },
  selectedMediaItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedMediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  selectedMediaName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
  },
  selectedMediaItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  removeMediaBtn: {
    padding: 2,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0090e7',
    borderRadius: 3,
  },
  progressBarError: {
    backgroundColor: '#ef4444',
  },
  progressBarSuccess: {
    backgroundColor: '#16a34a',
  },
  selectedMediaStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedMediaStatusText: {
    fontSize: 11,
    color: '#64748b',
  },
  selectedMediaStatusError: {
    color: '#ef4444',
    fontWeight: '600',
  },
  selectedMediaStatusSuccess: {
    color: '#16a34a',
    fontWeight: '600',
  },
  selectedMediaSizeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  floatingSosBtn: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 9,
  },
  bottomBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  submitReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0090e7',
    borderRadius: 26,
    height: 50,
  },
  submitReportBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitReportBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
