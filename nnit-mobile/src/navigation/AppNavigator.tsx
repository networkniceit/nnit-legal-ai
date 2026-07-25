import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../utils/ThemeContext';
// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import TranscriptionScreen from '../screens/TranscriptionScreen';
import ClientManagementScreen from '../screens/ClientManagementScreen';
import {
  ComplianceScreen,
  CasesScreen,
  PaymentsScreen,
  VoiceScreen,
  PortalScreen,
  SettingsScreen,
  TemplatesScreen,
  ContractsScreen,
} from '../screens/OtherScreens';
import {
  RiskAssessmentScreen,
  DeadlinesScreen,
  PartiesScreen,
  UploadScreen,
  CameraScreen,
  VoiceReaderScreen,
  SavedDocsScreen,
  ScheduleScreen,
  MeetingHistoryScreen,
} from '../screens/MissingScreens';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.bgCard,
      text: colors.textPrimary,
      border: colors.border,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Dashboard"       component={DashboardScreen} />
        <Stack.Screen name="Chat"            component={ChatScreen} />
        <Stack.Screen name="Meetings"        component={MeetingsScreen} />
        <Stack.Screen name="Documents"       component={DocumentsScreen} />
        <Stack.Screen name="Transcription"   component={TranscriptionScreen} />
        <Stack.Screen name="Clients"         component={ClientManagementScreen} />
        <Stack.Screen name="Compliance"      component={ComplianceScreen} />
        <Stack.Screen name="Cases"           component={CasesScreen} />
        <Stack.Screen name="Payments"        component={PaymentsScreen} />
        <Stack.Screen name="Voice"           component={VoiceScreen} />
        <Stack.Screen name="Portal"          component={PortalScreen} />
        <Stack.Screen name="Settings"        component={SettingsScreen} />
        <Stack.Screen name="Templates"       component={TemplatesScreen} />
        <Stack.Screen name="Contracts"       component={ContractsScreen} />
        <Stack.Screen name="Camera"          component={CameraScreen} />
        <Stack.Screen name="Upload"          component={UploadScreen} />
        <Stack.Screen name="RiskAssessment"  component={RiskAssessmentScreen} />
        <Stack.Screen name="Deadlines"       component={DeadlinesScreen} />
        <Stack.Screen name="Parties"         component={PartiesScreen} />
        <Stack.Screen name="VoiceReader"     component={VoiceReaderScreen} />
        <Stack.Screen name="SavedDocs"       component={SavedDocsScreen} />
        <Stack.Screen name="Schedule"        component={ScheduleScreen} />
        <Stack.Screen name="MeetingHistory"  component={MeetingHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
