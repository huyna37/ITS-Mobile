import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CameraIcon,
  ChevronLeftIcon,
  CloseIcon,
  EyeIcon,
  FileExcelIcon,
  FileGenericDocIcon,
  FileImageIcon,
  FilePdfIcon,
  FileWordIcon,
  FileZipIcon,
  PaperclipIcon,
  PaperPlaneIcon,
  PhoneHandsetIcon,
  RefreshCwIcon,
  VideoIcon,
} from '../../components/icons/SvgIcons';
import { FONT_FAMILY } from '../../constants';
import { RootStackParamList } from '../../navigation/types';
import { useTasksStore } from '../../store/useTasksStore';
import { showAppDialog, showAppToast } from '../../store/useToastStore';
import { triggerPBXCall } from '../../utils/dialer';
import {
  MediaFile,
  capturePhoto,
  recordVideo,
  pickMediaFromLibrary,
} from '../../services/mediaService';
import { uploadMediaWithRetry } from '../../services/uploadService';
import { formatFullDateTime } from '../../utils/formatting';
import { submitTaskReportApi } from '../../api/tasksApi';

interface ParsedLogItem {
  id: string;
  author: string;
  content: string;
  time: string;
  oldStatus?: string;
  newStatus?: string;
  isStatusChange: boolean;
  isFieldNote: boolean;
}

function cleanHtmlText(text?: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
}

function cleanStatusLabel(status?: string): string {
  if (!status) return '';
  return status
    .replace(/\s*\(\d+\)/g, '')
    .replace(/\s*\[\d+\]/g, '')
    .replace(/(\b(?:Đã tiếp nhận|Đã nhận|Đang xử lý|Hoàn thành|Chờ tiếp nhận|Chờ xử lý|Khởi tạo))\s+\d+/gi, '$1')
    .trim();
}

function getAttachmentFileType(
  name?: string,
  type?: string
): 'image' | 'video' | 'pdf' | 'excel' | 'word' | 'zip' | 'document' {
  const ext = (name || '').split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'jfif', 'bmp', 'svg', 'heic', 'heif', 'ico'].includes(ext)) {
    return 'image';
  }
  if (['mp4', 'mov', 'avi', 'mkv', '3gp', 'webm'].includes(ext)) {
    return 'video';
  }
  if (['pdf'].includes(ext)) {
    return 'pdf';
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'excel';
  }
  if (['doc', 'docx'].includes(ext)) {
    return 'word';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'zip';
  }
  if (type === 'image') return 'image';
  if (type === 'video') return 'video';
  return 'document';
}

