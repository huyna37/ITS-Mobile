import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/navigation/types';
import { FloatingSOS, AppToast } from './src/components/common';
import { useAuthStore } from './src/store/useAuthStore';
import { COLORS } from './src/constants/colors';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['itsmobile://', 'http://localhost:5173', 'https://its.vec.vn'],
  config: {
    screens: {
      AuthStack: 'login',
      MainTabs: {
        screens: {
          TasksTab: 'tasks',
          ContactsTab: 'contacts',
          NotificationsTab: 'notifications',
          ProfileTab: 'profile',
        },
      },
      TaskDetail: 'tasks/:task' as any,
    },
  },
};

export default function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (Platform.OS === 'android') {
      const sb = StatusBar as any;
      sb.setTranslucent?.(true);
      sb.setBackgroundColor?.('transparent');
    }
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer linking={linking}>
        <View style={styles.container}>
          <RootNavigator />
          {/* Nút cứu hộ khẩn cấp SOS luôn hiển thị nổi khi đã đăng nhập tác nghiệp */}
          {isAuthenticated ? <FloatingSOS /> : null}
          {/* Hệ thống Toast & Dialog thông báo nổi cao cấp */}
          <AppToast />
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
