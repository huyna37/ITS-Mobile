import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { useAuthStore } from '../store/useAuthStore';
import { initStorage } from '../utils/storage';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await initStorage();
      restoreSession();
      if (active) {
        setIsReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [restoreSession]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ presentation: 'card' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