function AttachmentThumbPreview({ uri, name, type }: { uri: string; name?: string; type?: string }) {
  const [hasError, setHasError] = useState(false);
  const fileType = getAttachmentFileType(name, type);
  const ext = (name || '').split('.').pop()?.toUpperCase() || 'TỆP';

  // 1. Ảnh hiển thị được trực tiếp
  if (fileType === 'image' && !hasError) {
    return (
      <View style={styles.attachedThumbWrap}>
        <Image
          source={{ uri }}
          style={styles.attachedThumbnail}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
        <View style={styles.thumbEyeOverlay}>
          <EyeIcon size={12} color="#ffffff" />
        </View>
      </View>
    );
  }

  // 2. Ảnh fallback (chưa tải xong hoặc không load được từ máy chủ)
  if (fileType === 'image') {
    return (
      <View style={[styles.attachedIconPlaceholder, styles.attachedThumbBoxImage]}>
        <FileImageIcon size={24} color="#0284c7" />
        <Text style={styles.thumbTypeTagImage}>ẢNH</Text>
      </View>
    );
  }

  // 3. Video
  if (fileType === 'video') {
    return (
      <View style={[styles.attachedIconPlaceholder, styles.attachedThumbBoxVideo]}>
        <VideoIcon size={24} color="#0284c7" />
        <Text style={styles.thumbTypeTagVideo}>MP4</Text>
      </View>
    );
  }

  // 4. Tài liệu PDF
  if (fileType === 'pdf') {
    return (
      <View style={[styles.attachedIconPlaceholder, styles.attachedThumbBoxPdf]}>
        <FilePdfIcon size={24} color="#dc2626" />
        <Text style={styles.thumbTypeTagPdf}>PDF</Text>
      </View>
    );
  }

  // 5. Bảng tính Excel / CSV
  if (fileType === 'excel') {
    return (
      <View style={[styles.attachedIconPlaceholder, styles.attachedThumbBoxExcel]}>
        <FileExcelIcon size={24} color="#16a34a" />
        <Text style={styles.thumbTypeTagExcel}>XLS</Text>
      </View>
    );
  }

  // 6. Văn bản Word
  if (fileType === 'word') {
    return (
      <View style={[styles.attachedIconPlaceholder, styles.attachedThumbBoxWord]}>
        <FileWordIcon size={24} color="#2563eb" />
        <Text style={styles.thumbTypeTagWord}>DOC</Text>
      </View>
    );
  }

  // 7. Tệp nén Zip / RAR
  if (fileType === 'zip') {
    return (
      <View style={[styles.attachedIconPlaceholder, styles.attachedThumbBoxZip]}>
        <FileZipIcon size={24} color="#9333ea" />
        <Text style={styles.thumbTypeTagZip}>ZIP</Text>
      </View>
    );
  }

  // 8. Tệp tin chung
  return (
    <View style={styles.attachedIconPlaceholder}>
      <FileGenericDocIcon size={24} color="#d97706" />
      <Text style={styles.thumbTypeTagFile}>{ext.slice(0, 4)}</Text>
    </View>
  );
}



function parseTaskNote(note: {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  oldStatus?: string;
  newStatus?: string;
  logType?: string;
}): ParsedLogItem {
  let author = note.author || 'Hệ thống';
  if (author.trim().startsWith('{')) {
    try {
      const p = JSON.parse(author);
      author = p.UserName || p.Actor || 'Điều hành TMC';
    } catch {
      author = 'Điều hành TMC';
    }
  }

  let oldStatus = note.oldStatus;
  let newStatus = note.newStatus;
  let content = cleanHtmlText(note.content);

  // Parse nếu nội dung là chuỗi JSON từ TMC
  if (content.startsWith('{')) {
    try {
      const p = JSON.parse(content);
      if (p.Key === 'Description_ChangeStatusProfile' && Array.isArray(p.Param)) {
        oldStatus = cleanHtmlText(p.Param[0]) || 'Chờ xử lý';
        newStatus = cleanHtmlText(p.Param[1]) || 'Đang xử lý';
        content = `${oldStatus} ➔ ${newStatus}`;
      } else if (p.Key === 'Description_AddTasks') {
        newStatus = 'Đã giao nhiệm vụ';
        content = `Giao nhiệm vụ: ${cleanHtmlText(p.Param?.[0] || '')}`;
      } else if (p.Key === 'Description_AddEventInProfile') {
        content = `Ghi nhận sự cố: ${cleanHtmlText(p.Param?.[1] || p.Param?.[0] || '')}`;
      }
    } catch {}
  }

  if (content === 'Description_SetUpProcessingScripts') {
    content = 'Thiết lập phương án xử lý sự cố';
  } else if (content === 'Description_UpdateMissionInformation') {
    content = 'Cập nhật thông tin nhiệm vụ';
  }

  // Parse "OldStatus ➔ NewStatus"
  if (content.includes('➔')) {
    const parts = content.split('➔').map((s) => cleanStatusLabel(s.trim()));
    if (parts.length === 2) {
      oldStatus = parts[0];
      newStatus = parts[1];
      content = `${oldStatus} ➔ ${newStatus}`;
    }
  }

  if (oldStatus) oldStatus = cleanStatusLabel(oldStatus);
  if (newStatus) newStatus = cleanStatusLabel(newStatus);

  let time = 'Vừa xong';
  if (note.createdAt) {
    time = formatFullDateTime(note.createdAt);
  }

  const isStatusChange = note.logType === 'STATUS_CHANGE' || !!(oldStatus && newStatus);
  const isFieldNote = !isStatusChange && !content.startsWith('{');

  return {
    id: note.id,
    author,
    content,
    time,
    oldStatus,
    newStatus,
    isStatusChange,
    isFieldNote,
  };
}

