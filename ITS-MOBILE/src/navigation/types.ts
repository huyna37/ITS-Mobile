import { NavigatorScreenParams } from '@react-navigation/native';
import { IncidentTask } from '../types/tasks';

export type MainTabParamList = {
  ContactsTab: undefined;
  TasksTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  TaskDetail: { task: IncidentTask };
};

export type AuthStackParamList = {
  Login: undefined;
};
