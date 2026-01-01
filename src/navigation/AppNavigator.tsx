import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

// Import screens (we'll create these next)
import HomeScreen from '../screens/home/HomeScreen';
import TVIdentifyScreen from '../screens/calibration/TVIdentifyScreen';
import EnvironmentScreen from '../screens/calibration/EnvironmentScreen';
import SettingsEntryScreen from '../screens/calibration/SettingsEntryScreen';
import PatternDisplayScreen from '../screens/calibration/PatternDisplayScreen';
import CaptureScreen from '../screens/calibration/CaptureScreen';
import ResultsScreen from '../screens/calibration/ResultsScreen';
import SessionCompleteScreen from '../screens/calibration/SessionCompleteScreen';
import CheckpointHistoryScreen from '../screens/calibration/CheckpointHistoryScreen';

// Type definitions for navigation
export type RootStackParamList = {
  Main: undefined;
  // Calibration flow
  TVIdentify: undefined;
  Environment: undefined;
  SettingsEntry: undefined;
  PatternDisplay: { patternSlug: string };
  Capture: { patternSlug: string };
  Results: { patternSlug: string };
  SessionComplete: undefined;
  CheckpointHistory: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MyTVs: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for tabs we haven't built yet
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, color: '#666' }}>{title}</Text>
    <Text style={{ fontSize: 14, color: '#999', marginTop: 8 }}>Coming soon</Text>
  </View>
);

const MyTVsScreen = () => <PlaceholderScreen title="My TVs" />;
const AppSettingsScreen = () => <PlaceholderScreen title="Settings" />;

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2a2a4e',
        },
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Calibrate',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📺</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyTVs"
        component={MyTVsScreen}
        options={{
          tabBarLabel: 'My TVs',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AppSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main app navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#0f0f1a',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Calibration Flow */}
        <Stack.Screen
          name="TVIdentify"
          component={TVIdentifyScreen}
          options={{ title: 'Identify Your TV' }}
        />
        <Stack.Screen
          name="Environment"
          component={EnvironmentScreen}
          options={{ title: 'Your Setup' }}
        />
        <Stack.Screen
          name="SettingsEntry"
          component={SettingsEntryScreen}
          options={{ title: 'Current Settings' }}
        />
        <Stack.Screen
          name="PatternDisplay"
          component={PatternDisplayScreen}
          options={{ title: 'Display Pattern' }}
        />
        <Stack.Screen
          name="Capture"
          component={CaptureScreen}
          options={{ title: 'Capture Pattern' }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Analysis' }}
        />
        <Stack.Screen
          name="SessionComplete"
          component={SessionCompleteScreen}
          options={{ title: 'Calibration Complete', headerBackVisible: false }}
        />
        <Stack.Screen
          name="CheckpointHistory"
          component={CheckpointHistoryScreen}
          options={{ title: 'Settings History' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
