import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { OtaCheckResult, downloadAndApplyOta, reloadApp } from '../../services/otaService';

interface OtaUpdateModalProps {
  visible: boolean;
  updateInfo: OtaCheckResult | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OtaUpdateModal: React.FC<OtaUpdateModalProps> = ({
  visible,
  updateInfo,
  onClose,
  onSuccess,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);
  const [isReadyToReload, setIsReadyToReload] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!updateInfo) return null;

  const handleStartUpdate = async () => {
    setDownloading(true);
    setErrorMsg(null);
    setProgress(0);

    try {
      await downloadAndApplyOta(
        updateInfo.bundleUrl,
        updateInfo.latestVersion,
        (p) => {
          setProgress(p.percent);
          setDownloadedMB(Number((p.downloadedBytes / (1024 * 1024)).toFixed(2)));
          setTotalMB(Number((p.totalBytes / (1024 * 1024)).toFixed(2)));
        }
      );
      setIsReadyToReload(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải bản cập nhật thất bại';
      setErrorMsg(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleReload = async () => {
    onSuccess?.();
    await reloadApp();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⚡</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Cập nhật trực tuyến (OTA)</Text>
              <Text style={styles.subtitle}>
                Bản phát hành mới v{updateInfo.latestVersion}
              </Text>
            </View>
          </View>

          {/* Badge & Info */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Không cần cài lại APK</Text>
            </View>
            <Text style={styles.releaseDate}>Ngày: {updateInfo.releaseDate}</Text>
          </View>

          {/* Changelog */}
          <View style={styles.changelogBox}>
            <Text style={styles.changelogTitle}>Nội dung cập nhật:</Text>
            <Text style={styles.changelogText}>{updateInfo.changeLog}</Text>
          </View>

          {/* Progress or Status */}
          {downloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressPercent}>{progress}%</Text>
                <Text style={styles.progressBytes}>
                  {downloadedMB} MB / {totalMB || '2.4'} MB
                </Text>
              </View>
            </View>
          )}

          {isReadyToReload && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                ✓ Đã tải xong! Bấm áp dụng để tải lại giao diện tức thì.
              </Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {!isReadyToReload && !updateInfo.mandatory && !downloading && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={onClose}
              >
                <Text style={styles.buttonSecondaryText}>Để sau</Text>
              </TouchableOpacity>
            )}

            {isReadyToReload ? (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleReload}
              >
                <Text style={styles.buttonPrimaryText}>Áp dụng & Tải lại ngay</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  downloading && styles.buttonDisabled,
                ]}
                onPress={handleStartUpdate}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Cập nhật ngay</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2545',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  releaseDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  changelogBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  changelogTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  changelogText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  progressBytes: {
    fontSize: 11,
    color: '#64748B',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#F1F5F9',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