export const TaskDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const navigation = useNavigation();
  const { task: initialTask } = route.params;

  const { tasks, updateTaskStep, addAttachment, fetchTasks } = useTasksStore();
  const currentTask = tasks.find((t) => t.id === initialTask.id);
  const task = currentTask !== undefined ? currentTask : initialTask;

  const allParsedNotes = (task.notes || []).map(parseTaskNote);
  const statusHistory = allParsedNotes.filter((n) => n.isStatusChange);
  const fieldNotes = allParsedNotes.filter((n) => n.isFieldNote);

  const [previewMediaItem, setPreviewMediaItem] = useState<{
    uri: string;
    name?: string;
    type?: 'image' | 'video' | 'file' | 'document';
  } | null>(null);

  const handleOpenPreview = (item: {
    uri: string;
    name?: string;
    type?: 'image' | 'video' | 'file' | 'document';
  }) => {
    if (!item.uri) return;
    setPreviewMediaItem(item);
  };

  const [fieldNote, setFieldNote] = useState('');
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReceived = task.step === 'RECEIVED';
  const isInProgress = task.step === 'IN_PROGRESS';
  const isCompleted = task.step === 'COMPLETED';

  const startUploadMedia = async (file: MediaFile) => {
    try {
      const { url: uploadedUrl, id: uploadedId } = await uploadMediaWithRetry(
        file,
        { incidentId: task.incidentCode || task.id, taskId: task.id },
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
            ? { ...m, status: 'success', progress: 100, uploadedUrl, uploadedId }
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
    const hasUploading = mediaList.some(
      (m) => m.status === 'compressing' || m.status === 'uploading'
    );
    if (hasUploading) {
      showAppToast(
        'warning',
        'Đang xử lý',
        'Tệp đính kèm đang được tải lên, vui lòng đợi trong giây lát.'
      );
      return;
    }

    if (!fieldNote.trim() && mediaList.length === 0) {
      showAppToast('warning', 'Chưa có thông tin', 'Vui lòng nhập ghi nhận hiện trường hoặc đính kèm ảnh/video.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedFileIds = mediaList
        .filter((m) => m.status === 'success' && m.uploadedId)
        .map((m) => m.uploadedId!);

      // Gửi báo cáo hiện trường và liên kết tệp lên máy chủ TMC
      const success = await submitTaskReportApi(task.id, {
        note: fieldNote.trim() || undefined,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
        actor: 'Tuần kiểm tra VEC',
      });

      if (success) {
        // Cập nhật lại dữ liệu từ máy chủ để lưu trữ vĩnh viễn
        await fetchTasks();
        showAppToast('success', 'Gửi báo cáo thành công', 'Báo cáo hiện trường và tệp tư liệu đã được lưu trữ vĩnh viễn trên máy chủ TMC!');
        setFieldNote('');
        setMediaList([]);
      } else {
        // Fallback cập nhật offline
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
        showAppToast('warning', 'Đã lưu tạm', 'Không thể kết nối máy chủ, dữ liệu tạm lưu trên thiết bị.');
      }
    } catch {
      showAppToast('error', 'Thất bại', 'Không thể gửi báo cáo hiện trường lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepPress = (targetStep: 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (targetStep === task.step) return;

    const stepLabel = targetStep === 'RECEIVED' ? 'Đã tiếp nhận' : targetStep === 'IN_PROGRESS' ? 'Đang xử lý' : 'Hoàn thành';

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
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
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
              <Text style={[styles.stepTitle, currentStepNum >= 1 && styles.stepTitleActive]}>Đã tiếp nhận</Text>
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

        {/* Lịch sử cập nhật trạng thái (Hiển thị Trạng thái cũ ➔ Trạng thái mới) */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderWithCount}>
            <Text style={styles.sectionHeaderTitle}>Lịch sử cập nhật trạng thái</Text>
            {statusHistory.length > 0 && (
              <Text style={styles.sectionHeaderBadge}>{statusHistory.length} cập nhật</Text>
            )}
          </View>

          <ScrollView
            style={styles.statusHistoryScroll}
            contentContainerStyle={styles.statusHistoryScrollContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.timelineContainer}>
              {statusHistory.length > 0 ? (
                statusHistory.map((item, idx) => (
                  <React.Fragment key={item.id || idx}>
                    <View style={styles.timelineItem}>
                      <View style={idx === statusHistory.length - 1 ? styles.dotWithRing : styles.solidDot}>
                        {idx === statusHistory.length - 1 ? <View style={styles.innerDot} /> : null}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.statusTransitionCard}>
                          <View style={styles.statusTransitionRow}>
                            <View style={styles.statusBadgeOld}>
                              <Text style={styles.statusBadgeOldText} numberOfLines={1}>
                                {cleanStatusLabel(item.oldStatus) || 'Chờ tiếp nhận'}
                              </Text>
                            </View>
                            <Text style={styles.statusTransitionArrow}>➔</Text>
                            <View style={styles.statusBadgeNew}>
                              <Text style={styles.statusBadgeNewText} numberOfLines={1}>
                                {cleanStatusLabel(item.newStatus || item.content)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.timelineMetaRow}>
                            <Text style={styles.timelineTime}>{item.time}</Text>
                            <Text style={styles.timelineActor}>• {item.author}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    {idx < statusHistory.length - 1 && <View style={styles.verticalLine} />}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <View style={styles.timelineItem}>
                    <View style={styles.dotWithRing}>
                      <View style={styles.innerDot} />
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.statusTransitionCard}>
                        <View style={styles.statusTransitionRow}>
                          <View style={styles.statusBadgeOld}>
                            <Text style={styles.statusBadgeOldText}>Khởi tạo</Text>
                          </View>
                          <Text style={styles.statusTransitionArrow}>➔</Text>
                          <View style={styles.statusBadgeNew}>
                            <Text style={styles.statusBadgeNewText}>Đã tiếp nhận</Text>
                          </View>
                        </View>
                        <View style={styles.timelineMetaRow}>
                          <Text style={styles.timelineTime}>{formatFullDateTime(task.createdAt) || '14:20 20/04/2026'}</Text>
                          <Text style={styles.timelineActor}>• Phân công từ TMC</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {currentStepNum > 1 && (
                    <>
                      <View style={styles.verticalLine} />
                      <View style={styles.timelineItem}>
                        <View style={styles.solidDot} />
                        <View style={styles.timelineContent}>
                          <View style={styles.statusTransitionCard}>
                            <View style={styles.statusTransitionRow}>
                              <View style={styles.statusBadgeOld}>
                                <Text style={styles.statusBadgeOldText}>Đã tiếp nhận</Text>
                              </View>
                              <Text style={styles.statusTransitionArrow}>➔</Text>
                              <View style={styles.statusBadgeNew}>
                                <Text style={styles.statusBadgeNewText}>{cleanStatusLabel(statusLabel)}</Text>
                              </View>
                            </View>
                            <View style={styles.timelineMetaRow}>
                              <Text style={styles.timelineTime}>{formatFullDateTime(task.updatedAt) || '14:30 20/04/2026'}</Text>
                              <Text style={styles.timelineActor}>• Tuần kiểm tra VEC</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Cập nhật trạng thái chuẩn UI */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Cập nhật trạng thái</Text>
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
                Đã tiếp nhận
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statePillBtn, isInProgress && styles.statePillBtnActive]}
              activeOpacity={0.7}
              onPress={() => handleStepPress('IN_PROGRESS')}
            >
              <Text style={[styles.statePillText, isInProgress && styles.statePillTextActive]}>
                Đang xử lý
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statePillBtn, isCompleted && styles.statePillBtnActive]}
              activeOpacity={0.7}
              onPress={() => handleStepPress('COMPLETED')}
            >
              <Text style={[styles.statePillText, isCompleted && styles.statePillTextActive]}>
                Hoàn thành
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

          {/* Danh sách ghi nhận đã lưu trữ trên máy chủ TMC */}
          <View style={styles.pastNotesContainer}>
            <View style={styles.sectionHeaderWithCount}>
              <Text style={styles.pastNotesTitle}>Ghi nhận đã gửi về TMC</Text>
              {fieldNotes.length > 0 && (
                <Text style={styles.sectionHeaderBadge}>{fieldNotes.length} ghi nhận</Text>
              )}
            </View>

            {fieldNotes.length > 0 ? (
              <ScrollView
                style={styles.pastNotesScroll}
                contentContainerStyle={styles.pastNotesScrollContent}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {fieldNotes.map((note) => (
                  <View key={note.id} style={styles.pastNoteCard}>
                    <View style={styles.pastNoteHeader}>
                      <View style={styles.pastNoteAuthorTag}>
                        <Text style={styles.pastNoteAuthor}>{note.author}</Text>
                      </View>
                      <Text style={styles.pastNoteTime}>{note.time}</Text>
                    </View>
                    <Text style={styles.pastNoteContent}>{note.content}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyNotesCard}>
                <Text style={styles.emptyNotesText}>
                  Chưa có ghi nhận hiện trường nào được gửi về TMC cho sự cố này.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ảnh & video gửi TMC */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>Ảnh & video gửi TMC</Text>
          <Text style={styles.sectionSubDesc}>Chụp mới hoặc đính kèm từ thư viện thiết bị.</Text>

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

          {/* Danh sách tệp đính kèm mới với ảnh xem trước, progress bar và retry */}
          {mediaList.length > 0 && (
            <View style={styles.selectedMediaList}>
              {mediaList.map((item) => {
                const previewUri = item.uploadedUrl || item.uri;
                return (
                  <View key={item.id} style={styles.selectedMediaItem}>
                    <View style={styles.selectedMediaContentRow}>
                      {/* Thumbnail hình ảnh hoặc biểu tượng loại tệp */}
                      <TouchableOpacity
                        style={styles.selectedMediaThumbBox}
                        activeOpacity={0.8}
                        onPress={() =>
                          handleOpenPreview({
                            uri: previewUri,
                            name: item.name,
                            type: item.type,
                          })
                        }
                      >
                        {item.type === 'image' ? (
                          <View style={styles.thumbImageWrapper}>
                            <Image
                              source={{ uri: previewUri }}
                              style={styles.selectedMediaThumbImage}
                              resizeMode="cover"
                            />
                            <View style={styles.thumbEyeOverlay}>
                              <EyeIcon size={12} color="#ffffff" />
                            </View>
                          </View>
                        ) : item.type === 'video' ? (
                          <View style={styles.thumbIconBoxVideo}>
                            <VideoIcon size={24} color="#0284c7" />
                            <Text style={styles.thumbTypeTagVideo}>VIDEO</Text>
                          </View>
                        ) : (
                          <View style={styles.thumbIconBoxFile}>
                            <PaperclipIcon size={24} color="#d97706" />
                            <Text style={styles.thumbTypeTagFile}>TỆP</Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      {/* Thông tin chi tiết & trạng thái tệp */}
                      <View style={styles.selectedMediaDetails}>
                        <View style={styles.selectedMediaHeader}>
                          <Text style={styles.selectedMediaName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeMediaBtn}
                            activeOpacity={0.7}
                            onPress={() => handleRemoveMedia(item.id)}
                          >
                            <CloseIcon size={16} color="#94a3b8" />
                          </TouchableOpacity>
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
                              ? '✓ Đã tải lên (Sẵn sàng gửi)'
                              : `✕ Lỗi: ${item.errorMessage || 'Tải lên thất bại'}`}
                          </Text>
                          {item.size ? (
                            <Text style={styles.selectedMediaSizeText}>
                              {Math.round(item.size / 1024)} KB
                            </Text>
                          ) : null}
                        </View>

                        {/* Hàng nút bấm hành động (Xem trước / Thử lại) */}
                        <View style={styles.selectedMediaActionsRow}>
                          <TouchableOpacity
                            style={styles.previewBtnSmall}
                            activeOpacity={0.75}
                            onPress={() =>
                              handleOpenPreview({
                                uri: previewUri,
                                name: item.name,
                                type: item.type,
                              })
                            }
                          >
                            <EyeIcon size={13} color="#0284c7" />
                            <Text style={styles.previewBtnText}>Xem trước</Text>
                          </TouchableOpacity>

                          {item.status === 'error' && (
                            <TouchableOpacity
                              style={styles.retryBtn}
                              activeOpacity={0.7}
                              onPress={() => handleRetryUpload(item.id)}
                            >
                              <RefreshCwIcon size={13} color="#dc2626" />
                              <Text style={styles.retryBtnText}>Thử lại</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
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
              {task.attachments.map((item) => {
                const fileType = getAttachmentFileType(item.name, item.type);
                const typeLabel =
                  fileType === 'image'
                    ? '📸 Ảnh'
                    : fileType === 'video'
                    ? '🎬 Video'
                    : fileType === 'pdf'
                    ? '📕 PDF'
                    : fileType === 'excel'
                    ? '📊 Excel'
                    : fileType === 'word'
                    ? '📝 Word'
                    : '📄 Tệp';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.attachedItemRow}
                    activeOpacity={0.75}
                    onPress={() =>
                      handleOpenPreview({
                        uri: item.uri,
                        name: item.name,
                        type: fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : 'document',
                      })
                    }
                  >
                    <AttachmentThumbPreview uri={item.uri} name={item.name} type={item.type} />

                    <View style={styles.attachedInfoCol}>
                      <Text style={styles.attachedFileName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.attachedFileSize}>
                        {typeLabel} • {item.sizeBytes ? Math.round(item.sizeBytes / 1024) : 0} KB •{' '}
                        <Text style={styles.attachedViewLink}>Nhấn để xem</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
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

      {/* Modal xem trước ảnh / video / tài liệu */}
      <Modal
        visible={previewMediaItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewMediaItem(null)}
      >
        <View style={styles.previewModalOverlay}>
          {/* Header modal */}
          <View style={styles.previewModalHeader}>
            <Text style={styles.previewModalTitle} numberOfLines={1}>
              {previewMediaItem?.name || 'Xem trước tệp'}
            </Text>
            <View style={styles.previewModalHeaderActions}>
              {Platform.OS === 'web' && previewMediaItem?.uri && (
                <TouchableOpacity
                  style={styles.previewOpenExternalBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.open(previewMediaItem.uri, '_blank');
                    }
                  }}
                >
                  <Text style={styles.previewOpenExternalText}>Mở tab mới ↗</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.previewCloseBtn}
                activeOpacity={0.7}
                onPress={() => setPreviewMediaItem(null)}
              >
                <CloseIcon size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Vùng hiển thị nội dung tệp */}
          <View style={styles.previewContentContainer}>
            {previewMediaItem?.type === 'video' ? (
              Platform.OS === 'web' ? (
                // @ts-ignore: HTML5 video on web
                <video
                  src={previewMediaItem.uri}
                  controls
                  autoPlay
                  style={{
                    maxWidth: '92%',
                    maxHeight: '75vh',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                />
              ) : (
                <View style={styles.previewUnsupportedBox}>
                  <VideoIcon size={44} color="#0090e7" />
                  <Text style={styles.previewUnsupportedText}>
                    {previewMediaItem.name || 'Video hiện trường'}
                  </Text>
                  <TouchableOpacity
                    style={styles.previewUnsupportedBtn}
                    onPress={() => Linking.openURL(previewMediaItem.uri)}
                  >
                    <Text style={styles.previewUnsupportedBtnText}>Mở bằng trình phát ngoài</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (previewMediaItem?.type === 'file' || previewMediaItem?.type === 'document') ? (
              <View style={styles.previewUnsupportedBox}>
                <PaperclipIcon size={44} color="#d97706" />
                <Text style={styles.previewUnsupportedText}>
                  {previewMediaItem.name || 'Tài liệu / Tệp hiện trường'}
                </Text>
                <TouchableOpacity
                  style={styles.previewUnsupportedBtn}
                  onPress={() => {
                    if (Platform.OS === 'web' && typeof window !== 'undefined') {
                      window.open(previewMediaItem.uri, '_blank');
                    } else {
                      Linking.openURL(previewMediaItem.uri);
                    }
                  }}
                >
                  <Text style={styles.previewUnsupportedBtnText}>Mở xem tệp</Text>
                </TouchableOpacity>
              </View>
            ) : (
              previewMediaItem && (
                <Image
                  source={{ uri: previewMediaItem.uri }}
                  style={styles.previewFullImage}
                  resizeMode="contain"
                />
              )
            )}
          </View>
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
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 6,
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
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  colValue: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 6,
  },
  descBubble: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
  },
  descText: {
    fontFamily: FONT_FAMILY,
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
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
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
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
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
    width: '100%',
    height: '100%',
  },
  attachedThumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachedIconPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedThumbBoxImage: {
    backgroundColor: '#e0f2fe',
  },
  thumbTypeTagImage: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284c7',
    marginTop: 2,
  },
  attachedThumbBoxVideo: {
    backgroundColor: '#e0f2fe',
  },
  attachedThumbBoxPdf: {
    backgroundColor: '#fee2e2',
  },
  attachedThumbBoxExcel: {
    backgroundColor: '#dcfce7',
  },
  attachedThumbBoxWord: {
    backgroundColor: '#dbeafe',
  },
  attachedThumbBoxZip: {
    backgroundColor: '#f3e8ff',
  },
  thumbTypeTagPdf: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dc2626',
    marginTop: 2,
  },
  thumbTypeTagExcel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 2,
  },
  thumbTypeTagWord: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563eb',
    marginTop: 2,
  },
  thumbTypeTagZip: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9333ea',
    marginTop: 2,
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
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'space-between',
  },
  previewModalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 10,
  },
  previewModalTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  previewModalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewOpenExternalBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  previewOpenExternalText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  previewCloseBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  previewContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  previewFullImage: {
    width: '96%',
    height: '86%',
  },
  previewUnsupportedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    maxWidth: '85%',
  },
  previewUnsupportedText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  previewUnsupportedBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0284c7',
    borderRadius: 8,
  },
  previewUnsupportedBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
    gap: 10,
  },
  selectedMediaItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedMediaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedMediaThumbBox: {
    width: 62,
    height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedMediaThumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbEyeOverlay: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    padding: 3,
  },
  thumbIconBoxVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIconBoxFile: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbTypeTagVideo: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284c7',
    marginTop: 2,
  },
  thumbTypeTagFile: {
    fontSize: 9,
    fontWeight: '800',
    color: '#d97706',
    marginTop: 2,
  },
  selectedMediaDetails: {
    flex: 1,
    marginLeft: 10,
  },
  selectedMediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedMediaName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 6,
  },
  removeMediaBtn: {
    padding: 2,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0090e7',
    borderRadius: 2,
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
    fontSize: 10,
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
    fontSize: 10,
    color: '#94a3b8',
  },
  selectedMediaActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  previewBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
  },
  previewBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
  },

  attachedViewLink: {
    color: '#0284c7',
    fontWeight: '600',
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
  pastNotesContainer: {
    marginTop: 16,
    gap: 10,
  },
  pastNotesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  pastNoteCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pastNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pastNoteAuthorTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pastNoteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  pastNoteTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  pastNoteContent: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  emptyNotesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyNotesText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  statusTransitionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 2,
  },
  statusTransitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBadgeOld: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusBadgeOldText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statusTransitionArrow: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284c7',
  },
  statusBadgeNew: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statusBadgeNewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  sectionHeaderWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHeaderBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusHistoryScroll: {
    maxHeight: 280,
    marginTop: 4,
  },
  statusHistoryScrollContent: {
    paddingRight: 6,
    paddingBottom: 6,
  },
  pastNotesScroll: {
    maxHeight: 260,
    marginTop: 4,
  },
  pastNotesScrollContent: {
    gap: 10,
    paddingRight: 6,
    paddingBottom: 6,
  },
});

