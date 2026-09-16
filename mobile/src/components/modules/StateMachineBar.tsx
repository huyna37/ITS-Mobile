import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TaskStep } from '../../types/tasks';

interface StateMachineBarProps {
  currentStep: TaskStep;
}

const STEPS: { key: TaskStep; label: string; num: string }[] = [
  { key: 'RECEIVED', label: 'Đã nhận', num: '1' },
  { key: 'IN_PROGRESS', label: 'Đang xử lý', num: '2' },
  { key: 'COMPLETED', label: 'Hoàn thành', num: '3' },
];

export const StateMachineBar: React.FC<StateMachineBarProps> = ({ currentStep }) => {
  const getStepStatus = (stepKey: TaskStep) => {
    if (currentStep === 'COMPLETED') return 'done';
    if (currentStep === 'IN_PROGRESS') {
      if (stepKey === 'RECEIVED') return 'done';
      if (stepKey === 'IN_PROGRESS') return 'active';
      return 'pending';
    }
    // currentStep === 'RECEIVED'
    if (stepKey === 'RECEIVED') return 'active';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TIẾN ĐỘ XỬ LÝ TUẦN TỰ (3 BƯỚC)</Text>
      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.key);
          const isDone = status === 'done';
          const isActive = status === 'active';

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.circleDone,
                    isActive && styles.circleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      (isDone || isActive) && styles.circleTextActive,
                    ]}
                  >
                    {isDone ? '✓' : step.num}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (isDone || isActive) && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    (isDone || (isActive && currentStep === 'IN_PROGRESS' && index === 0)) &&
                      styles.lineActive,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 80,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  circleDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.successDark,
  },
  circleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  circleTextActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray500,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.gray900,
    fontWeight: '700',
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.gray200,
    marginHorizontal: -8,
    marginTop: -20,
  },
  lineActive: {
    backgroundColor: COLORS.success,
  },
});
