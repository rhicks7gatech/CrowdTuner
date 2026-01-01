import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { useCalibrationStore } from '../../store/useCalibrationStore';
import type { Settings, TVSettingMetadata } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingInputProps {
  setting: TVSettingMetadata;
  value: string;
  onChange: (value: string) => void;
}

const SettingInput = ({ setting, value, onChange }: SettingInputProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.settingItem}>
      <TouchableOpacity
        style={styles.settingHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.settingInfo}>
          <Text style={styles.settingName}>{setting.settingName}</Text>
          {setting.rangeMin !== undefined && setting.rangeMax !== undefined && (
            <Text style={styles.settingRange}>
              ({setting.rangeMin} - {setting.rangeMax})
            </Text>
          )}
        </View>
        <TextInput
          style={styles.settingInput}
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          placeholder={setting.defaultValue?.toString() || '?'}
          placeholderTextColor="#666"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.settingDetails}>
          {setting.actualFunction && (
            <Text style={styles.settingFunction}>
              💡 {setting.actualFunction}
            </Text>
          )}
          {setting.menuPath && setting.menuPath.length > 0 && (
            <Text style={styles.settingPath}>
              📍 {setting.menuPath.join(' → ')}
            </Text>
          )}
          {setting.defaultValue !== undefined && (
            <Text style={styles.settingDefault}>
              Default: {setting.defaultValue}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default function SettingsEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    tvModel,
    tvSettings,
    startSession,
    environment,
  } = useCalibrationStore();

  // Initialize settings state from tvSettings defaults
  const [settingValues, setSettingValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    tvSettings
      .filter((s) => s.settingCategory === 'basic')
      .forEach((s) => {
        initial[s.settingName] = s.defaultValue?.toString() || '';
      });
    return initial;
  });

  const basicSettings = tvSettings.filter((s) => s.settingCategory === 'basic');
  const advancedSettings = tvSettings.filter((s) => s.settingCategory === 'advanced');

  const handleSettingChange = (settingName: string, value: string) => {
    setSettingValues((prev) => ({
      ...prev,
      [settingName]: value,
    }));
  };

  const handleContinue = () => {
    if (!tvModel || !environment) return;

    // Convert string values to numbers where applicable
    const settings: Settings = {};
    Object.entries(settingValues).forEach(([key, value]) => {
      const numValue = parseFloat(value);
      settings[key.toLowerCase().replace(/\s+/g, '_')] = isNaN(numValue)
        ? value
        : numValue;
    });

    // Start the session with baseline settings
    startSession({
      tvModel,
      tvSettings,
      environment,
      mode: 'full_calibration', // TODO: Get from earlier selection
      initialSettings: settings,
    });

    // Navigate to first pattern
    navigation.navigate('PatternDisplay', { patternSlug: 'black-level' });
  };

  const isComplete = basicSettings.every(
    (s) => settingValues[s.settingName]?.trim() !== ''
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instructions}>
          Enter your current picture settings. This helps us track what changes
          we make and lets you go back if needed.
        </Text>

        {/* TV Info */}
        {tvModel && (
          <View style={styles.tvInfo}>
            <Text style={styles.tvName}>{tvModel.displayName}</Text>
            <Text style={styles.tvPath}>
              📍 {basicSettings[0]?.menuPath?.join(' → ') || 'Settings → Picture'}
            </Text>
          </View>
        )}

        {/* Basic Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Picture Settings</Text>
          <Text style={styles.sectionDescription}>
            Tap any setting name to see more info and where to find it.
          </Text>

          {basicSettings.map((setting) => (
            <SettingInput
              key={setting.id}
              setting={setting}
              value={settingValues[setting.settingName] || ''}
              onChange={(value) => handleSettingChange(setting.settingName, value)}
            />
          ))}
        </View>

        {/* Help */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 Tip</Text>
          <Text style={styles.helpText}>
            Don't worry if you're not sure about exact values - enter your best
            guess. We can adjust as we go, and you can always rollback to any
            previous state.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !isComplete && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isComplete}
        >
          <Text style={styles.continueButtonText}>
            {isComplete ? 'Start Calibration' : 'Enter all settings to continue'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.checkpointNote}>
          ✓ Your current settings will be saved as a checkpoint
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  tvInfo: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  tvName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  tvPath: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    overflow: 'hidden',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  settingRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingInput: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    width: 80,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingDetails: {
    backgroundColor: '#0f0f1a',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  settingFunction: {
    fontSize: 14,
    color: '#6c63ff',
    marginBottom: 8,
  },
  settingPath: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  settingDefault: {
    fontSize: 14,
    color: '#666',
  },
  helpCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c63ff',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#3a3a5e',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkpointNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
});
