import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { FloatingSOS } from './src/components/common/FloatingSOS';
import { useAuthStore } from './src/store/useAuthStore';
import { COLORS } from './src/constants/colors';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer>
        <View style={styles.container}>
          <RootNavigator />
          {/* Nút cứu hộ khẩn cấp SOS luôn hiển thị nổi khi đã đăng nhập tác nghiệp */}
          {isAuthenticated ? <FloatingSOS /> : null}
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
});
